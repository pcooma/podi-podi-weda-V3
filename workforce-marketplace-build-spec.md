# Workforce Marketplace — MVP Build Specification

**Purpose.** This document is the authoritative build spec for an MVP of a two-sided workforce marketplace for Sri Lanka. It is written to be handed directly to an AI coding agent. Decisions are final; do not substitute alternatives unless a decision is technically impossible, in which case stop and ask.

**Scope discipline (read first).** Build *only* the MVP defined in Section 2. Anything in Section 18 (Out of Scope) must **not** be built, even if it seems easy. The schema is designed so those features can be added later without migration pain, but they are explicitly deferred. Over-building is the primary failure mode for this project.

---

## 1. Product in one sentence

A verified workforce matching platform where clients post a work requirement, the system suggests a small ranked shortlist of suitable, available, verified workers/teams, and the platform monetises the introduction and the completed job — while never positioning itself as the workers' employer.

---

## 2. MVP scope

### In scope
- Worker (supply) and client (demand) registration with OTP phone verification.
- Tiered worker verification (identity + documents) with admin approval and trust badges.
- **Sinhala-first UI** (primary/default language); Tamil and English also supported.
- Category/skill taxonomy (seeded, 3–4 categories for launch cell).
- Client job posting with structured fields + photos.
- **Claude API requirement understanding**: free-text (Sinhala) description → structured category, skill tags, clarifying questions, and risk flags.
- Matching engine: deterministic hard filters + score, with **Claude-assisted re-rank and Sinhala rationale** for the top-5 shortlist.
- Lead delivery to workers via SMS/WhatsApp (not dashboard-only).
- Contact reveal gated by a paid client unlock (MVP revenue mechanism — see §10).
- **Worker rate card** (daily wage / per-job / per-visit) + **scope-based quotes** for teams — financial transparency for both sides before agreement.
- **Worker portfolio gallery** (showcase images) so clients can choose by visual reference.
- **Job size & skill-level** capture for common works (small/medium/large; basic/skilled/specialist).
- **Scheduling & availability calendar**: workers set working hours/time-off; clients book a slot with location.
- Booking lifecycle with **at-job check-in** (selfie matched to verified profile).
- **Two-sided structured reviews** — work quality + punctuality from the client side, payment-correctness + conduct from the worker side, with double-blind release.
- Disputes (manual admin resolution).
- Admin console: verification queue, category management, dispute handling, user suspension/blacklist, basic analytics.
- Audit logging and PDPA-aligned data controls.

### Explicitly NOT in MVP (see §18)
Open bidding job board, in-app chat, masked calling, escrow/fund-holding, worker subscriptions, profile boosts, enterprise accounts, native mobile apps, insurance, multi-country, automated certificate verification against issuing bodies.

---

## 3. Roles

| Role | Description |
|------|-------------|
| `client` | Posts jobs, views shortlists, unlocks contacts, confirms/rates bookings. |
| `worker` | Service provider: individual, team lead, or registered business. Receives leads, responds, performs jobs. |
| `admin` | Internal staff: verification, disputes, moderation, config. |
| `superadmin` | Full access incl. role management and audit export. |

A single authenticated person may hold both `client` and `worker` roles. The permanent internal identity is the Firebase `uid`; email, verified phone and a unique normalized username are identifiers attached to that account, not database primary keys.

---

## 4. System architecture

```
[ Web/PWA ]  --- HTTPS/REST --->  [ Cloud Run TypeScript API ]  --->  [ Cloud SQL PostgreSQL + PostGIS ]
  - client app                       - Firebase token verification        - core data
  - worker app                          - matching             [ Redis ]
  - /admin (role-gated)                 - jobs/bookings          - OTP store, rate limit,
                                         - payments webhooks       lead-delivery queue
                                         - notifications        [ Google Cloud Storage ]
                                              |                   - private PII bucket (signed URLs)
                                              |                   - public profile media
                                   +-------+--------+--------+-----------+
                                   |       |        |        |           |
                            [ SMS GW ] [ WhatsApp ] [ PSP ] [ Anthropic Claude API ]
                                                            (requirement NLP + re-rank)
```

Single backend service for MVP (modular monolith in NestJS, not microservices). Admin is a role-gated section of the same Next.js app.

---

## 5. Tech stack (final)

| Layer | Choice |
|-------|--------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, mobile-first PWA |
| i18n | `next-intl`, locales `si` (default), `ta`, `en`, switchable. Bundle a Sinhala Unicode webfont (e.g. Noto Sans Sinhala); verify rendering/input on low-end Android. |
| Backend | TypeScript REST modular monolith on Google Cloud Run (foundation implemented with Express; preserve module boundaries) |
| ORM | Prisma |
| Database | PostgreSQL 15+ with PostGIS extension |
| Cache/queue | Redis (OTP TTL, rate limiting, BullMQ for lead-delivery jobs) |
| Object storage | Google Cloud Storage; **private** bucket for PII, short-lived signed upload/download URLs only |
| Auth | Firebase Authentication. Verified email/password is implemented first; verified phone and Google sign-in may be linked to the same Firebase `uid`. The application never stores passwords. |
| SMS | Pluggable provider interface (implement one local SL gateway adapter + a Twilio fallback adapter). |
| WhatsApp | WhatsApp Cloud API adapter behind the same notification interface. |
| Payments | PSP adapter interface; implement PayHere first. **Platform never holds funds.** |
| Geo | PostGIS for distance; Google Maps Geocoding (or Nominatim) for client address → lat/lng. |
| AI / NLP | Anthropic Claude API (Messages API) for requirement understanding + shortlist re-rank/rationale. Use **Claude Haiku** (`claude-haiku-4-5-20251001`) for extraction (cheap/fast); Claude Sonnet only if richer re-rank is needed. Force structured output via tool-use JSON. Behind an adapter with a rule-based fallback. |
| Analytics | Expose read-only SQL views; connect Metabase later (not built in MVP). |

All third-party integrations go behind an interface/adapter so the agent can ship with a mock/sandbox adapter and swap real credentials via env vars.

---

## 6. Data model

PostgreSQL DDL below is the source of truth. Use Prisma schema mirroring it. **Sensitive PII lives in a separate table (`worker_pii`) with restricted access** — never join it into list/search queries, never expose its columns to client or worker API responses.

### 6.1 Enums

```sql
CREATE TYPE user_role        AS ENUM ('client','worker','admin','superadmin');
CREATE TYPE user_status      AS ENUM ('pending','active','suspended','banned');
CREATE TYPE worker_type      AS ENUM ('individual','team','business');
CREATE TYPE client_type      AS ENUM ('household','business','contractor');
CREATE TYPE rate_type        AS ENUM ('hourly','daily','per_job','per_visit','quote_only');
CREATE TYPE availability      AS ENUM ('available','busy','offline');
CREATE TYPE verification_tier AS ENUM ('t0_phone','t1_id','t2_profile','t3_skill','t4_police','t5_business','t6_vetted');
CREATE TYPE doc_type          AS ENUM ('nic_front','nic_back','selfie','police_clearance','certificate','business_reg','insurance','driving_licence','safety_cert','reference');
CREATE TYPE doc_status        AS ENUM ('submitted','verified','rejected','expired');
CREATE TYPE urgency           AS ENUM ('emergency','today','this_week','scheduled');
CREATE TYPE materials_by      AS ENUM ('client','worker','both','na');
CREATE TYPE job_size          AS ENUM ('small','medium','large','ongoing');
CREATE TYPE skill_level        AS ENUM ('basic','skilled','specialist');
CREATE TYPE job_status        AS ENUM ('draft','posted','matching','shortlisted','contact_revealed','booked','in_progress','completed','cancelled','expired');
CREATE TYPE match_status      AS ENUM ('suggested','invited','accepted','declined','expired');
CREATE TYPE booking_status    AS ENUM ('pending','confirmed','checked_in','in_progress','completed','cancelled','disputed');
CREATE TYPE payment_type      AS ENUM ('contact_unlock','commission','refund');
CREATE TYPE payment_status    AS ENUM ('initiated','paid','failed','refunded');
CREATE TYPE review_direction  AS ENUM ('client_to_worker','worker_to_client');
CREATE TYPE review_status     AS ENUM ('published','hidden','flagged');
CREATE TYPE dispute_status    AS ENUM ('open','investigating','resolved','rejected');
CREATE TYPE notif_channel     AS ENUM ('sms','whatsapp','push','email','in_app');
```

### 6.2 Core tables

```sql
-- Identity
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role            user_role NOT NULL,
  phone           VARCHAR(20) UNIQUE NOT NULL,
  phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  email           VARCHAR(255),
  password_hash   VARCHAR(255),            -- optional
  preferred_language VARCHAR(2) NOT NULL DEFAULT 'si',  -- si (default) | ta | en
  status          user_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE client_profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name    VARCHAR(150) NOT NULL,
  client_type     client_type NOT NULL DEFAULT 'household',
  default_district VARCHAR(80),
  default_location GEOGRAPHY(POINT,4326),
  business_name   VARCHAR(200),
  business_reg_no VARCHAR(60),
  rating_avg      NUMERIC(2,1) DEFAULT 0,
  rating_count    INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE worker_profiles (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name     VARCHAR(150) NOT NULL,
  worker_type      worker_type NOT NULL DEFAULT 'individual',
  bio              TEXT,
  profile_photo_url TEXT,                  -- public bucket
  base_district    VARCHAR(80) NOT NULL,
  base_location    GEOGRAPHY(POINT,4326) NOT NULL,
  service_radius_km INT NOT NULL DEFAULT 15,
  years_experience INT DEFAULT 0,
  team_size        INT DEFAULT 1,
  rate_type        rate_type NOT NULL DEFAULT 'quote_only',  -- headline rate; itemised pricing lives in worker_rates
  rate_amount      NUMERIC(12,2),                            -- headline amount (NULL for quote_only / teams)
  min_job_value    NUMERIC(12,2) DEFAULT 0,
  availability_status availability NOT NULL DEFAULT 'offline',
  verification_tier verification_tier NOT NULL DEFAULT 't0_phone',
  is_approved      BOOLEAN NOT NULL DEFAULT FALSE,   -- admin gate before matchable
  rating_avg       NUMERIC(2,1) DEFAULT 0,
  rating_count     INT DEFAULT 0,
  jobs_completed   INT DEFAULT 0,
  leads_received   INT DEFAULT 0,
  leads_responded  INT DEFAULT 0,           -- response_rate = responded/received
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_worker_location ON worker_profiles USING GIST (base_location);

-- SENSITIVE: isolated, admin-only access, never in list queries.
CREATE TABLE worker_pii (
  user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nic_number_enc     BYTEA,        -- encrypted at app layer (envelope encryption)
  date_of_birth      DATE,
  full_address_enc   BYTEA,
  bank_account_enc   BYTEA,
  emergency_contact_enc BYTEA,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Worker rate card: transparent, itemised pricing (individuals). Teams usually quote_only and price by scope via quotes.
CREATE TABLE worker_rates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id),     -- optional: rate scoped to a category
  skill_id    INT REFERENCES skills(id),         -- optional: rate scoped to a specific task
  label       VARCHAR(120) NOT NULL,             -- e.g. "Daily wage", "Call-out visit", "Tap replacement"
  rate_type   rate_type NOT NULL,                -- hourly | daily | per_job | per_visit | quote_only
  amount      NUMERIC(12,2),                     -- NULL when quote_only
  currency    VARCHAR(3) NOT NULL DEFAULT 'LKR',
  notes       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_worker_rates_worker ON worker_rates (worker_id);

-- Portfolio: showcase images of past work (PUBLIC bucket). Clients pick by visual reference.
CREATE TABLE worker_portfolio (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,                     -- public bucket
  caption     VARCHAR(200),
  category_id INT REFERENCES categories(id),
  skill_id    INT REFERENCES skills(id),
  is_hidden   BOOLEAN NOT NULL DEFAULT FALSE,    -- admin moderation
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_worker_portfolio_worker ON worker_portfolio (worker_id);

-- Availability calendar: recurring weekly working hours + one-off days off.
-- Live free/busy = working_hours − time_off − confirmed bookings (computed, not stored as slots).
CREATE TABLE worker_working_hours (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekday    SMALLINT NOT NULL,                  -- 0=Sun .. 6=Sat
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  UNIQUE (worker_id, weekday, start_time)
);

CREATE TABLE worker_time_off (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  off_date   DATE NOT NULL,
  reason     VARCHAR(120),
  UNIQUE (worker_id, off_date)
);

-- Taxonomy (self-referencing for sector > category > [skill via tags])
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  parent_id   INT REFERENCES categories(id),
  slug        VARCHAR(80) UNIQUE NOT NULL,
  name_en     VARCHAR(120) NOT NULL,
  name_si     VARCHAR(120),
  name_ta     VARCHAR(120),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT DEFAULT 0
);

CREATE TABLE skills (
  id          SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id),
  slug        VARCHAR(80) UNIQUE NOT NULL,
  name_en     VARCHAR(120) NOT NULL,
  name_si     VARCHAR(120),
  name_ta     VARCHAR(120)
);

CREATE TABLE worker_categories (
  worker_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id),
  PRIMARY KEY (worker_id, category_id)
);

CREATE TABLE worker_skills (
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id  INT REFERENCES skills(id),
  PRIMARY KEY (worker_id, skill_id)
);

-- Verification documents (files in PRIVATE bucket; store key, not URL)
CREATE TABLE verification_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type    doc_type NOT NULL,
  storage_key TEXT NOT NULL,
  status      doc_status NOT NULL DEFAULT 'submitted',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  expires_at  DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES users(id),
  title           VARCHAR(200) NOT NULL,
  category_id     INT NOT NULL REFERENCES categories(id),
  description     TEXT NOT NULL,
  district        VARCHAR(80) NOT NULL,
  location        GEOGRAPHY(POINT,4326) NOT NULL,
  address_text    TEXT,                       -- revealed only after contact reveal
  urgency         urgency NOT NULL DEFAULT 'this_week',
  scheduled_date  DATE,
  expected_duration VARCHAR(60),
  preferred_start TIMESTAMPTZ,                  -- client's preferred date/time (calendar booking)
  job_size        job_size NOT NULL DEFAULT 'small',     -- small | medium | large | ongoing
  skill_level     skill_level NOT NULL DEFAULT 'basic',  -- basic | skilled | specialist
  budget_min      NUMERIC(12,2),
  budget_max      NUMERIC(12,2),
  materials_by    materials_by NOT NULL DEFAULT 'na',
  required_min_tier verification_tier NOT NULL DEFAULT 't1_id',
  workers_needed  INT NOT NULL DEFAULT 1,
  needs_quote     BOOLEAN NOT NULL DEFAULT FALSE,
  needs_site_visit BOOLEAN NOT NULL DEFAULT FALSE,
  ai_summary      TEXT,                       -- Claude-normalised scope summary (Sinhala)
  ai_meta         JSONB,                      -- raw Claude extraction: tags, questions, risk flags, confidence
  ai_processed    BOOLEAN NOT NULL DEFAULT FALSE,
  status          job_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ
);
CREATE INDEX idx_job_location ON jobs USING GIST (location);
CREATE INDEX idx_job_status   ON jobs (status);

CREATE TABLE job_attachments (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id    UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL          -- image | video | document
);

CREATE TABLE job_skill_tags (
  job_id   UUID REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id),
  source   VARCHAR(10) DEFAULT 'ai',        -- ai | system | manual
  PRIMARY KEY (job_id, skill_id)
);

-- Matching results
CREATE TABLE matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id    UUID NOT NULL REFERENCES users(id),
  match_score  NUMERIC(6,2) NOT NULL,
  rank         INT NOT NULL,
  status       match_status NOT NULL DEFAULT 'suggested',
  invited_at   TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  UNIQUE (job_id, worker_id)
);

CREATE TABLE quotes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id    UUID NOT NULL REFERENCES users(id),
  amount       NUMERIC(12,2) NOT NULL,          -- total quoted price
  labour_amount    NUMERIC(12,2),               -- scope breakdown (teams / large jobs)
  materials_amount NUMERIC(12,2),
  estimated_days   NUMERIC(5,1),
  message      TEXT,
  valid_until  DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, worker_id)
);

-- Contact reveal = MVP revenue event
CREATE TABLE contact_reveals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id),
  client_id   UUID NOT NULL REFERENCES users(id),
  worker_id   UUID NOT NULL REFERENCES users(id),
  payment_id  UUID,                          -- FK to payments
  revealed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, worker_id)
);

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id),
  worker_id       UUID NOT NULL REFERENCES users(id),
  client_id       UUID NOT NULL REFERENCES users(id),
  agreed_amount   NUMERIC(12,2),
  scheduled_start TIMESTAMPTZ,                  -- agreed calendar slot
  scheduled_end   TIMESTAMPTZ,
  status          booking_status NOT NULL DEFAULT 'pending',
  checkin_at      TIMESTAMPTZ,
  checkin_selfie_key TEXT,                    -- anti-substitution: at-job verification
  checkin_lat     DOUBLE PRECISION,
  checkin_lng     DOUBLE PRECISION,
  completed_at    TIMESTAMPTZ,
  commission_rate NUMERIC(4,3),               -- snapshot at booking time
  commission_amount NUMERIC(12,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),  -- who pays
  type          payment_type NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  currency      VARCHAR(3) NOT NULL DEFAULT 'LKR',
  psp_provider  VARCHAR(40),
  psp_reference VARCHAR(120),
  status        payment_status NOT NULL DEFAULT 'initiated',
  related_job_id    UUID REFERENCES jobs(id),
  related_booking_id UUID REFERENCES bookings(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at       TIMESTAMPTZ
);

CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  author_id  UUID NOT NULL REFERENCES users(id),
  target_id  UUID NOT NULL REFERENCES users(id),
  direction  review_direction NOT NULL,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  criteria   JSONB,                             -- structured sub-ratings; see §9.6
  payment_ok BOOLEAN,                           -- worker→client: was payment made correctly
  comment    TEXT,
  is_released BOOLEAN NOT NULL DEFAULT FALSE,   -- double-blind: visible only after both submit / window
  status     review_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, direction)
);

CREATE TABLE disputes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id),
  raised_by   UUID NOT NULL REFERENCES users(id),
  reason      TEXT NOT NULL,
  evidence    JSONB,                          -- list of storage keys + notes
  status      dispute_status NOT NULL DEFAULT 'open',
  resolution  TEXT,
  resolved_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE blacklist_flags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  reason     TEXT NOT NULL,
  severity   SMALLINT NOT NULL DEFAULT 1,     -- 1=warn, 2=suspend, 3=ban
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  channel    notif_channel NOT NULL,
  template   VARCHAR(80) NOT NULL,
  payload    JSONB,
  status     VARCHAR(20) NOT NULL DEFAULT 'queued',  -- queued|sent|failed|read
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at    TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    UUID REFERENCES users(id),
  action      VARCHAR(80) NOT NULL,           -- e.g. 'pii.view','doc.verify','user.ban'
  entity_type VARCHAR(60),
  entity_id   VARCHAR(60),
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Mandatory data rules**
- Every read of `worker_pii` or `verification_documents` storage keys by an admin writes an `audit_logs` row (`action='pii.view'`).
- `worker_pii` columns are encrypted at the application layer (envelope encryption with a KMS-managed key); the DB stores ciphertext only.
- API responses for clients/workers must never include NIC, DOB, full address, bank details, or document keys — only verification *badges* derived from `verification_tier` and verified `doc_type`s.

---

## 7. Verification & trust model

Tiers are cumulative and gate matchability. A worker is matchable only when `is_approved = true` AND `verification_tier >= job.required_min_tier`.

| Tier | Requirement | Badge shown to clients |
|------|-------------|------------------------|
| `t0_phone` | OTP verified | "Phone verified" |
| `t1_id` | NIC front/back + selfie face-match, admin approved | "ID verified" |
| `t2_profile` | t1 + complete profile + photo | "Profile verified" |
| `t3_skill` | Certificates/portfolio/references reviewed | "Skill evidence verified" |
| `t4_police` | Police Clearance Certificate on file (record issue date + expiry) | "Police clearance on file (dated)" |
| `t5_business` | Business registration verified | "Business registered" |
| `t6_vetted` | Manual interview/site test by staff | "Platform vetted" |

**Badge honesty rule:** badges state *what was checked and when*. Never render an unqualified "Verified". `t4_police` is a **premium lane for in-home/sensitive work**, not a general expectation — most casual workers will sit at `t1`/`t2`.

Default `required_min_tier` by category is configurable; ship with: domestic/in-home → `t4_police` recommended (min `t2`), electrical → `t3_skill`, general trades → `t1_id`, professional → `t3_skill`.

---

## 8. Matching engine

Two-phase: **hard filters** then **weighted score**. Return top 5.

### 8.1 Hard filters (SQL `WHERE`)
- `worker_profiles.is_approved = true` and `availability != 'offline'`
- worker is in `job.category_id` (via `worker_categories`)
- `verification_tier >= job.required_min_tier`
- distance(`worker.base_location`, `job.location`) ≤ `worker.service_radius_km`
- worker not blacklisted at severity ≥ 2; not the same user as client
- if `job.budget_max` set and worker `rate_type != 'quote_only'`: `worker.rate_amount` within budget (skip if quote_only)
- team jobs (`workers_needed > 1`): `worker_type IN ('team','business')` and `team_size >= workers_needed`
- scheduled jobs (`preferred_start` set): the worker's calendar must accommodate it — within `worker_working_hours`, no `worker_time_off`, no overlapping confirmed booking

### 8.2 Score (0–100, weights tunable via config)

```
score =
    25 * skill_tag_overlap_ratio        # matched job_skill_tags / job tags (1.0 if no tags)
  + 15 * distance_factor                # 1 - (dist_km / service_radius_km)
  + 15 * availability_factor            # available=1.0, busy=0.4
  + 15 * (tier_ordinal / 6)             # higher verification ranks higher
  + 10 * experience_factor              # min(years_experience/10, 1)
  + 10 * rating_factor                  # rating_avg/5 ; 0.6 neutral if rating_count=0
  +  5 * price_factor                   # 1.0 within budget, scaled penalty outside
  +  5 * response_factor                # leads_responded/leads_received ; 0.6 if <3 leads
```

**Fairness:** apply a small round-robin tie-breaker so the same top worker is not always ranked #1 — when scores are within 3 points, order by least-recently-invited. This prevents winner-take-all and protects supply diversity.

**MVP note:** rating/response/experience are sparse at launch; the neutral defaults above keep new workers competitive. Do not tune weights until there is real completion data.

`job_size` and `skill_level` drive display, price expectation, and quote prompts — they are **not** hard filters in MVP (a skilled worker may still accept a basic job).

On `POST /jobs/{id}/match`, persist the top results to `matches` (status `suggested`), then trigger lead delivery (§13) to those workers.

### 8.3 Claude API — requirement understanding (free-text → structured)

Runs when a job moves `draft → posted`. The client typically writes in Sinhala (often informal/mixed). Call the Claude Messages API (Haiku model) with: the raw description, any client-selected category, and the **full controlled taxonomy** (category + skill slugs with their localized names). Force a JSON response via a tool-use schema. Expected output:

```json
{
  "category_slug": "plumbing",
  "skill_tag_slugs": ["leak_repair","pipe_fitting"],
  "clarifying_questions": ["වතුර කාන්දුව කොතැනින්ද?","නල මාරු කළ යුතුද?"],
  "risk_flags": ["water_damage"],
  "suggested_min_tier": "t1_id",
  "workers_needed": 1,
  "materials_by": "client",
  "job_size": "small",
  "skill_level": "skilled",
  "scope_summary": "නාන කාමරයේ වතුර නලයක කාන්දුවක් අලුත්වැඩියා කිරීම.",
  "confidence": 0.86
}
```

Rules:
- **Constrain to the controlled vocabulary** — Claude must map onto existing category/skill slugs you pass in, not invent tags. Validate every returned slug against the DB; drop unknowns.
- Persist to `jobs.ai_summary` / `jobs.ai_meta`, set `ai_processed=true`, pre-fill `category_id`, `required_min_tier`, `workers_needed`, `materials_by`, `job_size`, `skill_level`, and insert `job_skill_tags` with `source='ai'`. **All AI values are suggestions the client can override.**
- `clarifying_questions` (returned in Sinhala) drive the guided requirement-capture follow-up step before matching runs.
- **No PII to the API** — send only the job text + taxonomy. Never NIC, contact, address, or documents.
- **Graceful degradation:** on timeout (>5s) or error, fall back to a keyword→slug rule mapper and let the client pick the category manually. Posting must never block on the API.
- Cache by `hash(description + category)`; rate-limit per client; log a request reference to `audit_logs`.

### 8.4 Claude API — AI-assisted re-rank & rationale

Retrieval and scoring stay deterministic (§8.1–8.2) and remain the **system of record** for fairness and audit. Claude is a presentation-layer refinement over an already-retrieved pool:

1. Deterministic engine returns a candidate pool (e.g. top 15).
2. Pass the structured requirement + each candidate's **non-PII public attributes** (skills, years, rating, distance, tier, portfolio captions) to Claude.
3. Claude (a) re-ranks the final 5 on semantic fit the keyword score can miss, and (b) writes a one-line **Sinhala** "why recommended" per worker.
4. **Guardrails:** Claude may only select from the supplied candidate ids (validate against the pool; reject hallucinated ids and fall back to deterministic order). The AI re-rank is recorded but never overrides blacklist/tier hard filters.

**Why this split, not full-LLM matching:** never ask Claude to query the worker database. LLMs can't reliably reason over thousands of rows, it is slow and costly per job, and it breaks fairness and auditability. PostGIS retrieves; the score ranks; Claude handles the fuzzy edges (messy Sinhala input + human-readable rationale). This is the scalable, cheap, defensible pattern.

---

## 9. Key flows & state machines

### 9.1 Worker onboarding
`register (OTP)` → create `worker_profiles` (status `pending`, `is_approved=false`) → upload NIC + selfie → admin reviews in console → on approve set `verification_tier='t1_id'`, `is_approved=true` → worker selects categories/skills, sets location/radius/availability → matchable.

### 9.2 Job lifecycle (`jobs.status`)
`draft` → `posted` (Claude requirement understanding §8.3 enriches category + skill tags) → `matching` (engine runs) → `shortlisted` (matches persisted, client views top 5) → `contact_revealed` (client pays unlock for ≥1 worker) → `booked` (a booking created) → `in_progress` (worker checks in) → `completed` → (terminal). Branches: `cancelled`, `expired` (no response within window).

### 9.3 Booking lifecycle (`bookings.status`)
`pending` → `confirmed` (both agree on amount and a scheduled calendar slot) → `checked_in` (worker submits at-job selfie + GPS; system flags if selfie mismatch or GPS far from job) → `in_progress` → `completed` (client confirms) → triggers review prompts + commission record. Branches: `cancelled`, `disputed`.

### 9.4 Match/response
`suggested` → `invited` (lead delivered) → `accepted` | `declined` | `expired` (no response in N minutes; default 30 for emergency/today, 24h otherwise).

### 9.5 Scheduling & availability (calendar)
- Workers set a recurring weekly pattern in `worker_working_hours` and mark days off in `worker_time_off`.
- A worker's **live free/busy** for any date range is computed: working hours − time-off − confirmed bookings (`scheduled_start..scheduled_end`). No separate slots table is stored.
- On the booking screen the client calls `GET /workers/{id}/availability?from&to` to see open windows, picks one, and the booking captures `scheduled_start`/`scheduled_end`. Job location (`jobs.location` + `address_text`) is attached and shown to the worker after contact reveal.
- On confirm, re-validate the slot is still free (no overlap) to prevent double-booking; return a conflict if taken.
- `availability_status` (available/busy/offline) stays the **instant** on/off toggle for `emergency`/`today` jobs that skip the calendar.

### 9.6 Two-sided reviews — dimensions & release
After a booking is `completed`, both sides are prompted for one overall `rating` (1–5) plus structured `criteria` (JSONB):
- **client → worker:** `work_quality`, `punctuality`, `value_for_money`, `professionalism`.
- **worker → client:** `payment_correct` (mirrored to the `payment_ok` boolean), `scope_clarity`, `conduct`, `would_work_again`.

**Double-blind release:** each review stays `is_released=false` until *both* sides submit, or a 7-day window elapses (then released one-sided). This prevents retaliatory scoring. `rating_avg`/`rating_count` update only on release. Admin can hide abusive/defamatory reviews.

---

## 10. Payment & commission model (MVP)

**Principle: the platform never holds or routes client→worker payment for the job itself in MVP.** Job payment happens directly between client and worker (cash/their own transfer). This avoids triggering payment-system/fund-holding regulation. The platform only collects **its own fees** via the PSP.

### Rate transparency & quotes (display, not enforcement)
- Worker profiles surface a **rate card** (`worker_rates`) — daily wage, call-out/visit, per-task prices — so clients see indicative pricing **before** paying to unlock contact. This is the financial-transparency layer for both sides.
- **Individuals** price via the rate card; **teams/businesses** price **by scope** through `quotes` (labour + materials + estimated days + validity) so clients compare proposals side by side.
- The platform neither sets nor takes a cut of these job prices in MVP (it is not in the money path). `bookings.agreed_amount` records what the two parties finally settle on, and is the base for the **recorded** commission below.

### MVP revenue mechanism
1. **Contact unlock fee (primary, enforceable):** to reveal a matched worker's contact, the client pays a fixed platform fee through the PSP. On `payment.status='paid'` (confirmed by PSP webhook), create `contact_reveals` and expose the worker's phone + job `address_text`. This is the revenue you can actually collect because it precedes the introduction.
2. **Commission (recorded, soft-collected):** when a `booking` reaches `completed`, record `commission_amount` against the worker. Collection in MVP is via worker pre-paid wallet balance or periodic invoice (build the ledger; do not build fund-holding). Treat commission as the strategic revenue line whose enforceability grows as you add value (guarantee, dispute payouts) post-MVP.

> **Known limitation (do not "fix" by hacking):** contact-unlock is leak-prone once a relationship forms. The architecture supports moving to PSP-mediated job payment with split settlement later — that is the durable model — but it is out of MVP scope and requires legal sign-off on fund handling.

### PSP integration
- Adapter interface: `initiatePayment()`, `verifyWebhook()`, `getStatus()`.
- Implement PayHere adapter; ship a sandbox/mock adapter for local dev.
- Idempotent webhook handler keyed on `psp_reference`; never trust client-side success — only the webhook flips `payment.status` to `paid`.
- All money in LKR; store amounts as `NUMERIC(12,2)`.

### Platform tax note (for the build)
Generate a sequential invoice record for every paid fee (client unlock, worker commission) with the platform's tax fields configurable in settings. Do not hardcode tax rates.

---

## 11. API surface (REST, JWT-protected unless noted)

```
# Auth (public)
POST   /auth/otp/request           { phone }
POST   /auth/otp/verify            { phone, code } -> tokens
POST   /auth/refresh

# Profiles
GET    /me
POST   /workers/profile            (worker) create/update
POST   /workers/documents          (worker) upload -> private bucket signed PUT
GET    /workers/{id}               public-safe view (badges only)
POST   /clients/profile
POST   /workers/rates              (worker) add/update a rate-card item
DELETE /workers/rates/{id}
POST   /workers/portfolio          (worker) upload showcase image -> public bucket
DELETE /workers/portfolio/{id}
POST   /workers/availability       (worker) set working hours / time-off
GET    /workers/{id}/availability  ?from&to -> open slots (public-safe)
GET    /workers/{id}/reviews       published reviews

# Taxonomy (public read)
GET    /categories                 (localized)
GET    /categories/{id}/skills

# Jobs
POST   /jobs                       (client) create draft
PATCH  /jobs/{id}
POST   /jobs/{id}/post             draft -> posted -> runs matching
GET    /jobs/{id}/shortlist        (client) top 5 (no contacts)
POST   /jobs/{id}/reveal           (client) { worker_id } -> PSP init
GET    /jobs/mine

# Worker leads
GET    /leads                      (worker) invited matches
POST   /matches/{id}/respond       (worker) { accept|decline }
POST   /jobs/{id}/quotes           (worker) submit scope-based quote
GET    /jobs/{id}/quotes           (client) compare quotes

# Bookings
POST   /bookings                   { job_id, worker_id, agreed_amount, scheduled_start, scheduled_end }
POST   /bookings/{id}/checkin      (worker) selfie + gps
POST   /bookings/{id}/complete     (client) confirm
POST   /bookings/{id}/cancel
GET    /bookings/mine              (client/worker) my bookings + calendar view

# Reviews & disputes
POST   /bookings/{id}/review
POST   /bookings/{id}/dispute

# Payments
POST   /payments/webhook           (public, signature-verified)
GET    /payments/mine

# Admin (role-gated)
GET    /admin/verifications        queue
POST   /admin/verifications/{docId}/decide  { verified|rejected, tier }
GET    /admin/disputes
POST   /admin/disputes/{id}/resolve
POST   /admin/users/{id}/suspend
POST   /admin/categories           CRUD
GET    /admin/analytics/overview   fill rate, response rate, revenue
```

---

## 12. Roles & permissions (matrix)

| Action | client | worker | admin | superadmin |
|--------|:--:|:--:|:--:|:--:|
| Post job, view shortlist, reveal contact | ✓ | – | – | – |
| Receive leads, respond, quote, check-in | – | ✓ | – | – |
| Manage own rate card, portfolio, availability | – | ✓ | – | – |
| View own PII | own | own | – | – |
| View any worker PII / documents | – | – | ✓ (audited) | ✓ (audited) |
| Verify documents / set tier | – | – | ✓ | ✓ |
| Resolve disputes, suspend users | – | – | ✓ | ✓ |
| Manage roles, export audit log | – | – | – | ✓ |

---

## 13. Notifications & lead delivery (the activation point)

Lead delivery is **not** dashboard-only — that is where supply dies. When matches are persisted:
1. Enqueue a BullMQ job per matched worker.
2. Send via the worker's preferred channel, **WhatsApp first, SMS fallback**, in their `preferred_language`: job category, area, urgency, and a one-tap accept/decline link (deep-link into the PWA, no login wall friction for the accept action — use a signed token).
3. Increment `leads_received`; on response increment `leads_responded`.
4. Expire unanswered invites per §9.4 and re-match if fill is insufficient.

All channels behind one `NotificationService` interface with templated, localized messages.

---

## 14. Admin console (same app, `/admin`, role-gated)

Must include: verification queue (view documents via short-lived signed URLs, approve/reject, set tier — every view audited); category/skill CRUD with si/ta/en fields; **portfolio image and review moderation (hide abusive/defamatory content)**; job monitor; dispute workbench; user suspend/blacklist; analytics overview showing **request fill rate, worker response rate, time-to-first-response, contact-unlock conversion, completed jobs, revenue, complaint rate** (these are the survival metrics).

---

## 15. Non-functional requirements

- **Mobile-first PWA**, installable, works on low-end Android, tolerant of poor connectivity (optimistic UI, retries).
- **i18n (Sinhala-first)**: default language Sinhala (`si`); every user-facing string in si/ta/en; taxonomy localized in DB; bundle a Sinhala Unicode font; verify Sinhala rendering and input on low-end Android.
- **Security/PDPA-aligned**: TLS everywhere; PII encrypted at rest (app-layer) and isolated; private bucket + signed URLs with short TTL; role-based access; full audit log on sensitive reads; granular consent captured at registration and at document upload (store consent records with timestamp + purpose + version); data-subject delete/export endpoints (soft-delete with legal-retention window); rate limiting on OTP and reveal endpoints.
- **Idempotency** on payment webhook and reveal endpoints.
- **AI calls**: only non-PII text (job description, taxonomy, public worker attributes) may be sent to the Claude API — never NIC, contact, address, or document content. Log every AI request reference in `audit_logs`; cache and rate-limit; always degrade gracefully to rule-based mapping on failure or timeout. Configure a monthly spend cap.
- **Observability**: structured logs, request IDs, health endpoint.
- **Config-driven launch cell**: enabled districts and categories are configuration, not code — ship enabled for ONE district + 3–4 categories.

---

## 16. Trust & safety (build into MVP)

- **At-job check-in** (`bookings.checkin_*`): worker submits a live selfie + GPS at arrival; system compares to verified selfie and flags mismatch or location far from `job.location` for admin review. Directly counters the "verified leader sends unverified crew" fraud.
- **Two-sided structured reviews (§9.6)**: both parties rate across criteria — incl. whether the client **paid correctly** — with **double-blind release** to prevent retaliation; abusive/defamatory reviews can be hidden by admin (Online Safety Act context). Portfolio images are likewise moderated.
- **Worker-side safety**: address revealed to worker only after the client has paid the unlock (client now has a payment trail / identity signal); booking screen exposes a share-trip and an SOS/report action.
- **Incident hooks**: a dispute or report at severity 3 auto-suspends the target pending review; preserve all related media (no hard delete during an open dispute).

---

## 17. Build sequence (milestones, in order)

1. **M1 Foundations:** repo, Postgres+PostGIS, Prisma schema (§6), enums, seed categories/skills (si/ta/en) for the launch cell, auth (OTP→JWT), i18n scaffolding.
2. **M2 Profiles & verification:** worker/client profiles, **rate card + portfolio upload**, document upload to private bucket, admin verification queue + tier/badge logic, audit logging.
3. **M3 Jobs & matching:** job posting flow, attachments, **Claude requirement-understanding service (§8.3) with rule-based fallback**, hard filters + scoring (§8.2), **Claude re-rank + Sinhala rationale (§8.4)**, shortlist API/UI.
4. **M4 Leads & response:** notification service (WhatsApp+SMS adapters + mock), lead delivery queue, accept/decline, expiry/re-match.
5. **M5 Reveal & payments:** PayHere adapter (+mock), contact-unlock flow, webhook, invoices.
6. **M6 Bookings, scheduling & reviews:** **availability calendar (working hours/time-off, slot booking with conflict check)**, booking lifecycle, at-job check-in, completion, **structured double-blind two-sided reviews**, commission ledger.
7. **M7 Disputes & admin analytics:** dispute workbench, suspend/blacklist, survival-metrics dashboard.
8. **M8 Hardening:** rate limits, consent records, data export/delete, PWA polish, low-bandwidth testing.

Each milestone is independently demoable. Do not start M5 monetisation before M3/M4 prove a job can be posted and a worker actually responds.

---

## 18. Out of scope (do NOT build in MVP)

Open bidding/job-board marketplace; in-app chat and masked calling; escrow / holding client funds / split settlement; PSP-mediated job payment; worker subscriptions and profile boosts; enterprise/multi-seat accounts; native iOS/Android apps; insurance/guarantee payouts; automated certificate verification against issuing authorities; multi-country / multi-currency. The schema accommodates these later; building them now is out of scope.

---

## 19. Decisions the founder must confirm before/with the agent

1. **Launch cell:** which single district + which 3–4 categories. (Recommendation: one Western Province district; plumber, electrician, mason/tiler, painter — or swap toward construction/team work to match QS strengths and better economics.)
2. **Unlock fee amount** (LKR) and **commission rate** per category (snapshot into `bookings.commission_rate`).
3. **PSP account** (PayHere) credentials + the registered business entity for receiving fees.
4. **SMS + WhatsApp provider** credentials, and an **Anthropic API key** (with a monthly spend cap) for the Claude requirement-understanding/re-rank service.
5. **Legal sign-off** on: intermediary/independent-contractor positioning, the privacy policy + consent text (si/ta/en), and confirmation that contact-unlock fees do not require payment-system licensing (they shouldn't, since you don't hold job funds — but confirm).

---

*This spec intentionally trades feature breadth for a shippable, revenue-capable, compliance-aware core. Build the core, get real fill-rate and willingness-to-pay data, then extend from Section 18.*
