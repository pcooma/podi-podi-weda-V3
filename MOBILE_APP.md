# Podi Podi Weda — Android app

The website is a **PWA (Progressive Web App)**, so it *is* the app. There is one
codebase; the web and the Android app stay in sync automatically because both
load the same GitHub Pages deployment. No separate native project to maintain.

There are two ways to put it on phones, in increasing effort.

---

## 1. Install now — no build, no store (works today)

On an Android phone, open <https://pcooma.github.io/podi-podi-weda-V3/> in
**Chrome** -> **menu -> "Install app" / "Add to Home screen"**. It installs with
the Podi Podi Weda icon and launches fullscreen like a native app.

The site also shows a **"App එක install කරන්න"** button in the header when the
browser reports the app is installable, which triggers the same native prompt.

Recommended for the pilot: zero cost, and every GitHub push reaches installed
users automatically.

---

## 2. Publish to Google Play — wrap the PWA as a TWA

A **Trusted Web Activity (TWA)** is a thin Android app that shows the PWA
fullscreen with no browser UI. It reuses this exact site, so you never rebuild
the app for content or UI changes.

### Prerequisites (your machine or a CI runner)
- Node.js 18+, JDK 17, Android SDK (from Android Studio)
- A Google Play developer account ($25 one-time)

### Build (Bubblewrap)

    npm install -g @bubblewrap/cli
    bubblewrap init --manifest https://pcooma.github.io/podi-podi-weda-V3/manifest.webmanifest
    bubblewrap build

Outputs: `app-release-signed.apk` (sideload/testing), `app-release-bundle.aab`
(upload to Play Console), and a signing key — **back it up; you cannot update
the app without it.**

### Digital Asset Links (removes the URL bar) — note for github.io

To hide the address bar, a file must be served at the **origin root**:
`https://pcooma.github.io/.well-known/assetlinks.json`. Because this site lives
under `/podi-podi-weda-V3/` (a project page), the origin root is served by a
separate `pcooma.github.io` repo. Options:

- **A (best long term): a custom domain** (e.g. app.podipodiweda.lk) pointed at
  GitHub Pages, hosting `/.well-known/assetlinks.json`.
- **B:** commit `assetlinks.json` to your `pcooma.github.io` user repo root.

Bubblewrap prints the exact `assetlinks.json` (with your signing fingerprint).
Without it the app still works — it just shows a small address bar.

### Play Console
Upload the `.aab`, fill the listing (name, descriptions, screenshots, 512x512
icon), set content rating + privacy policy, submit for review.

---

## Icons
Source icons: `icon-192.svg`, `icon-512.svg`, `icon-maskable.svg`. Bubblewrap
rasterizes them to the PNG sizes Android needs.
