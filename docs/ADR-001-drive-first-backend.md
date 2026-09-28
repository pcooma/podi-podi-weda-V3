# ADR-001: Google Drive-first marketplace backend

**Status:** Accepted
**Date:** 2026-09-28
**Decider:** Product owner

## Context

Podi Podi Weda must keep marketplace records in the owner's Google Drive. Each user needs a dedicated folder containing their profile record and private uploads. The public GitHub Pages site cannot safely write directly to Drive or contain a privileged Google key.

## Decision

- Firebase Authentication manages email/password identity and verified email. Passwords never enter Drive or Apps Script.
- A deployed Google Apps Script web app verifies each Firebase ID token before reading or writing user data.
- Each user receives `01_USERS_PRIVATE/USR-<firebase-uid-prefix>__<username>/` with dedicated profile, identity, qualification, work-history, portfolio, booking, payment, compliance and audit subfolders.
- `profile.json` in the user's folder is the durable user record.
- Operational Google Sheets tabs provide flattened indexes for search, sorting and matching. They contain metadata and Drive file IDs, not passwords or raw file content.
- Uploaded files remain private in Drive. The backend never calls public-sharing APIs.
- Public provider search returns only approved public fields. Contact details and private document links are excluded.

## Consequences

- The owner can inspect and export all records directly from Drive.
- No Cloud SQL or Cloud Storage deployment is required for the pilot.
- Apps Script and Sheets are appropriate for a controlled pilot, not high-volume marketplace traffic. Reassess before sustained concurrency exceeds Apps Script quotas or the index reaches tens of thousands of active records.
- Firebase and Apps Script deployments remain separate release gates.

## Required controls

1. Deploy Apps Script as the owner and allow public invocation.
2. Require a valid Firebase ID token for every personal-data operation.
3. Keep admin secrets only in Apps Script Properties.
4. Keep the root Drive folder private.
5. Review and approve providers before public search visibility.
6. Retain audit rows for profile, document, job and booking actions.

