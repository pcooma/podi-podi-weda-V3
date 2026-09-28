/**
 * Podi Podi Weda — Google Drive-first Apps Script backend.
 *
 * Authentication: passwordless email one-time-code (OTP). A code is emailed via
 * MailApp; verifying it mints an HMAC-signed session token. No Firebase, and no
 * passwords are ever stored.
 *
 * Required Script Properties:
 *   ADMIN_KEY            (also used to sign sessions/OTP unless SESSION_SECRET is set)
 * Optional Script Properties:
 *   SESSION_SECRET       (dedicated signing key; falls back to ADMIN_KEY)
 *   ROOT_FOLDER_ID, USERS_FOLDER_ID, DB_SPREADSHEET_ID, MAX_UPLOAD_BYTES
 */

const BUILD = '2026-09-28-drive-v5-bookings';
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
  DB_Users: ['user_uid','firebase_uid','email','username','display_name','roles_json','status','district','category','skills_json','phone','experience_years','rate_lkr','profile_folder_id','profile_json_file_id','created_at','updated_at','lat','lng','service_radius_km','engagement_types_json','days_per_week'],
  DB_Documents: ['document_id','user_uid','document_type','original_filename','mime_type','size_bytes','drive_file_id','status','created_at'],
  DB_Jobs: ['job_id','client_uid','category','description','district','urgency','budget_lkr','requested_date','job_size','workers_needed','materials_by','access_slots_json','status','created_at','updated_at','lat','lng','engagement_type','estimated_hours','duration_days','days_per_week'],
  DB_Bookings: ['booking_id','job_id','client_uid','provider_uid','status','agreed_amount_lkr','created_at','updated_at','start_date','end_date','slots_json','payment_method','payment_status'],
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

const BOOKING_SLOTS = ['morning', 'lunch', 'evening', 'night'];
const OCCUPYING_STATUSES = ['confirmed', 'in_progress', 'blocked'];
const PAYMENT_METHODS = ['cash_on_completion', 'deposit_plus_cash', 'online_prepay'];

function dateList_(start, end) {
  const s = new Date(String(start) + 'T00:00:00');
  const e = new Date(String(end || start) + 'T00:00:00');
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) throw new Error('Invalid date range.');
  const days = [];
  let cur = s;
  for (let i = 0; i < 366 && cur <= e; i += 1) {
    days.push(Utilities.formatDate(cur, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
    cur = new Date(cur.getTime() + 86400000);
  }
  return days;
}

function normSlots_(slots) {
  const arr = (Array.isArray(slots) ? slots : []).filter(function(s) { return BOOKING_SLOTS.indexOf(s) >= 0; });
  return arr.length ? arr : BOOKING_SLOTS.slice();
}

// True if the provider already has an occupying booking on any of these
// date+slot cells (optionally excluding one booking id).
function bookingOverlaps_(providerUid, dates, slots, excludeId) {
  const dateSet = {}; dates.forEach(function(d) { dateSet[d] = true; });
  const slotSet = {}; slots.forEach(function(s) { slotSet[s] = true; });
  return rows_(TABS.BOOKINGS).some(function(row) {
    if (row.provider_uid !== providerUid) return false;
    if (excludeId && row.booking_id === excludeId) return false;
    if (OCCUPYING_STATUSES.indexOf(row.status) < 0) return false;
    const rowSlots = jsonArray_(row.slots_json);
    const effSlots = rowSlots.length ? rowSlots : BOOKING_SLOTS;
    return dateList_(row.start_date, row.end_date).some(function(d) { return dateSet[d]; })
      && effSlots.some(function(s) { return slotSet[s]; });
  });
}

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
    if (action === 'request_otp') return json_({ok: true, data: requestOtp_(request.payload || {})});
    if (action === 'verify_otp') return json_({ok: true, data: verifyOtp_(request.payload || {})});

    const identity = verifySession_(request.sessionToken);
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
      case 'accept_booking': result = setBookingDecision_(identity, payload, 'confirmed'); break;
      case 'decline_booking': result = setBookingDecision_(identity, payload, 'declined'); break;
      case 'cancel_booking': result = cancelBooking_(identity, payload); break;
      case 'complete_booking': result = setBookingDecision_(identity, payload, 'completed'); break;
      case 'get_availability': result = getAvailability_(identity, payload); break;
      case 'get_bookings': result = getBookings_(identity); break;
      case 'reveal_contact': result = revealContact_(identity, payload); break;
      case 'block_dates': result = blockDates_(identity, payload); break;
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
      lat: profile.lat,
      lng: profile.lng,
      service_radius_km: profile.serviceRadiusKm,
      engagement_types: profile.engagementTypes,
      days_per_week: profile.daysPerWeek,
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
      updated_at: now,
      lat: profile.lat,
      lng: profile.lng,
      service_radius_km: profile.serviceRadiusKm,
      engagement_types_json: JSON.stringify(profile.engagementTypes),
      days_per_week: profile.daysPerWeek
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
    updated_at: now,
    lat: geoCoord_(input.lat, 90),
    lng: geoCoord_(input.lng, 180),
    engagement_type: ['quick','day','multi_day','full_time'].indexOf(clean_(input.engagementType, 20)) >= 0 ? clean_(input.engagementType, 20) : 'day',
    estimated_hours: input.estimatedHours == null ? '' : number_(input.estimatedHours, 0, 24),
    duration_days: input.durationDays == null ? '' : number_(input.durationDays, 0, 365),
    days_per_week: input.daysPerWeek == null ? '' : number_(input.daysPerWeek, 0, 7)
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
  // When the client shares GPS, search by category across districts and let the
  // client rank by real distance + radius. Without GPS, fall back to district.
  const hasGeo = geoCoord_(input.lat, 90) !== '' && geoCoord_(input.lng, 180) !== '';
  const page = Math.max(1, Number(input.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(input.pageSize || 20)));
  const filtered = approvedProviders_().filter(function(row) {
    return (!category || row.category === category) && (hasGeo || !district || row.district === district);
  });
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map(publicProvider_),
    page: page,
    pageSize: pageSize,
    total: filtered.length,
    hasMore: page * pageSize < filtered.length
  };
}

function createBooking_(identity, input) {
  requireVerifiedEmail_(identity);
  const job = findBy_(TABS.JOBS, 'job_id', clean_(input.jobId, 80));
  if (!job || job.client_uid !== identity.localId) throw new Error('Job not found.');
  const provider = findBy_(TABS.USERS, 'user_uid', clean_(input.providerUid, 80));
  if (!provider || provider.status !== 'approved') throw new Error('Provider is not available.');
  const startDate = clean_(input.startDate, 20) || String(job.requested_date || '').slice(0, 10);
  if (!startDate) throw new Error('Please choose a date.');
  const endDate = clean_(input.endDate, 20) || startDate;
  const slots = normSlots_(input.slots);
  const dates = dateList_(startDate, endDate);
  const paymentMethod = PAYMENT_METHODS.indexOf(clean_(input.paymentMethod, 30)) >= 0 ? clean_(input.paymentMethod, 30) : 'cash_on_completion';
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (bookingOverlaps_(provider.user_uid, dates, slots, null)) throw new Error('That time is already booked. Please choose another date or time.');
    const now = new Date().toISOString();
    const record = {
      booking_id: Utilities.getUuid(), job_id: job.job_id, client_uid: identity.localId,
      provider_uid: provider.user_uid, status: 'requested',
      agreed_amount_lkr: number_(input.agreedAmountLkr, 0, 100000000), created_at: now, updated_at: now,
      start_date: startDate, end_date: endDate, slots_json: JSON.stringify(slots),
      payment_method: paymentMethod, payment_status: paymentMethod === 'cash_on_completion' ? 'on_completion' : 'pending_gateway'
    };
    appendObject_(sheet_(TABS.BOOKINGS), record);
    updateBy_(sheet_(TABS.JOBS), 'job_id', job.job_id, {status: 'booking_requested', updated_at: now});
    audit_(identity.localId, 'booking.create', 'booking', record.booking_id, {providerUid: provider.user_uid, startDate: startDate});
    return {id: record.booking_id, status: record.status, paymentMethod: paymentMethod};
  } finally {
    lock.releaseLock();
  }
}

// Provider accepts / declines / completes a booking they were requested for.
function setBookingDecision_(identity, input, status) {
  const booking = findBy_(TABS.BOOKINGS, 'booking_id', clean_(input.bookingId, 80));
  if (!booking) throw new Error('Booking not found.');
  const me = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
  if (!me || booking.provider_uid !== me.user_uid) throw new Error('Only the assigned provider can update this booking.');
  const now = new Date().toISOString();
  if (status === 'confirmed') {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const slots = jsonArray_(booking.slots_json);
      if (bookingOverlaps_(booking.provider_uid, dateList_(booking.start_date, booking.end_date), slots.length ? slots : BOOKING_SLOTS, booking.booking_id)) {
        throw new Error('That time was just booked by someone else.');
      }
      updateBy_(sheet_(TABS.BOOKINGS), 'booking_id', booking.booking_id, {status: 'confirmed', updated_at: now});
    } finally {
      lock.releaseLock();
    }
  } else {
    updateBy_(sheet_(TABS.BOOKINGS), 'booking_id', booking.booking_id, {status: status, updated_at: now});
  }
  audit_(me.user_uid, 'booking.' + status, 'booking', booking.booking_id, {});
  return {id: booking.booking_id, status: status};
}

function cancelBooking_(identity, input) {
  const booking = findBy_(TABS.BOOKINGS, 'booking_id', clean_(input.bookingId, 80));
  if (!booking) throw new Error('Booking not found.');
  const me = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
  const isClient = booking.client_uid === identity.localId;
  const isProvider = me && booking.provider_uid === me.user_uid;
  if (!isClient && !isProvider) throw new Error('Not your booking.');
  updateBy_(sheet_(TABS.BOOKINGS), 'booking_id', booking.booking_id, {status: 'cancelled', updated_at: new Date().toISOString()});
  audit_(identity.localId, 'booking.cancel', 'booking', booking.booking_id, {});
  return {id: booking.booking_id, status: 'cancelled'};
}

// Occupied (date, slot) cells for a provider over a date window.
function getAvailability_(identity, input) {
  requireVerifiedEmail_(identity);
  const providerUid = clean_(input.providerUid, 80);
  const from = clean_(input.from, 20);
  const to = clean_(input.to, 20) || from;
  if (!providerUid || !from) throw new Error('providerUid and from date are required.');
  const wanted = {}; dateList_(from, to).forEach(function(d) { wanted[d] = true; });
  const occupied = [];
  rows_(TABS.BOOKINGS).forEach(function(row) {
    if (row.provider_uid !== providerUid || OCCUPYING_STATUSES.indexOf(row.status) < 0) return;
    const slots = jsonArray_(row.slots_json);
    const effSlots = slots.length ? slots : BOOKING_SLOTS;
    dateList_(row.start_date, row.end_date).forEach(function(d) {
      if (wanted[d]) effSlots.forEach(function(s) { occupied.push({date: d, slot: s}); });
    });
  });
  return {providerUid: providerUid, occupied: occupied};
}

function getBookings_(identity) {
  const me = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
  const myUid = me ? me.user_uid : null;
  return rows_(TABS.BOOKINGS).filter(function(row) {
    return row.status !== 'blocked' && (row.client_uid === identity.localId || (myUid && row.provider_uid === myUid));
  }).map(function(row) {
    const provider = findBy_(TABS.USERS, 'user_uid', row.provider_uid);
    return {
      id: row.booking_id, jobId: row.job_id, status: row.status,
      role: row.client_uid === identity.localId ? 'client' : 'provider',
      startDate: row.start_date, endDate: row.end_date, slots: jsonArray_(row.slots_json),
      paymentMethod: row.payment_method, paymentStatus: row.payment_status,
      amount: Number(row.agreed_amount_lkr || 0),
      providerName: provider ? provider.display_name : '', providerUid: row.provider_uid,
      createdAt: row.created_at
    };
  }).sort(function(a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
}

// Contact details open only on a confirmed booking, to the client or provider.
function revealContact_(identity, input) {
  const booking = findBy_(TABS.BOOKINGS, 'booking_id', clean_(input.bookingId, 80));
  if (!booking) throw new Error('Booking not found.');
  const me = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
  const isClient = booking.client_uid === identity.localId;
  const isProvider = me && booking.provider_uid === me.user_uid;
  if (!isClient && !isProvider) throw new Error('Not your booking.');
  if (['confirmed', 'in_progress', 'completed'].indexOf(booking.status) < 0) throw new Error('Contact opens after the provider confirms the booking.');
  const provider = findBy_(TABS.USERS, 'user_uid', booking.provider_uid);
  audit_(identity.localId, 'contact.reveal', 'booking', booking.booking_id, {providerUid: booking.provider_uid});
  return {providerName: provider ? provider.display_name : '', providerPhone: provider ? provider.phone : ''};
}

// Provider marks their own dates unavailable (stored as a 'blocked' booking).
function blockDates_(identity, input) {
  requireVerifiedEmail_(identity);
  const me = requireUser_(identity.localId);
  const startDate = clean_(input.startDate, 20);
  if (!startDate) throw new Error('Please choose a date.');
  const endDate = clean_(input.endDate, 20) || startDate;
  const slots = normSlots_(input.slots);
  const now = new Date().toISOString();
  const record = {
    booking_id: Utilities.getUuid(), job_id: 'self-block', client_uid: identity.localId,
    provider_uid: me.user_uid, status: 'blocked', agreed_amount_lkr: 0, created_at: now, updated_at: now,
    start_date: startDate, end_date: endDate, slots_json: JSON.stringify(slots), payment_method: '', payment_status: ''
  };
  appendObject_(sheet_(TABS.BOOKINGS), record);
  audit_(me.user_uid, 'availability.block', 'booking', record.booking_id, {startDate: startDate});
  return {id: record.booking_id, status: 'blocked'};
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

// ---- Email one-time-code (OTP) authentication ----------------------------
// No Firebase and no stored passwords. A 6-digit code is emailed to the user;
// verifying it proves email ownership and mints an HMAC-signed session token
// that the browser sends on every authenticated request.

function normEmail_(value) { return clean_(value, 150).toLowerCase(); }

function sessionSecret_() {
  return PropertiesService.getScriptProperties().getProperty('SESSION_SECRET') || setting_('ADMIN_KEY');
}

function otpHash_(code) {
  return Utilities.base64Encode(Utilities.computeHmacSha256Signature(String(code), sessionSecret_()));
}

function requestOtp_(input) {
  const email = normEmail_(input.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email address.');
  const cache = CacheService.getScriptCache();
  const globalKey = 'otp_global_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmm');
  const globalCount = Number(cache.get(globalKey) || 0);
  if (globalCount >= 30) throw new Error('Too many sign-in requests. Please try again later.');
  if (cache.get('otp_rl_' + email)) throw new Error('Please wait a minute before requesting another code.');
  const code = String(Math.floor(100000 + Math.random() * 900000));
  cache.put('otp_' + email, JSON.stringify({hash: otpHash_(code), attempts: 0}), 600);
  cache.put('otp_rl_' + email, '1', 60);
  cache.put(globalKey, String(globalCount + 1), 120);
  MailApp.sendEmail({
    to: email,
    subject: 'Podi Podi Weda — your verification code',
    body: 'Your Podi Podi Weda verification code is ' + code + '.\n\nIt expires in 10 minutes. If you did not request it, ignore this email.'
  });
  audit_(email, 'auth.otp_request', 'auth', email, {});
  return {ok: true};
}

function verifyOtp_(input) {
  const email = normEmail_(input.email);
  const code = clean_(input.code, 6);
  const cache = CacheService.getScriptCache();
  const raw = cache.get('otp_' + email);
  if (!raw) throw new Error('Code expired. Please request a new one.');
  const record = JSON.parse(raw);
  if (record.attempts >= 5) { cache.remove('otp_' + email); throw new Error('Too many attempts. Request a new code.'); }
  if (!secureEqual_(otpHash_(code), record.hash)) {
    record.attempts += 1;
    cache.put('otp_' + email, JSON.stringify(record), 600);
    throw new Error('Incorrect code. Please try again.');
  }
  cache.remove('otp_' + email);
  audit_(email, 'auth.otp_verify', 'auth', email, {});
  return {sessionToken: signSession_(email, 30 * 24 * 3600), email: email};
}

function signSession_(email, ttlSeconds) {
  const payload = Utilities.base64EncodeWebSafe(JSON.stringify({sub: normEmail_(email), exp: Date.now() + ttlSeconds * 1000}));
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, sessionSecret_()));
  return payload + '.' + sig;
}

function verifySession_(token) {
  if (!token) throw new Error('Authentication required.');
  const parts = String(token).split('.');
  if (parts.length !== 2) throw new Error('Invalid session. Please sign in again.');
  const expected = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(parts[0], sessionSecret_()));
  if (!secureEqual_(parts[1], expected)) throw new Error('Invalid session. Please sign in again.');
  const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if (!payload.exp || payload.exp < Date.now()) throw new Error('Session expired. Please sign in again.');
  return {localId: payload.sub, email: payload.sub, emailVerified: true};
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
  const engagementTypes = array_(input.engagementTypes, 4, 20)
    .filter(function(t) { return ['quick','day','multi_day','full_time'].indexOf(t) >= 0; });
  return {
    username: username, phone: phone, displayName: displayName, district: district, category: category,
    skills: array_(input.skills, 30, 100), experienceYears: number_(input.experienceYears, 0, 80),
    rateLkr: number_(input.rateLkr, 0, 100000000), evidenceSummary: clean_(input.evidenceSummary, 2000),
    preferredLanguage: ['si','ta','en'].indexOf(input.preferredLanguage) >= 0 ? input.preferredLanguage : 'si',
    lat: geoCoord_(input.lat, 90), lng: geoCoord_(input.lng, 180),
    serviceRadiusKm: input.serviceRadiusKm == null ? 15 : number_(input.serviceRadiusKm, 0, 500),
    engagementTypes: engagementTypes.length ? engagementTypes : ['quick','day'],
    daysPerWeek: input.daysPerWeek == null ? 0 : number_(input.daysPerWeek, 0, 7)
  };
}

// Returns a valid coordinate number, or '' when absent/out of range.
function geoCoord_(value, max) {
  if (value === '' || value == null) return '';
  const n = Number(value);
  if (!isFinite(n) || Math.abs(n) > max || n === 0) return '';
  return n;
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
  const engagementTypes = jsonArray_(row.engagement_types_json);
  return {
    id: row.user_uid, username: row.username, name: row.display_name, category: row.category,
    district: row.district, skills: jsonArray_(row.skills_json), experience: Number(row.experience_years || 0),
    rate: Number(row.rate_lkr || 0), approved: true, tier: 't2_profile', availability: 'available',
    lat: row.lat === '' || row.lat == null ? null : Number(row.lat),
    lng: row.lng === '' || row.lng == null ? null : Number(row.lng),
    radiusKm: Number(row.service_radius_km || 15) || 15, perKmRate: 45, workingDays: [1, 2, 3, 4, 5, 6],
    engagementTypes: engagementTypes.length ? engagementTypes : ['quick', 'day'],
    daysPerWeek: Number(row.days_per_week || 0),
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
    experience_years: Number(row.experience_years || 0), rate_lkr: Number(row.rate_lkr || 0),
    lat: row.lat === '' || row.lat == null ? null : Number(row.lat),
    lng: row.lng === '' || row.lng == null ? null : Number(row.lng),
    service_radius_km: Number(row.service_radius_km || 15),
    engagement_types: jsonArray_(row.engagement_types_json),
    days_per_week: Number(row.days_per_week || 0)
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
    return sheet;
  }
  // Self-migrate: if new columns were appended to HEADERS, extend the existing
  // header row. Only trailing additions are supported (existing headers must be
  // a prefix), so live data columns never shift.
  const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(v) { return String(v); });
  if (existing.length < headers.length) {
    const prefixOk = existing.every(function(h, i) { return h === headers[i]; });
    if (!prefixOk) throw new Error('Header mismatch in ' + name + '; manual migration required.');
    const added = headers.slice(existing.length);
    sheet.getRange(1, existing.length + 1, 1, added.length).setValues([added]).setFontWeight('bold').setBackground('#173b31').setFontColor('#ffffff');
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

// Values are written as plain text (number format '@') so identifiers with
// leading zeros — phone numbers like 0771234567, all-digit usernames — are not
// silently coerced to numbers by Sheets. Numeric fields are re-parsed with
// Number(...) on read, so text storage is safe.
function writeRow_(sheet, rowNumber, headers, record) {
  const row = headers.map(function(header) { return record[header] === undefined ? '' : String(record[header]); });
  const range = sheet.getRange(rowNumber, 1, 1, headers.length);
  range.setNumberFormat('@');
  range.setValues([row]);
}

function appendObject_(sheet, record) {
  const headers = HEADERS[sheet.getName()];
  writeRow_(sheet, sheet.getLastRow() + 1, headers, record);
}

function upsert_(sheet, key, value, record) {
  const headers = HEADERS[sheet.getName()];
  const keyIndex = headers.indexOf(key);
  const values = sheet.getDataRange().getValues();
  let rowNumber = -1;
  for (let i = 1; i < values.length; i += 1) if (String(values[i][keyIndex]) === String(value)) { rowNumber = i + 1; break; }
  writeRow_(sheet, rowNumber < 0 ? sheet.getLastRow() + 1 : rowNumber, headers, record);
}

function updateBy_(sheet, key, value, changes) {
  const headers = HEADERS[sheet.getName()];
  const values = sheet.getDataRange().getValues();
  const keyIndex = headers.indexOf(key);
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][keyIndex]) !== String(value)) continue;
    Object.keys(changes).forEach(function(field) {
      const index = headers.indexOf(field);
      if (index >= 0) sheet.getRange(i + 1, index + 1).setNumberFormat('@').setValue(String(changes[field]));
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
