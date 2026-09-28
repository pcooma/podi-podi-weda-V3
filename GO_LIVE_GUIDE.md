# Podi Podi Weda — Google Drive backend go-live guide

This deployment keeps the data in your Google Drive. Firebase is used only for secure login and email verification.

The prepared Drive records are already available:

- [Podi podi Weda root folder](https://drive.google.com/drive/folders/1zwnXP1BQJudpeQSGpUPOob5GpEUL3mH5)
- [Master User Registry](https://docs.google.com/spreadsheets/d/1ubk-WwfgWXnWL_y9LQ0s6Di1UjYsl74B1RFDQiLOSrs/edit?usp=drivesdk)

## 1. Create or select the Firebase project

Open [Firebase Console](https://console.firebase.google.com/). Create a project named `podi-podi-weda` or select the project you want to use.

Then:

1. Open **Build → Authentication → Get started**.
2. Open **Sign-in method**.
3. Enable **Email/Password**.
4. In **Authentication → Settings → Authorized domains**, add:
   `pcooma.github.io`
5. Open **Project settings → General → Your apps**.
6. Add a Web app and copy the Firebase web configuration. These web identifiers are public and may be placed in `config.js`; never copy a service-account key there.

Keep the Firebase web API key. The Apps Script uses it only to verify Firebase ID tokens through Google's Identity Toolkit API.

## 2. Create the Apps Script project

Open [Google Apps Script](https://script.google.com/) and choose **New project**.

1. Rename it `Podi Podi Weda — Drive Backend`.
2. Replace the default file with the contents of [`gas_backend/Code.gs`](</Users/pc/Documents/GitHub/podi podi weda V3/gas_backend/Code.gs>).
3. Open **Project Settings → Show `appsscript.json` manifest file**.
4. Replace the manifest with [`gas_backend/appsscript.json`](</Users/pc/Documents/GitHub/podi podi weda V3/gas_backend/appsscript.json>).

## 3. Add Apps Script properties

In **Project Settings → Script Properties**, add these properties:

| Property | Value |
|---|---|
| `FIREBASE_WEB_API_KEY` | Firebase web API key from step 1 |
| `ADMIN_KEY` | A long random value used only by owner/admin calls |
| `ROOT_FOLDER_ID` | `1zwnXP1BQJudpeQSGpUPOob5GpEUL3mH5` |
| `USERS_FOLDER_ID` | `193a7fFJaV9QfzK5QZj9jQ95U1OQ_-oVk` |
| `DB_SPREADSHEET_ID` | `1ubk-WwfgWXnWL_y9LQ0s6Di1UjYsl74B1RFDQiLOSrs` |
| `MAX_UPLOAD_BYTES` | `5242880` |

Do not put `ADMIN_KEY` in GitHub, `config.js`, browser code, or chat messages.

## 4. Initialise the Drive database

In Apps Script:

1. Select `setup` from the function dropdown.
2. Click **Run**.
3. Review and approve the requested permissions for Drive, Sheets and external requests.
4. Confirm that the master spreadsheet contains these new tabs:
   `DB_Users`, `DB_Documents`, `DB_Jobs`, `DB_Bookings`, `DB_Audit`.

The existing Drive hierarchy is preserved. The script creates a user folder only after a verified user saves a provider profile.

## 5. Deploy the web app

In Apps Script:

1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as**: `Me`.
4. Set **Who has access**: `Anyone`.
5. Deploy and copy the `/exec` URL.

Test it in a browser by opening:

`YOUR_APPS_SCRIPT_EXEC_URL?action=health`

You should receive JSON containing `ok: true` and build `2026-09-28-drive-v1`.

## 6. Configure the website

Copy [`config.example.js`](</Users/pc/Documents/GitHub/podi podi weda V3/config.example.js>) to `config.js` and replace the placeholders:

```js
window.PODI_PODI_CONFIG = {
  appsScriptUrl: "YOUR_APPS_SCRIPT_EXEC_URL",
  firebase: {
    apiKey: "YOUR_FIREBASE_WEB_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    appId: "YOUR_FIREBASE_APP_ID"
  }
};
```

The Firebase web configuration and Apps Script `/exec` URL are public client configuration. Do not add `ADMIN_KEY` or a service-account JSON file.

Then commit and push `config.js` to the `main` branch so GitHub Pages publishes it. The site will automatically change from preview mode to secure-backend mode when the configuration is valid.

## 7. Test one provider end to end

1. Open the [live website](https://pcooma.github.io/podi-podi-weda-V3/).
2. Register with an email and password.
3. Open the Firebase verification email and verify the address.
4. Log in again.
5. Open **වැඩක් කරන්න**, complete the profile and save it.
6. Check `01_USERS_PRIVATE` in the [root Drive folder](https://drive.google.com/drive/folders/1zwnXP1BQJudpeQSGpUPOob5GpEUL3mH5). A folder named `USR-<id>__<username>` should exist with `profile.json` and the standard private subfolders.
7. Upload a test certificate. Confirm it appears in that user's private qualification folder and in `DB_Documents`.

New providers start as `pending_review`. They are not returned by public provider search until approved.

## 8. Approve a provider for pilot testing

In Apps Script, obtain the user's `user_uid` from `DB_Users`, then run this from the editor's execution log/console:

```js
approveProvider('PASTE_USER_UID_HERE');
```

This changes both the index row and the user's `profile.json` status to `approved`.

## 9. Test client data and booking persistence

After approving a provider:

1. Sign in as a client account.
2. Submit a service request.
3. Confirm a row appears in `DB_Jobs`.
4. Confirm matching provider cards are based on approved `DB_Users` rows.
5. Request a booking and confirm a row appears in `DB_Bookings`.
6. Confirm the action appears in `DB_Audit`.

Contact release and payments remain intentionally gated until payment verification and admin approval workflows are implemented. No fake payment is recorded.

## Security rules before public promotion

- Keep the root Drive folder private.
- Do not make user folders or identity documents “Anyone with the link”.
- Never store passwords in Drive, Sheets, Apps Script properties or browser storage.
- Use only verified Firebase users for profile, document, job and booking operations.
- Approve providers manually until document review and malware scanning are operational.
- Test with non-sensitive files first.
- Keep the Apps Script deployment URL and Firebase configuration separate from `ADMIN_KEY`.

