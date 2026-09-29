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

const BUILD = '2026-09-29-drive-v9-self-service';
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
  REQUESTS: 'DB_RequestKeys',
  BOOKINGS: 'DB_Bookings',
  RATINGS: 'DB_Ratings',
  AUDIT: 'DB_Audit'
});

const HEADERS = Object.freeze({
  DB_Users: ['user_uid','firebase_uid','email','username','display_name','roles_json','status','district','category','skills_json','phone','experience_years','rate_lkr','profile_folder_id','profile_json_file_id','created_at','updated_at','lat','lng','service_radius_km','engagement_types_json','days_per_week','rating_sum','rating_count'],
  DB_Documents: ['document_id','user_uid','document_type','original_filename','mime_type','size_bytes','drive_file_id','status','created_at'],
  DB_Jobs: ['job_id','client_uid','category','description','district','urgency','budget_lkr','requested_date','job_size','workers_needed','materials_by','access_slots_json','status','created_at','updated_at','lat','lng','engagement_type','estimated_hours','duration_days','days_per_week'],
  DB_RequestKeys: ['request_key','client_uid','job_id','created_at'],
  DB_Bookings: ['booking_id','job_id','client_uid','provider_uid','status','agreed_amount_lkr','created_at','updated_at','start_date','end_date','slots_json','payment_method','payment_status'],
  DB_Ratings: ['rating_id','booking_id','rater_uid','ratee_uid','role','stars','comment','created_at'],
  DB_Audit: ['audit_id','actor_uid','action','target_type','target_id','metadata_json','created_at']
});

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
    if (action === 'admin_login') return json_({ok: true, data: adminLogin_(request.adminKey)});
    if (action === 'admin_list_pending') {
      const admin = verifyAdminSession_(request.adminSessionToken);
      return json_({ok: true, data: listPendingProviders_(admin)});
    }
    if (action === 'admin_update_provider') {
      const admin = verifyAdminSession_(request.adminSessionToken);
      return json_({ok: true, data: setProviderStatus_(request.payload || {}, admin.email)});
    }
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
      case 'submit_rating': result = submitRating_(identity, payload); break;
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
    const folderInfo = ensureUserFolder_(userUid, profile.username, existing && existing.profile_folder_id);
    const record = {
      schema_version: 1,
      user_uid: userUid,
      firebase_uid: identity.localId,
      email: identity.email,
      username: profile.username,
      display_name: profile.displayName,
      roles: ['client','provider'],
      // Account creation is self-service. A provider can publish a profile
      // immediately, but it remains explicitly unverified until an automated
      // credential/identity source is integrated. Suspended accounts stay hidden.
      status: existing && existing.status === 'suspended' ? 'suspended' : 'unverified',
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
    CacheService.getScriptCache().remove('public_providers');
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
  const requestKey = clean_(input.requestKey, 100);
  if (requestKey) {
    const existingRequest = rows_(TABS.REQUESTS).find(function(row) { return row.request_key === requestKey && row.client_uid === identity.localId; });
    if (existingRequest) return {id: existingRequest.job_id, status: 'matching', createdAt: existingRequest.created_at, existing: true};
  }
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
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (requestKey) {
      const existingRequest = rows_(TABS.REQUESTS).find(function(row) { return row.request_key === requestKey && row.client_uid === identity.localId; });
      if (existingRequest) return {id: existingRequest.job_id, status: 'matching', createdAt: existingRequest.created_at, existing: true};
    }
    appendObject_(sheet_(TABS.JOBS), record);
    if (requestKey) appendObject_(sheet_(TABS.REQUESTS), {request_key: requestKey, client_uid: identity.localId, job_id: record.job_id, created_at: now});
  } finally {
    lock.releaseLock();
  }
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
  const filtered = publicProviders_().filter(function(row) {
    if (category && row.category !== category) return false;
    if (!hasGeo && district && row.district !== district) return false;
    if (hasGeo && row.lat !== '' && row.lat != null && row.lng !== '' && row.lng != null) {
      const distance = distanceKm_(Number(input.lat), Number(input.lng), Number(row.lat), Number(row.lng));
      const radius = Number(row.service_radius_km || 15) || 15;
      if (distance > radius) return false;
    } else if (hasGeo && district && row.district !== district) {
      return false;
    }
    return true;
  });
  filtered.sort(function(a, b) {
    if (!hasGeo) return String(a.display_name).localeCompare(String(b.display_name));
    const aDistance = a.lat !== '' && a.lat != null && a.lng !== '' && a.lng != null ? distanceKm_(Number(input.lat), Number(input.lng), Number(a.lat), Number(a.lng)) : Number.POSITIVE_INFINITY;
    const bDistance = b.lat !== '' && b.lat != null && b.lng !== '' && b.lng != null ? distanceKm_(Number(input.lat), Number(input.lng), Number(b.lat), Number(b.lng)) : Number.POSITIVE_INFINITY;
    return aDistance - bDistance;
  });
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map(publicProvider_),
    page: page,
    pageSize: pageSize,
    total: filtered.length,
    hasMore: page * pageSize < filtered.length
  };
}

function distanceKm_(lat1, lng1, lat2, lng2) {
  const rad = function(value) { return value * Math.PI / 180; };
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createBooking_(identity, input) {
  requireVerifiedEmail_(identity);
  const job = findBy_(TABS.JOBS, 'job_id', clean_(input.jobId, 80));
  if (!job || job.client_uid !== identity.localId || job.status === 'cancelled') throw new Error('Job not found.');
  const provider = findBy_(TABS.USERS, 'user_uid', clean_(input.providerUid, 80));
  if (!provider || ['unverified','approved','pending_review'].indexOf(provider.status) < 0) throw new Error('Provider is not available.');
  const startDate = clean_(input.startDate, 20) || String(job.requested_date || '').slice(0, 10);
  if (!startDate) throw new Error('Please choose a date.');
  const endDate = clean_(input.endDate, 20) || startDate;
  const slots = normSlots_(input.slots);
  const dates = dateList_(startDate, endDate);
  const paymentMethod = PAYMENT_METHODS.indexOf(clean_(input.paymentMethod, 30)) >= 0 ? clean_(input.paymentMethod, 30) : 'cash_on_completion';
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const existing = rows_(TABS.BOOKINGS).find(function(row) {
      return row.job_id === job.job_id && row.client_uid === identity.localId && row.provider_uid === provider.user_uid && ['requested','confirmed','in_progress'].indexOf(row.status) >= 0;
    });
    if (existing) return {id: existing.booking_id, status: existing.status, paymentMethod: existing.payment_method, existing: true};
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
  const allowedFrom = {confirmed: ['requested'], declined: ['requested'], completed: ['confirmed','in_progress']};
  if (!allowedFrom[status] || allowedFrom[status].indexOf(booking.status) < 0) throw new Error('This booking can no longer be changed in that way.');
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
  if (['requested','confirmed'].indexOf(booking.status) < 0) throw new Error('This booking can no longer be cancelled.');
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
      if (wanted[d]) effSlots.forEach(function(s) { occupied.push({date: d, slot: s, status: row.status, bookingId: row.booking_id}); });
    });
  });
  return {providerUid: providerUid, occupied: occupied};
}

function getBookings_(identity) {
  const me = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
  const myUid = me ? me.user_uid : null;
  const myRatedBookings = {};
  rows_(TABS.RATINGS).forEach(function(r) {
    if (String(r.rater_uid) === String(identity.localId) || (myUid && String(r.rater_uid) === String(myUid))) myRatedBookings[r.booking_id] = true;
  });
  return rows_(TABS.BOOKINGS).filter(function(row) {
    return row.status !== 'blocked' && (row.client_uid === identity.localId || (myUid && row.provider_uid === myUid));
  }).map(function(row) {
    const provider = findBy_(TABS.USERS, 'user_uid', row.provider_uid);
    const job = findBy_(TABS.JOBS, 'job_id', row.job_id);
    return {
      id: row.booking_id, jobId: row.job_id, status: row.status,
      role: row.client_uid === identity.localId ? 'client' : 'provider',
      startDate: row.start_date, endDate: row.end_date, slots: jsonArray_(row.slots_json),
      paymentMethod: row.payment_method, paymentStatus: row.payment_status,
      amount: Number(row.agreed_amount_lkr || 0),
      jobDescription: job ? job.description : '',
      jobCategory: job ? job.category : '',
      providerName: provider ? provider.display_name : '', providerUid: row.provider_uid,
      ratedByMe: Boolean(myRatedBookings[row.booking_id]),
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
  const dates = dateList_(startDate, endDate);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (bookingOverlaps_(me.user_uid, dates, slots, null)) throw new Error('One or more selected times are already booked.');
  const now = new Date().toISOString();
  const record = {
    booking_id: Utilities.getUuid(), job_id: 'self-block', client_uid: identity.localId,
    provider_uid: me.user_uid, status: 'blocked', agreed_amount_lkr: 0, created_at: now, updated_at: now,
    start_date: startDate, end_date: endDate, slots_json: JSON.stringify(slots), payment_method: '', payment_status: ''
  };
  appendObject_(sheet_(TABS.BOOKINGS), record);
  audit_(me.user_uid, 'availability.block', 'booking', record.booking_id, {startDate: startDate});
  return {id: record.booking_id, status: 'blocked'};
  } finally {
    lock.releaseLock();
  }
}

// Either party rates the other after a booking is completed.
function submitRating_(identity, input) {
  requireVerifiedEmail_(identity);
  const booking = findBy_(TABS.BOOKINGS, 'booking_id', clean_(input.bookingId, 80));
  if (!booking) throw new Error('Booking not found.');
  if (booking.status !== 'completed') throw new Error('You can rate only after the work is completed.');
  const me = findBy_(TABS.USERS, 'firebase_uid', identity.localId);
  const isClient = booking.client_uid === identity.localId;
  const isProvider = me && booking.provider_uid === me.user_uid;
  if (!isClient && !isProvider) throw new Error('Not your booking.');
  const raterUid = isProvider ? me.user_uid : identity.localId;
  const rateeUid = isProvider ? booking.client_uid : booking.provider_uid;
  const stars = number_(input.stars, 1, 5);
  const comment = clean_(input.comment, 500);
  const already = rows_(TABS.RATINGS).some(function(r) { return r.booking_id === booking.booking_id && String(r.rater_uid) === String(raterUid); });
  if (already) throw new Error('You already rated this booking.');
  const now = new Date().toISOString();
  appendObject_(sheet_(TABS.RATINGS), {
    rating_id: Utilities.getUuid(), booking_id: booking.booking_id, rater_uid: raterUid,
    ratee_uid: rateeUid, role: isProvider ? 'provider_rates_client' : 'client_rates_provider',
    stars: stars, comment: comment, created_at: now
  });
  if (isClient) {
    const provider = findBy_(TABS.USERS, 'user_uid', rateeUid);
    if (provider) {
      updateBy_(sheet_(TABS.USERS), 'user_uid', rateeUid, {
        rating_sum: Number(provider.rating_sum || 0) + stars,
        rating_count: Number(provider.rating_count || 0) + 1,
        updated_at: now
      });
      CacheService.getScriptCache().remove('public_providers');
    }
  }
  audit_(raterUid, 'rating.submit', 'booking', booking.booking_id, {stars: stars});
  return {ok: true, stars: stars};
}

function setProviderStatus_(input, adminEmail) {
  const allowed = ['approved','suspended','rejected'];
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
  audit_(adminEmail || 'admin', 'provider.status', 'user', userUid, {status: status});
  CacheService.getScriptCache().remove('public_providers');
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
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const globalKey = 'otp_global_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmm');
    const globalCount = Number(cache.get(globalKey) || 0);
    if (globalCount >= 30) throw new Error('Too many sign-in requests. Please try again later.');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
    const properties = PropertiesService.getScriptProperties();
    let daily = {};
    try { daily = JSON.parse(properties.getProperty('OTP_DAILY_STATE') || '{}'); } catch (error) {}
    if (daily.date !== today) daily = {date: today, count: 0};
    if (Number(daily.count || 0) >= 80) throw new Error('Today’s sign-in code limit has been reached. Please try tomorrow or contact support.');
    if (cache.get('otp_rl_' + email)) throw new Error('Please wait a minute before requesting another code.');
    const randomHex = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    const code = String((parseInt(randomHex, 16) % 900000) + 100000);
    cache.put('otp_' + email, JSON.stringify({hash: otpHash_(code), attempts: 0}), 600);
    cache.put('otp_rl_' + email, '1', 60);
    cache.put(globalKey, String(globalCount + 1), 120);
    cache.put('otp_email_' + email, '1', 600);
    daily.count = Number(daily.count || 0) + 1;
    properties.setProperty('OTP_DAILY_STATE', JSON.stringify(daily));
  } finally {
    lock.releaseLock();
  }
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
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (!cache.get('otp_email_' + email)) throw new Error('Request a sign-in code first.');
    const raw = cache.get('otp_' + email);
    if (!raw) { cache.remove('otp_email_' + email); throw new Error('Code expired. Please request a new one.'); }
    const record = JSON.parse(raw);
    if (record.attempts >= 5) { cache.remove('otp_' + email); cache.remove('otp_email_' + email); throw new Error('Too many attempts. Request a new code.'); }
    if (!secureEqual_(otpHash_(code), record.hash)) {
      record.attempts += 1;
      cache.put('otp_' + email, JSON.stringify(record), 600);
      if (record.attempts >= 5) cache.remove('otp_email_' + email);
      throw new Error(record.attempts >= 5 ? 'Too many attempts. Request a new code.' : 'Incorrect code. Please try again.');
    }
    cache.remove('otp_' + email);
    cache.remove('otp_email_' + email);
  } finally {
    lock.releaseLock();
  }
  ensureAccountRecord_(email);
  audit_(email, 'auth.otp_verify', 'auth', email, {});
  return {sessionToken: signSession_(email, 30 * 24 * 3600), email: email};
}

// Create a minimal private account record and dedicated Drive folder the first
// time an email is verified. A provider profile upgrades this same record.
function ensureAccountRecord_(email) {
  const normalizedEmail = normEmail_(email);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const existing = findBy_(TABS.USERS, 'firebase_uid', normalizedEmail);
    if (existing) return existing;
    const now = new Date().toISOString();
    const userUid = Utilities.getUuid();
    const username = 'member-' + userUid.slice(0, 8).toLowerCase();
    const folderInfo = ensureUserFolder_(userUid, username, '');
    const profile = {schema_version: 1, user_uid: userUid, firebase_uid: normalizedEmail, email: normalizedEmail,
      username: username, display_name: '', roles: ['client'], status: 'account_only', created_at: now, updated_at: now};
    const profileFile = upsertJsonFile_(folderInfo.profileFolder, 'profile.json', profile);
    const record = {user_uid: userUid, firebase_uid: normalizedEmail, email: normalizedEmail, username: username,
      display_name: '', roles_json: JSON.stringify(['client']), status: 'account_only', district: '', category: '',
      skills_json: '[]', phone: '', experience_years: 0, rate_lkr: 0, profile_folder_id: folderInfo.userFolder.getId(),
      profile_json_file_id: profileFile.getId(), created_at: now, updated_at: now};
    upsert_(sheet_(TABS.USERS), 'firebase_uid', normalizedEmail, record);
    audit_(userUid, 'account.create', 'user', userUid, {method: 'email_otp'});
    return record;
  } finally {
    lock.releaseLock();
  }
}

function adminLogin_(adminKey) {
  requireAdmin_(adminKey);
  const secret = sessionSecret_();
  const expiry = Date.now() + 2 * 60 * 60 * 1000;
  const payload = Utilities.base64EncodeWebSafe(JSON.stringify({sub: 'admin', exp: expiry, role: 'admin'}));
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret));
  audit_('admin', 'admin.session.start', 'auth', 'admin', {});
  return {adminSessionToken: payload + '.' + signature, expiresAt: expiry};
}

function verifyAdminSession_(token) {
  if (!token) throw new Error('Admin sign-in required.');
  const parts = String(token).split('.');
  if (parts.length !== 2) throw new Error('Invalid admin session.');
  const expected = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(parts[0], sessionSecret_()));
  if (!secureEqual_(parts[1], expected)) throw new Error('Invalid admin session.');
  const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if (payload.role !== 'admin' || !payload.exp || payload.exp < Date.now()) throw new Error('Admin session expired.');
  return {email: 'admin', role: 'admin'};
}

function listPendingProviders_(admin) {
  return rows_(TABS.USERS).filter(function(row) { return row.status === 'pending_review'; })
    .map(function(row) {
      let evidenceSummary = '';
      if (row.profile_json_file_id) {
        try { evidenceSummary = JSON.parse(DriveApp.getFileById(row.profile_json_file_id).getBlob().getDataAsString()).evidence_summary || ''; }
        catch (error) { evidenceSummary = 'ලේඛන විස්තරය කියවිය නොහැක'; }
      }
      return {
        userUid: row.user_uid, displayName: row.display_name, username: row.username,
        category: row.category, district: row.district, phone: row.phone,
        experienceYears: Number(row.experience_years || 0),
        evidenceSummary: evidenceSummary,
        createdAt: row.created_at
      };
    });
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
  // Create only the required profile folder here. Sensitive/evidence folders
  // are created lazily when a user first uploads that document type.
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

function publicProviders_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('public_providers');
  if (cached) return JSON.parse(cached);
  const records = rows_(TABS.USERS).filter(function(row) { return ['unverified','approved','pending_review'].indexOf(row.status) >= 0; });
  // CacheService rejects entries larger than its per-key limit. At pilot scale
  // this is an optimization only; a large provider list must still be usable.
  try { cache.put('public_providers', JSON.stringify(records), 300); } catch (error) { console.warn('Provider cache skipped:', error.message); }
  return records;
}

function publicProvider_(row) {
  const engagementTypes = jsonArray_(row.engagement_types_json);
  return {
    id: row.user_uid, username: row.username, name: row.display_name, category: row.category,
    district: row.district, skills: jsonArray_(row.skills_json), experience: Number(row.experience_years || 0),
    rate: Number(row.rate_lkr || 0), approved: row.status === 'approved', tier: row.status === 'approved' ? 't2_profile' : 't0_phone', verificationStatus: row.status === 'approved' ? 'verified' : 'unverified', availability: 'available',
    lat: row.lat === '' || row.lat == null ? null : Number(row.lat),
    lng: row.lng === '' || row.lng == null ? null : Number(row.lng),
    radiusKm: Number(row.service_radius_km || 15) || 15, perKmRate: 45, workingDays: [1, 2, 3, 4, 5, 6],
    engagementTypes: engagementTypes.length ? engagementTypes : ['quick', 'day'],
    daysPerWeek: Number(row.days_per_week || 0),
    rating: Number(row.rating_count || 0) ? Number(row.rating_sum || 0) / Number(row.rating_count) : 0,
    ratingCount: Number(row.rating_count || 0), jobsCompleted: 0, responseRate: 0.6, teamSize: 1,
    availableSlots: ['morning','lunch','evening'], supplyCapabilities: ['labour_only'],
    portfolio: ''
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
