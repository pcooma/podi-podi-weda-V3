// Public runtime configuration. Safe to commit: the Apps Script /exec URL is a
// public endpoint. No Firebase and no secrets belong here — never add ADMIN_KEY.
//
// GO LIVE: after redeploying gas_backend/Code.gs (the OTP backend), change
// backend from "demo" to "live" and push. The site then switches from the
// client-side preview to real email-code accounts, jobs, and bookings.
window.PODI_PODI_CONFIG = {
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbz-sCzFLWCiTFBClWdshNSaP_J0gvu1qXPIcB4-aH8DXCwnMcR6RSynV-Q3pW-VgFL6/exec",
  backend: "live"
};
