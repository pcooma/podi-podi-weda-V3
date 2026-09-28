/**
 * Podi Podi Weda — Google Drive-first Apps Script backend.
 *
 * Authentication: Firebase email/password. Apps Script verifies Firebase ID
 * tokens with Google's Identity Toolkit API. Passwords are never stored here.
 *
 * Required Script Properties:
 *   FIREBASE_WEB_API_KEY
 *   ADMIN_KEY
 * Optional overrides (defaults point to the owner's prepared Drive structure):
 *   ROOT_FOLDER_ID, USERS_FOLDER_ID, DB_SPREADSHEET_ID, MAX_UPLOAD_BYTES
 */

const BUILD = '2026-09-28-drive-v1';
const DEFAULTS = Object.freeze({
  ROOT_FOLDER_ID: '1zwnXP1BQJudpeQSGpUPOob5GpEUL3mH5',
  USERS_FOLDER_ID: '193a7fFJaV9QfzK5QZj9jQ95U1OQ_-oVk',
  DB_SPREADSHEET_ID: '1ubk-WwfgWXnWL_y9LQ0s6Di1UjYsl74B1RFDQiLOSrs',
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024
});

const TABS = Object.freeze({
  USERS: 'DB_Users',
  DOCUMENTS: 'DB_Documents',
  JOBS: 'DB_Jobs',
  BOOKINGS: 'DB_Bookings',
  AUDIT: 'DB_Audit'
});

const HEADERS = Object.freeze({
  DB_Users: ['user_uid','firebase_uid','email','username','display_name','roles_json','status','district','category','skills_json','phone','experience_years','rate_lkr','profile_folder_id','profile_json_file_id','created_at','updated_at'],
  DB_Documents: ['document_id','user_uid','document_type','original_filename','mime_type','size_bytes','drive_file_id','status','created_at'],
  DB_Jobs: ['job_id','client_uid','category','description','district','urgency','budget_lkr','requested_date','job_size','workers_needed','materials_by','access_slots_json','status','created_at','updated_at'],
  DB_Bookings: ['booking_id','job_id','client_uid','provider_uid','status','agreed_amount_lkr','created_at','updated_at'],
  DB_Audit: ['audit_id','actor_uid','action','target_type','target_id','metadata_json','created_at']
});

const USER_SUBFOLDERS = Object.freeze([
  '00_PROFILE_AND_CONSENT',
  '01_IDENTITY_PRIVATE',
  '02_QUALIFICATIONS_CERTIFICATIONS',
  '03_SKILLS_AND_WORK_HISTORY',
  '04_PORTFOLIO',
  '05_BOOKINGS_REVIEWS',
  '06_PAYMENTS_COMMISSIONS',
  '07_COMPLIANCE_INCIDENTS',
  '99_AUDIT_EXPORTS'
]);

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health');
  if (action === 'health') return json_({ok: true, build: BUILD, time: new Date().toISOString()});
  return json_({ok: false, error: 'Use POST for this action.'});
}

function doPost(e) {
  let request;
  try {
    request = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (error) {
    return json_({ok: false, error: 'Invalid JSON request.'});
  }

  const action = clean_(request.action, 60);
  try {
    if (action === 'health') return json_({ok: true, build: BUILD, time: new Date().toISOString()});
    if (action === 'admin_setup') {
      requireAdmin_(request.adminKey);
      return json_({ok: true, data: setup()});
    }
    if (action === 'admin_set_provider_status') {
      requireAdmin_(request.adminKey);
      return json_({ok: true, data: setProviderStatus_(request.payload || {})});
    }

    const identity = verifyFirebaseToken_(request.idToken);
    const payload = request.payload || {};
    let result;
    switch (action) {
      case 'get_me': result = getMe_(identity); break;
      case 'save_profile': result = saveProfile_(identity, payload); break;
      case 'upload_document': result = uploadDocument_(identity, payload); break;
      case 'list_documents': result = listDocuments_(identity); break;
      case 'submit_job': result = submitJob_(identity, payload); break;
      case 'search_providers': result = searchProviders_(identity, payload); break;
      case 'create_booking': result = createBooking_(identity, payload); break;
      default: throw new Error('Unknown action.');
    }
    return json_({ok: true, data: result});
  } catch (error) {
    console.error(action + ': ' + error.stack);
    return json_({ok: false, error: error.message || 'Request failed.'});
  }
}

function setup() {
  const ss = database_();
  Object.keys(HEADERS).forEach(function(name) { sheet_(name); });
  const root = DriveApp.getFolderById(setting_('ROOT_FOLDER_ID'));
  const users = DriveApp.getFolderById(setting_('USERS_FOLDER_ID'));
  return {
    build: BUILD,
    spreadsheetId: ss.getId(),
    rootFolderId: root.getId(),
    usersFolderId: users.getId(),
    tabs: Object.keys(HEADERS)
  };
}

// Run from the Apps Script editor after a provider has registered. This is an
// owner/admin action performed inside Apps Script, not a public web endpoint.
function approveProvider(userUid) {
  return setProviderStatus_({userUid: String(userUid || '').trim(), status: 'approved'});
}

function getMe_(identity) {
  const row = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
  return row ? publicOwnProfile_(row) : null;
}

function saveProfile_(identity, input) {
  requireVerifiedEmail_(identity);
  const profile = validateProfile_(input);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const usersSheet = sheet_(TABS.USERS);
    const existing = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
    const usernameConflict = rows_(TABS.USERS).some(function(row) {
      return row.username === profile.username && row.firebase_uid !== identity.localId;
    });
    if (usernameConflict) throw new Error('That username is already in use.');

    const now = new Date().toISOString();
    const userUid = existing ? existing.user_uid : Utilities.getUuid();
    const folderInfo = ensureUserFolder_(identity.localId, profile.username, existing && existing.profile_folder_id);
    const record = {
      schema_version: 1,
      user_uid: userUid,
      firebase_uid: identity.localId,
      email: identity.email,
      username: profile.username,
      display_name: profile.displayName,
      roles: ['provider'],
      status: existing ? existing.status : 'pending_review',
      district: profile.district,
      category: profile.category,
      skills: profile.skills,
      phone: profile.phone,
      experience_years: profile.experienceYears,
      rate_lkr: profile.rateLkr,
      evidence_summary: profile.evidenceSummary,
      preferred_language: profile.preferredLanguage,
      created_at: existing ? existing.created_at : now,
      updated_at: now
    };
    const profileFile = upsertJsonFile_(folderInfo.profileFolder, 'profile.json', record);
    const sheetRecord = {
      user_uid: userUid,
      firebase_uid: identity.localId,
      email: identity.email,
      username: profile.username,
      display_name: profile.displayName,
      roles_json: JSON.stringify(record.roles),
      status: record.status,
      district: profile.district,
      category: profile.category,
      skills_json: JSON.stringify(profile.skills),
      phone: profile.phone,
      experience_years: profile.experienceYears,
      rate_lkr: profile.rateLkr,
      profile_folder_id: folderInfo.userFolder.getId(),
      profile_json_file_id: profileFile.getId(),
      created_at: record.created_at,
      updated_at: now
    };
    upsert_(usersSheet, 'firebase_uid', identity.localId, sheetRecord);
    audit_(userUid, 'profile.upsert', 'user', userUid, {status: record.status});
    CacheService.getScriptCache().remove('approved_providers');
    return publicOwnProfile_(sheetRecord);
  } finally {
    lock.releaseLock();
  }
}

function uploadDocument_(identity, input) {
  requireVerifiedEmail_(identity);
  const user = requireUser_(identity.localId);
  const allowedTypes = ['nic_front','nic_back','selfie','certificate','business_registration','licence','reference','portfolio'];
  const type = clean_(input.type, 40);
  if (allowedTypes.indexOf(type) < 0) throw new Error('Unsupported document type.');
  const mime = clean_(input.mimeType, 80);
  const allowedMime = ['image/jpeg','image/png','image/webp','application/pdf'];
  if (allowedMime.indexOf(mime) < 0) throw new Error('Unsupported file type.');
  const filename = safeFilename_(input.filename);
  const base64 = String(input.base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!base64) throw new Error('File content is required.');
  const bytes = Utilities.base64Decode(base64);
  const maxBytes = Number(setting_('MAX_UPLOAD_BYTES'));
  if (bytes.length > maxBytes) throw new Error('File is too large. Maximum is ' + Math.floor(maxBytes / 1048576) + ' MB.');
  validateMagicBytes_(bytes, mime);

  const userFolder = DriveApp.getFolderById(user.profile_folder_id);
  const targetName = type === 'portfolio' ? '04_PORTFOLIO' :
    (type === 'certificate' || type === 'licence' || type === 'reference' || type === 'business_registration')
      ? '02_QUALIFICATIONS_CERTIFICATIONS' : '01_IDENTITY_PRIVATE';
  const folder = childFolder_(userFolder, targetName);
  const documentId = Utilities.getUuid();
  const file = folder.createFile(Utilities.newBlob(bytes, mime, documentId + '-' + filename));
  const record = {
    document_id: documentId,
    user_uid: user.user_uid,
    document_type: type,
    original_filename: filename,
    mime_type: mime,
    size_bytes: bytes.length,
    drive_file_id: file.getId(),
    status: 'submitted',
    created_at: new Date().toISOString()
  };
  appendObject_(sheet_(TABS.DOCUMENTS), record);
  audit_(user.user_uid, 'document.upload', 'document', documentId, {type: type, size: bytes.length});
  return {id: documentId, type: type, filename: filename, status: 'submitted'};
}

function listDocuments_(identity) {
  const user = requireUser_(identity.localId);
  return rows_(TABS.DOCUMENTS).filter(function(row) { return row.user_uid === user.user_uid; }).map(function(row) {
    return {id: row.document_id, type: row.document_type, filename: row.original_filename, status: row.status, createdAt: row.created_at};
  });
}

function submitJob_(identity, input) {
  requireVerifiedEmail_(identity);
  const now = new Date().toISOString();
  const record = {
    job_id: Utilities.getUuid(),
    client_uid: identity.localId,
    category: clean_(input.category, 80),
    description: clean_(input.description, 2000),
    district: clean_(input.district, 80),
    urgency: clean_(input.urgency, 30),
    budget_lkr: number_(input.budgetLkr, 0, 100000000),
    requested_date: clean_(input.requestedDate, 20),
    job_size: clean_(input.jobSize, 30),
    workers_needed: number_(input.workersNeeded, 1, 20),
    materials_by: clean_(input.materialsBy, 40),
    access_slots_json: JSON.stringify(array_(input.accessSlots, 10, 30)),
    status: 'matching',
    created_at: now,
    updated_at: now
  };
  if (!record.category || !record.district) throw new Error('Category and district are required.');
  appendObject_(sheet_(TABS.JOBS), record);
  audit_(identity.localId, 'job.create', 'job', record.job_id, {category: record.category, district: record.district});
  return {id: record.job_id, status: record.status, createdAt: now};
}

function searchProviders_(identity, input) {
  requireVerifiedEmail_(identity);
  const category = clean_(input.category, 80);
  const district = clean_(input.district, 80);
  return approvedProviders_().filter(function(row) {
    return (!category || row.category === category) && (!district || row.district === district);
  }).slice(0, 50).map(publicProvider_);
}

function createBooking_(identity, input) {
  requireVerifiedEmail_(identity);
  const job = findBy_(TABS.JOBS, 'job_id', clean_(input.jobId, 80));
  if (!job || job.client_uid !== identity.localId) throw new Error('Job not found.');
  const provider = findBy_(TABS.USERS, 'user_uid', clean_(input.providerUid, 80));
  if (!provider || provider.status !== 'approved') throw new Error('Provider is not available.');
  const now = new Date().toISOString();
  const record = {
    booking_id: Utilities.getUuid(), job_id: job.job_id, client_uid: identity.localId,
    provider_uid: provider.user_uid, status: 'requested',
    agreed_amount_lkr: number_(input.agreedAmountLkr, 0, 100000000), created_at: now, updated_at: now
  };
  appendObject_(sheet_(TABS.BOOKINGS), record);
  updateBy_(sheet_(TABS.JOBS), 'job_id', job.job_id, {status: 'booking_requested', updated_at: now});
  audit_(identity.localId, 'booking.create', 'booking', record.booking_id, {jobId: job.job_id, providerUid: provider.user_uid});
  return {id: record.booking_id, status: record.status};
}

function setProviderStatus_(input) {
  const allowed = ['pending_review','approved','suspended','rejected'];
  const status = clean_(input.status, 30);
  if (allowed.indexOf(status) < 0) throw new Error('Invalid provider status.');
  const userUid = clean_(input.userUid, 80);
  const row = findBy_(TABS.USERS, 'user_uid', userUid);
  if (!row) throw new Error('User not found.');
  updateBy_(sheet_(TABS.USERS), 'user_uid', userUid, {status: status, updated_at: new Date().toISOString()});
  const file = DriveApp.getFileById(row.profile_json_file_id);
  const profile = JSON.parse(file.getBlob().getDataAsString());
  profile.status = status;
  profile.updated_at = new Date().toISOString();
  file.setContent(JSON.stringify(profile, null, 2));
  audit_('admin', 'provider.status', 'user', userUid, {status: status});
  CacheService.getScriptCache().remove('approved_providers');
  return {userUid: userUid, status: status};
}

function verifyFirebaseToken_(idToken) {
  if (!idToken) throw new Error('Authentication required.');
  const key = setting_('FIREBASE_WEB_API_KEY');
  const response = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(key), {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({idToken: idToken})
  });
  if (response.getResponseCode() !== 200) throw new Error('Invalid or expired login.');
  const body = JSON.parse(response.getContentText());
  const user = body.users && body.users[0];
  if (!user || !user.localId) throw new Error('Invalid login.');
  return {localId: user.localId, email: String(user.email || '').toLowerCase(), emailVerified: user.emailVerified === true};
}

function requireVerifiedEmail_(identity) {
  if (!identity.emailVerified) throw new Error('Please verify your email before continuing.');
}

function validateProfile_(input) {
  const username = clean_(input.username, 30).toLowerCase();
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) throw new Error('Username must use 3–30 English letters, numbers, dots, underscores or dashes.');
  const phone = clean_(input.phone, 20).replace(/\s+/g, '');
  if (!/^07\d{8}$/.test(phone)) throw new Error('Phone number must use 07XXXXXXXX format.');
  const displayName = clean_(input.displayName, 150);
  const district = clean_(input.district, 80);
  const category = clean_(input.category, 80);
  if (displayName.length < 2 || !district || !category) throw new Error('Name, district and category are required.');
  return {
    username: username, phone: phone, displayName: displayName, district: district, category: category,
    skills: array_(input.skills, 30, 100), experienceYears: number_(input.experienceYears, 0, 80),
    rateLkr: number_(input.rateLkr, 0, 100000000), evidenceSummary: clean_(input.evidenceSummary, 2000),
    preferredLanguage: ['si','ta','en'].indexOf(input.preferredLanguage) >= 0 ? input.preferredLanguage : 'si'
  };
}

function ensureUserFolder_(firebaseUid, username, existingFolderId) {
  let userFolder = null;
  if (existingFolderId) {
    try { userFolder = DriveApp.getFolderById(existingFolderId); } catch (error) {}
  }
  if (!userFolder) {
    const parent = DriveApp.getFolderById(setting_('USERS_FOLDER_ID'));
    const name = 'USR-' + firebaseUid.slice(0, 12).replace(/[^A-Za-z0-9_-]/g, '') + '__' + username;
    userFolder = childFolder_(parent, name);
  }
  USER_SUBFOLDERS.forEach(function(name) { childFolder_(userFolder, name); });
  return {userFolder: userFolder, profileFolder: childFolder_(userFolder, '00_PROFILE_AND_CONSENT')};
}

function childFolder_(parent, name) {
  const iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}

function upsertJsonFile_(folder, name, value) {
  const content = JSON.stringify(value, null, 2);
  const iter = folder.getFilesByName(name);
  const file = iter.hasNext() ? iter.next() : folder.createFile(name, content, MimeType.PLAIN_TEXT);
  file.setContent(content);
  return file;
}

function approvedProviders_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('approved_providers');
  if (cached) return JSON.parse(cached);
  const records = rows_(TABS.USERS).filter(function(row) { return row.status === 'approved'; });
  cache.put('approved_providers', JSON.stringify(records), 300);
  return records;
}

function publicProvider_(row) {
  return {
    id: row.user_uid, username: row.username, name: row.display_name, category: row.category,
    district: row.district, skills: jsonArray_(row.skills_json), experience: Number(row.experience_years || 0),
    rate: Number(row.rate_lkr || 0), approved: true, tier: 't2_profile', availability: 'available',
    rating: 0, ratingCount: 0, jobsCompleted: 0, responseRate: 0.6, teamSize: 1,
    availableSlots: ['morning','lunch','evening'], supplyCapabilities: ['labour_only'],
    portfolio: 'Verified provider profile'
  };
}

function publicOwnProfile_(row) {
  return {
    user_uid: row.user_uid, email: row.email, username: row.username, display_name: row.display_name,
    roles: jsonArray_(row.roles_json), status: row.status, district: row.district,
    provider_category: row.category, skills: jsonArray_(row.skills_json), contact_phone: row.phone,
    experience_years: Number(row.experience_years || 0), rate_lkr: Number(row.rate_lkr || 0)
  };
}

function requireUser_(firebaseUid) {
  const user = findBy_(TABS.USERS, 'firebase_uid', firebaseUid);
  if (!user) throw new Error('Create your profile first.');
  return user;
}

function database_() { return SpreadsheetApp.openById(setting_('DB_SPREADSHEET_ID')); }

function sheet_(name) {
  const ss = database_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  const headers = HEADERS[name];
  if (!headers) throw new Error('Unknown database tab.');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#173b31').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function rows_(name) {
  const sheet = sheet_(name);
  const headers = HEADERS[name];
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues().map(function(values) {
    const row = {};
    headers.forEach(function(header, index) { row[header] = values[index] instanceof Date ? values[index].toISOString() : values[index]; });
    return row;
  });
}

function findBy_(name, field, value) { return rows_(name).find(function(row) { return String(row[field]) === String(value); }) || null; }

function appendObject_(sheet, record) {
  const headers = HEADERS[sheet.getName()];
  sheet.appendRow(headers.map(function(header) { return record[header] === undefined ? '' : record[header]; }));
}

function upsert_(sheet, key, value, record) {
  const headers = HEADERS[sheet.getName()];
  const keyIndex = headers.indexOf(key);
  const values = sheet.getDataRange().getValues();
  let rowNumber = -1;
  for (let i = 1; i < values.length; i += 1) if (String(values[i][keyIndex]) === String(value)) { rowNumber = i + 1; break; }
  const row = headers.map(function(header) { return record[header] === undefined ? '' : record[header]; });
  if (rowNumber < 0) sheet.appendRow(row); else sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
}

function updateBy_(sheet, key, value, changes) {
  const headers = HEADERS[sheet.getName()];
  const values = sheet.getDataRange().getValues();
  const keyIndex = headers.indexOf(key);
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][keyIndex]) !== String(value)) continue;
    Object.keys(changes).forEach(function(field) {
      const index = headers.indexOf(field);
      if (index >= 0) sheet.getRange(i + 1, index + 1).setValue(changes[field]);
    });
    return;
  }
  throw new Error('Record not found.');
}

function audit_(actorUid, action, targetType, targetId, metadata) {
  appendObject_(sheet_(TABS.AUDIT), {
    audit_id: Utilities.getUuid(), actor_uid: actorUid, action: action, target_type: targetType,
    target_id: targetId, metadata_json: JSON.stringify(metadata || {}), created_at: new Date().toISOString()
  });
}

function setting_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (value) return value;
  if (DEFAULTS[name] !== undefined) return String(DEFAULTS[name]);
  throw new Error('Missing Script Property: ' + name);
}

function requireAdmin_(key) {
  const expected = setting_('ADMIN_KEY');
  if (!key || !secureEqual_(String(key), String(expected))) throw new Error('Unauthorized admin request.');
}

function secureEqual_(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i += 1) result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return result === 0;
}

function clean_(value, maxLength) { return String(value == null ? '' : value).trim().slice(0, maxLength); }
function number_(value, min, max) { const n = Number(value || 0); if (!isFinite(n) || n < min || n > max) throw new Error('Invalid number.'); return n; }
function array_(value, maxItems, maxLength) { return (Array.isArray(value) ? value : []).slice(0, maxItems).map(function(item) { return clean_(item, maxLength); }).filter(Boolean); }
function jsonArray_(value) { try { const parsed = JSON.parse(String(value || '[]')); return Array.isArray(parsed) ? parsed : []; } catch (error) { return []; } }
function safeFilename_(name) { const cleaned = clean_(name, 160).replace(/[^A-Za-z0-9._() -]/g, '_').replace(/\.{2,}/g, '.'); return cleaned || 'upload.bin'; }

function validateMagicBytes_(bytes, mime) {
  const ok = mime === 'image/jpeg' ? bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF :
    mime === 'image/png' ? bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 :
    mime === 'image/webp' ? String.fromCharCode.apply(null, bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode.apply(null, bytes.slice(8, 12)) === 'WEBP' :
    mime === 'application/pdf' ? String.fromCharCode.apply(null, bytes.slice(0, 5)) === '%PDF-' : false;
  if (!ok) throw new Error('File content does not match its declared type.');
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
