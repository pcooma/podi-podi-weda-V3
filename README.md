# Podi Podi Weda Webapp Prototype

> **Public launch status:** GitHub Pages serves a preview, not the production marketplace. The preview keeps client matching test data in the visitor's browser. Account entry, provider registration, document uploads, payments and bookings remain disabled until the separate authenticated backend is deployed and configured.

This folder now contains a dependency-free Sinhala-first workforce marketplace prototype based on the two specification documents in this repo. The production pilot architecture is documented in [GO_LIVE_GUIDE.md](GO_LIVE_GUIDE.md) and uses Firebase Authentication plus a Google Drive/Sheets-backed Apps Script API.

## What is included

- Client job posting with Sinhala requirement text, district, urgency, budget, date, and attachments.
- Shared structured client/workforce options so common requests match without AI.
- Claude/Admin fallback preview only for custom or unclear requirements.
- Work size and required worker-count capture, so individual, team, and quote-request jobs route differently.
- Materials/tools responsibility capture: client-provided goods, provider tools, provider-supplied materials, mixed supply, or unknown/advice-needed.
- Multiple client access windows such as morning, lunch hour, evening, and night, matched against provider availability windows.
- Mobile-first landing screen with yellow safety-hat theme, large role symbols, and bottom navigation.
- Supply-demand pricing: clients enter the value they are willing to pay, while providers publish their own offer prices.
- Provider slot-rate cards for morning, lunch hour, evening, and night, so the same worker can charge different fees by time.
- Simplified provider pricing: workers can choose one daily/work rate by default, or opt into selected time slots with different rates.
- Post-registration rate and availability updates from the provider workspace, so providers can change prices and available slots over time.
- Distance-aware effective pricing that adds travel cost before comparing provider offers with the client budget.
- Transport service support for three-wheel, bike delivery, pickup/drop, and small-goods jobs where time and distance strongly affect price.
- Expanded service catalog based on local/freelance marketplace patterns: printing, graphic design, type setting, data entry, writing/translation, web development, digital marketing, video/photo, computer/mobile repair, pest control, gardening, CCTV, appliance repair, event support, virtual assistant, and beauty/wellness services.
- Deterministic top-5 matching with approval, tier, category, distance, calendar, budget, team-size, and blacklist-style hard filters.
- Weighted scoring aligned to the model docs: skills, availability/time-window fit, proximity, trust tier, rating, similar history, portfolio relevance, budget fit, material/tool fit, response rate, and fair distribution.
- No-match diagnostics for admin/workforce recruitment, showing whether the gap is supply, tier, budget, availability, team size, or service area.
- Provider shortlist cards with verification badges, availability, rates, ratings, distance, and portfolio previews.
- Contact unlock and booking actions with payment/commission/audit state.
- Informative workforce registration with role-specific logic for labourers, trades, technicians, professionals, and other services.
- Role-specific profile capture: service type, skills, fee model, evidence/qualification expectations, service area, rate, experience, and document-upload queue.
- Seed supply now covers labourers, cleaners, skilled trades, bar-bending teams, QS, architect, accountant, teacher-style professional services, printing, digital services, technical repairs, garden teams, CCTV, events, and beauty/wellness.
- Lead queue with WhatsApp-first/SMS-fallback status simulation.
- Admin dashboard for verification, dispute handling, KPIs, and sensitive document audit logging.
- PWA manifest and service worker for local install/offline caching.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## MVP boundaries preserved

The prototype does not build out-of-scope features such as open bidding, in-app chat, masked calling, escrow, subscriptions, native apps, insurance, or multi-country support.
