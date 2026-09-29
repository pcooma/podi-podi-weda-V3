# Podi Podi Weda — Google Drive backend go-live guide

This deployment keeps all data in your Google Drive. Sign-in is **passwordless
email one-time-codes (OTP)** handled entirely by Google Apps Script — there is
no Firebase and no password storage.

The prepared Drive records are already available:

- [Podi podi Weda root folder](https://drive.google.com/drive/folders/1zwnXP1BQJudpeQSGpUPOob5GpEUL3mH5)
- [Master User Registry](https://docs.google.com/spreadsheets/d/1ubk-WwfgWXnWL_y9LQ0s6Di1UjYsl74B1RFDQiLOSrs/edit?usp=drivesdk)

## How sign-in works

1. The visitor enters their email and clicks **කේතය එවන්න** (Send code).
2. Apps Script emails a 6-digit code (via `MailApp`, sent from the account that
   deploys the script) and remembers a hash of it for 10 minutes.
3. The visitor enters the code. On success Apps Script returns an HMAC-signed
   session token (valid 30 days) that the browser stores and sends on every
   authenticated request.

No passwords are ever created, sent, or stored.

## 1. Create the Apps Script project

Open [Google Apps Script](https://script.google.com/) and choose **New project**.

1. Rename it `Podi Podi Weda — Drive Backend`.
2. Replace the default file with the contents of [`gas_backend/Code.gs`](gas_backend/Code.gs).
3. Open **Project Settings → Show `appsscript.json` manifest file**.
4. Replace the manifest with [`gas_backend/appsscript.json`](gas_backend/appsscript.json).

## 2. Add Apps Script properties

In **Project Settings → Script Properties**, add:

| Property | Value |
|---|---|
| `ADMIN_KEY` | A long random value. Also signs sessions/OTP unless `SESSION_SECRET` is set. Keep it secret. |
| `ROOT_FOLDER_ID` | `1zwnXP1BQJudpeQSGpUPOob5GpEUL3mH5` |
| `USERS_FOLDER_ID` | `193a7fFJaV9QfzK5QZj9jQ95U1OQ_-oVk` |
| `DB_SPREADSHEET_ID` | `1ubk-WwfgWXnWL_y9LQ0s6Di1UjYsl74B1RFDQiLOSrs` |
| `MAX_UPLOAD_BYTES` | `5242880` |

Optional: `SESSION_SECRET` — a dedicated signing key. If omitted, `ADMIN_KEY`
is used. Never put `ADMIN_KEY` or `SESSION_SECRET` in GitHub, `config.js`,
browser code, or chat messages.

## 3. Initialise the Drive database

In Apps Script:

1. Select `setup` from the function dropdown and click **Run**.
2. Approve the requested permissions for Drive, Sheets, and **sending email as
   you** (this is what delivers the login codes).
3. Confirm the master spreadsheet now has these tabs:
   `DB_Users`, `DB_Documents`, `DB_Jobs`, `DB_RequestKeys`, `DB_Bookings`,
   `DB_Ratings`, `DB_Audit`.

## 4. Deploy the web app

1. **Deploy → New deployment → Web app**.
2. **Execute as**: `Me`.
3. **Who has access**: `Anyone`.
4. Deploy and copy the `/exec` URL.

Test it in a browser: `YOUR_APPS_SCRIPT_EXEC_URL?action=health` should return
JSON with `ok: true` and the expected `build` value from the current
`gas_backend/Code.gs` source.

## 5. Point the website at the backend and go live

`config.js` already holds the `/exec` URL. To switch the live site from the
client-side preview to real accounts, change **one line**:

```js
window.PODI_PODI_CONFIG = {
  appsScriptUrl: "YOUR_APPS_SCRIPT_EXEC_URL",
  backend: "live"   // was "demo"
};
```

Commit and push `config.js` to `main`. GitHub Pages redeploys and the site
switches from preview mode to secure email-code accounts automatically.

> Keep `backend` set to `"demo"` until the Apps Script above is deployed. The
> site stays a safe client-side preview until you flip it to `"live"`.

## 6. Test one provider end to end

1. Open the [live website](https://pcooma.github.io/podi-podi-weda-V3/).
2. Open **ගිණුම**, enter an email, and request a code.
3. Enter the emailed code to sign in.
4. Open **වැඩක් කරන්න**, complete the profile, and save it.
5. Check `01_USERS_PRIVATE` in the [root Drive folder](https://drive.google.com/drive/folders/1zwnXP1BQJudpeQSGpUPOob5GpEUL3mH5).
   A folder `USR-<id>__<username>` should exist with `profile.json`.
   Document subfolders are created only when a user uploads matching evidence.
6. Upload a test certificate and confirm it appears in that user's private
   qualification folder and in `DB_Documents`.

New providers are published immediately with an **unverified** status. Provider
profiles and uploaded credentials are user-submitted and are not independently
verified by the platform. Existing `pending_review` profiles also become
searchable after this backend update; suspended/rejected profiles remain hidden.

## 7. Optional provider moderation

In Apps Script, obtain the user's `user_uid` from `DB_Users`, then run from the
editor:

```js
approveProvider('PASTE_USER_UID_HERE');
```

This changes both the index row and the user's `profile.json` status to
`approved`, which marks the profile as verified. Do not use this for routine
account creation; reserve it for deliberate verification or exceptional cases.

## 8. Test client data and booking persistence

After provider registration:

1. Sign in as a client account (any email + code).
2. Submit a service request → confirm a row in `DB_Jobs`.
3. Confirm matching provider cards come from approved `DB_Users` rows.
4. Request a booking → confirm a row in `DB_Bookings`.
5. Confirm the action appears in `DB_Audit`.

Contact release and payments remain intentionally gated until payment
verification and admin approval workflows are implemented. No fake payment is
recorded.

## Security notes before public promotion

- Keep the root Drive folder private. Do not make user folders or identity
  documents “Anyone with the link”.
- No passwords exist anywhere; sessions are short-lived signed tokens. Keep
  `ADMIN_KEY` / `SESSION_SECRET` out of the browser and the repo.
- `MailApp` daily send quota (100/day consumer, 1500/day Workspace) caps how
  many login codes can be sent per day — fine for a pilot, plan ahead for scale.
- Do not describe user-submitted documents as verified. Identity checks are not
  automated until an authorized authoritative identity service is integrated.
- Test with non-sensitive files first.

## Self-service accounts and identity assurance

- Account setup is self-service. The first successful emailed one-time-code
  login creates a private account row, internal UUID, `profile.json`, and a
  dedicated Drive folder. A provider profile upgrades that same account/folder.
  The normalized, verified email is the unique login key; a username is unique
  for discovery but is not proof of identity.
- NIC numbers and ID images are not requested as part of account creation. The
  app does not independently prove that an account represents one unique legal
  person. Do not advertise the profile as identity-verified.
- If the user loses access to their email or has duplicate records, the app
  currently has no automated recovery/merge workflow. Do not merge based only on
  a typed NIC number or uploaded image. Add an automated authoritative identity
  provider before offering that promise.
- A person may choose to sign in with an email they can access; email is not
  required on their public provider profile. Broader phone-based access requires
  a budgeted OTP provider or an eligible official identity integration.
- The code change removes the manual ID-review queue and its `DB_IdentityReviews`
  sheet requirement. Run `setup` after updating Apps Script to initialize the
  remaining tabs, then deploy a new web-app version.
