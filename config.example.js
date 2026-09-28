// Public runtime configuration. Safe to commit: the Apps Script /exec URL is a
// public endpoint. No Firebase and no secrets belong here — never add ADMIN_KEY.
//
// To go live: paste your deployed Apps Script /exec URL and set backend "live".
// While backend is anything other than "live", the site runs in demo/preview
// mode (client-side matching only, no accounts or persistence).
window.PODI_PODI_CONFIG = {
  appsScriptUrl: "YOUR_APPS_SCRIPT_EXEC_URL",
  backend: "live"
};
