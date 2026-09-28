import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const config = window.PODI_PODI_CONFIG;
const listeners = new Set();
let auth = null;
let currentUser = null;

function isConfigured() {
  return Boolean(config?.apiBaseUrl && config?.firebase?.apiKey && !config.firebase.apiKey.includes("replace-me"));
}

if (isConfigured()) {
  auth = getAuth(initializeApp(config.firebase));
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    listeners.forEach((listener) => listener(user));
  });
}

async function api(path, options = {}) {
  if (!currentUser) throw new Error("Please sign in first.");
  const token = await currentUser.getIdToken();
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

window.PodiBackend = {
  isConfigured,
  currentUser: () => currentUser,
  onAuthChange(listener) {
    listeners.add(listener);
    listener(currentUser);
    return () => listeners.delete(listener);
  },
  async register(email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    return credential;
  },
  login: (email, password) => signInWithEmailAndPassword(auth, email, password),
  logout: () => signOut(auth),
  resetPassword: (email) => sendPasswordResetEmail(auth, email),
  getMe: () => api("/v1/me"),
  saveProfile: (profile) => api("/v1/provider-profile", {
    method: "PUT",
    body: JSON.stringify(profile)
  }),
  uploadDocument,
  listDocuments: () => api("/v1/documents")
};

window.dispatchEvent(new CustomEvent("podi-backend-ready"));
