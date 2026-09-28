// The Firebase SDK is loaded lazily, and only when a real configuration is
// present. In preview/demo mode nothing is fetched from gstatic, so the site
// works fully offline with no external dependency.
const config = window.PODI_PODI_CONFIG;
const listeners = new Set();
let auth = null;
let currentUser = null;
let fb = null;

function isConfigured() {
  const backendUrl = config?.appsScriptUrl || config?.apiBaseUrl;
  return Boolean(backendUrl && config?.firebase?.apiKey && !config.firebase.apiKey.includes("replace-me"));
}

async function loadFirebase() {
  const [appMod, authMod] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js")
  ]);
  fb = authMod;
  auth = authMod.getAuth(appMod.initializeApp(config.firebase));
  authMod.onAuthStateChanged(auth, (user) => {
    currentUser = user;
    listeners.forEach((listener) => listener(user));
  });
}

async function api(path, options = {}) {
  if (!currentUser) throw new Error("Please sign in first.");
  const token = await currentUser.getIdToken();
  if (config.appsScriptUrl) {
    const action = String(path).replace(/^\/+|\/+$/g, "").replace(/^v1\//, "").replaceAll("/", "_").replaceAll("-", "_");
    const response = await fetch(config.appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action,
        idToken: token,
        payload: options.body ? JSON.parse(options.body) : {}
      })
    });
    const envelope = await response.json().catch(() => ({}));
    if (!response.ok || envelope.ok === false) throw new Error(envelope.error || `Request failed (${response.status})`);
    return envelope.data;
  }
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

async function uploadDocument(file, type, consentVersion = "v1") {
  if (config.appsScriptUrl) {
    const base64 = await fileToBase64(file);
    return api("upload_document", {
      method: "POST",
      body: JSON.stringify({type, filename: file.name, mimeType: file.type, size: file.size, consentVersion, base64})
    });
  }
  const created = await api("/v1/documents/upload-url", {
    method: "POST",
    body: JSON.stringify({
      type,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      consentVersion
    })
  });
  const upload = await fetch(created.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });
  if (!upload.ok) throw new Error(`Document upload failed (${upload.status})`);
  return api(`/v1/documents/${created.document.id}/complete`, { method: "POST", body: "{}" });
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
  currentUser: () => currentUser,
  onAuthChange(listener) {
    listeners.add(listener);
    listener(currentUser);
    return () => listeners.delete(listener);
  },
  async register(email, password) {
    const credential = await fb.createUserWithEmailAndPassword(auth, email, password);
    await fb.sendEmailVerification(credential.user);
    return credential;
  },
  login: (email, password) => fb.signInWithEmailAndPassword(auth, email, password),
  logout: () => fb.signOut(auth),
  resetPassword: (email) => fb.sendPasswordResetEmail(auth, email),
  getMe: async () => ({ user: await api(config.appsScriptUrl ? "get_me" : "/v1/me") }),
  saveProfile: (profile) => api(config.appsScriptUrl ? "save_profile" : "/v1/provider-profile", {
    method: "PUT",
    body: JSON.stringify(profile)
  }),
  uploadDocument,
  listDocuments: () => api(config.appsScriptUrl ? "list_documents" : "/v1/documents"),
  submitJob: (job) => api("submit_job", {method: "POST", body: JSON.stringify(job)}),
  searchProviders: (query) => api("search_providers", {method: "POST", body: JSON.stringify(query)}),
  createBooking: (booking) => api("create_booking", {method: "POST", body: JSON.stringify(booking)})
};

if (isConfigured()) {
  loadFirebase()
    .catch((error) => console.error("Firebase initialisation failed:", error))
    .finally(() => window.dispatchEvent(new CustomEvent("podi-backend-ready")));
} else {
  window.dispatchEvent(new CustomEvent("podi-backend-ready"));
}
