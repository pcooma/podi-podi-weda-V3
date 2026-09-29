// Passwordless email one-time-code (OTP) client for the Apps Script backend.
// No Firebase, no external SDK. The signed session token returned by the
// backend is kept in localStorage and sent on every authenticated request.
const config = window.PODI_PODI_CONFIG;
const listeners = new Set();
const SESSION_KEY = "podi_session";
const ADMIN_SESSION_KEY = "podi_admin_session";

// The site is "live" only when an Apps Script URL is present AND the operator
// has explicitly opted in with `backend: "live"` in config.js. Until then the
// site stays in demo/preview mode, so deploying frontend code never flips a
// half-configured backend on by accident.
function isConfigured() {
  return Boolean(config?.appsScriptUrl && config?.backend === "live");
}

function tokenExpiry(token) {
  try {
    const raw = token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(raw)).exp || 0;
  } catch (error) {
    return 0;
  }
}

function readSession() {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!data?.token || !data?.email) return null;
    if (data.exp && data.exp < Date.now()) { localStorage.removeItem(SESSION_KEY); return null; }
    return data;
  } catch (error) {
    return null;
  }
}

let session = readSession();

function setSession(data) {
  session = data;
  try {
    if (data) localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    else localStorage.removeItem(SESSION_KEY);
  } catch (error) { /* private mode: keep the in-memory session */ }
  const user = currentUser();
  listeners.forEach((listener) => listener(user));
}

function currentUser() {
  return session ? { email: session.email } : null;
}

async function post(action, body) {
  const response = await fetch(config.appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body ? { action, ...body } : { action })
  });
  const envelope = await response.json().catch(() => ({}));
  if (!response.ok || envelope.ok === false) {
    const message = envelope.error || `Request failed (${response.status})`;
    if (/session|sign in/i.test(message)) setSession(null);
    throw new Error(message);
  }
  return envelope.data;
}

// Unauthenticated calls (OTP request/verify).
function rawApi(action, payload) {
  return post(action, { payload });
}

// Authenticated calls carry the session token.
function api(path, options = {}) {
  if (!session) throw new Error("Please sign in first.");
  const action = String(path).replace(/^\/+|\/+$/g, "").replaceAll("/", "_").replaceAll("-", "_");
  return post(action, { sessionToken: session.token, payload: options.body ? JSON.parse(options.body) : {} });
}

async function uploadDocument(file, type, consentVersion = "v1") {
  const base64 = await fileToBase64(file);
  return api("upload_document", {
    method: "POST",
    body: JSON.stringify({ type, filename: file.name, mimeType: file.type, size: file.size, consentVersion, base64 })
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

window.PodiBackend = {
  isConfigured,
  currentUser,
  onAuthChange(listener) {
    listeners.add(listener);
    listener(currentUser());
    return () => listeners.delete(listener);
  },
  requestOtp: (email) => rawApi("request_otp", { email }),
  async verifyOtp(email, code) {
    const data = await rawApi("verify_otp", { email, code });
    setSession({ token: data.sessionToken, email: data.email, exp: tokenExpiry(data.sessionToken) });
    return data;
  },
  logout() { setSession(null); },
  getMe: async () => ({ user: await api("get_me") }),
  saveProfile: (profile) => api("save_profile", { method: "PUT", body: JSON.stringify(profile) }),
  uploadDocument,
  listDocuments: () => api("list_documents"),
  submitJob: (job) => api("submit_job", { method: "POST", body: JSON.stringify(job) }),
  searchProviders: (query) => api("search_providers", { method: "POST", body: JSON.stringify(query) }),
  createBooking: (booking) => api("create_booking", { method: "POST", body: JSON.stringify(booking) }),
  acceptBooking: (bookingId) => api("accept_booking", { method: "POST", body: JSON.stringify({ bookingId }) }),
  declineBooking: (bookingId) => api("decline_booking", { method: "POST", body: JSON.stringify({ bookingId }) }),
  completeBooking: (bookingId) => api("complete_booking", { method: "POST", body: JSON.stringify({ bookingId }) }),
  cancelBooking: (bookingId) => api("cancel_booking", { method: "POST", body: JSON.stringify({ bookingId }) }),
  getAvailability: (providerUid, from, to) => api("get_availability", { method: "POST", body: JSON.stringify({ providerUid, from, to }) }),
  getBookings: () => api("get_bookings"),
  revealContact: (bookingId) => api("reveal_contact", { method: "POST", body: JSON.stringify({ bookingId }) }),
  blockDates: (block) => api("block_dates", { method: "POST", body: JSON.stringify(block) }),
  submitRating: (rating) => api("submit_rating", { method: "POST", body: JSON.stringify(rating) }),
  adminLogin: async (adminKey) => {
    const data = await rawApi("admin_login", {adminKey});
    try { localStorage.setItem(ADMIN_SESSION_KEY, data.adminSessionToken); } catch (error) {}
    return data;
  },
  adminLogout() { try { localStorage.removeItem(ADMIN_SESSION_KEY); } catch (error) {} },
  adminSessionActive() {
    try {
      const token = localStorage.getItem(ADMIN_SESSION_KEY) || "";
      return Boolean(token && tokenExpiry(token) > Date.now());
    } catch (error) { return false; }
  },
  adminListPending: () => adminApi("admin_list_pending"),
  adminUpdateProvider: (userUid, status) => adminApi("admin_update_provider", {payload: {userUid, status}})
};

async function adminApi(action, body = {}) {
  let token = null;
  try { token = localStorage.getItem(ADMIN_SESSION_KEY); } catch (error) {}
  const response = await fetch(config.appsScriptUrl, {
    method: "POST",
    headers: {"Content-Type": "text/plain;charset=utf-8"},
    body: JSON.stringify({action, adminSessionToken: token, ...body})
  });
  const envelope = await response.json().catch(() => ({}));
  if (!response.ok || envelope.ok === false) throw new Error(envelope.error || `Request failed (${response.status})`);
  return envelope.data;
}

window.dispatchEvent(new CustomEvent("podi-backend-ready"));
