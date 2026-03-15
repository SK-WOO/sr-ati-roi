# SR ATI ROI Calculator — User Manual

**Version:** v1.10.0 · 2026-03-15
**URL:** https://sr-ati-roi.vercel.app/
**Access:** `@seoulrobotics.org` Google Workspace accounts only

---

## Background & Purpose

Automotive factory customers ask a single question before every ATI deal closes: *"What is the payback period, and how much will we actually save?"* Until now, answering that question required an engineer to open a multi-tab Excel workbook (the Nissan Pricing Excel), manually fill in site dimensions, hardware quantities, labor rates, and discount schedules — a process that took 30–60 minutes and was error-prone under time pressure.

The SR ATI ROI Calculator rebuilds that Excel logic as a browser-based tool that any field engineer can fill in **during or before a customer meeting, in under 10 minutes**. The output is a structured ROI analysis and a print-ready PDF — either an internal report or a customer-facing quotation.

---

## What It Produces

| Output | Description |
|---|---|
| Labor baseline | Annual cost of the customer's current manned-driver fleet |
| CAPEX estimate | SR ATI hardware + NRE + installation, after overhead, margin, and discount |
| Annual OPEX | HW warranty, site support, SW update, overhaul, and operational license |
| Break-Even Point | First year cumulative SR cost falls below cumulative labor cost |
| ROI % | Net savings over the project horizon ÷ CAPEX |
| Internal Report PDF | Full project summary for internal review |
| Customer Quotation PDF | Branded quote with BOM, pricing steps, ROI highlights, T&Cs |

---

## Access & Login

1. Open **https://sr-ati-roi.vercel.app/**
2. Click **Sign in with Google** and use your `@seoulrobotics.org` account
3. On first login, approve Google Sheets access (for team preset loading)
4. Team presets saved by your colleagues load automatically

---

## Tab Workflow

The app has five tabs. Fill them from left to right.

---

### 1. 📦 Production

Enter the customer factory's production parameters.

| Field | Description |
|---|---|
| Annual CAPA | Factory's annual vehicle output target |
| Yield % | Effective production rate after quality loss |
| Shifts per day | Number of operating shifts |
| Work days per year | Operating calendar (excluding holidays) |
| Hours per shift | Regular hours + overtime |
| SR Coverage % | Percentage of manned trips replaced by ATI |

**Outputs:** UPH (units per hour), required number of SR units, drivers per shift needed

---

### 2. 🚗 Transport

Model the **8-stage manned trip cycle** to determine how many drivers the factory actually needs.

```
Pre-drive → Drive → Parking → Walk 1 → Headway Wait → Ride → Walk 2 → Overhead
```

| Field | Description |
|---|---|
| Distance (m) | One-way haul distance |
| Speed (km/h) | Average drive speed |
| Pre-drive / Parking / Walk / Overhead | Fixed time per stage (minutes) |
| Headway | Takt time between trips (minutes) |
| Ride time | Return ride time (minutes) |

**Outputs:** Cycle time, trips per shift, total driver headcount → this becomes the labor baseline input.

---

### 3. 👷 Workforce

Calculate the **annual labor cost** that SR ATI must beat.

| Field | Description |
|---|---|
| Country | Pre-loaded wage data per country |
| Wage level | Low / Mid / High within that country |
| Employment type | Full-time (annual) or Hourly |
| Regular / OT / Holiday hours | Actual schedule including premiums |
| Benefits surcharge % | Social insurance, severance, benefits overhead |
| Wage inflation % | Annual compound labor cost growth |

**Outputs:** Annual cost per driver, total annual labor baseline (feeds directly into the ROI calculation)

---

### 4. 🤖 SR Pricing

Configure the SR ATI cost structure and review the full ROI analysis.

#### CAPEX

```
CAPEX Base  = HW + NRE × Difficulty Factor + Installation + Other
After OH    = CAPEX Base × (1 + Overhead %)
After Margin= After OH × (1 + Margin %)
Final CAPEX = After Margin × (1 − Discount %)
```

| Field | Description |
|---|---|
| HW | Total hardware cost |
| NRE | Non-recurring engineering cost |
| Difficulty Factor | Site complexity multiplier for NRE (1.0 = standard) |
| Installation | Typically set to $84,000 (Dev License) via Pricing Calc |
| Overhead % | Default 15% |
| Margin % | Configurable |
| Discount % | First-plant or commercial discount |

#### OPEX (Area mode)

```
Direct OPEX = HW Warranty (% of HW)
            + Site Support ($/m²)
            + SW Update ($/m²)
            + Operational License ($)
            + Overhaul (% of HW ÷ cycle years)

Annual OPEX = Direct OPEX × (1 + Overhead%) × (1 + Margin%)
```

> **Note:** Overhaul default is **50% of HW cost per 5-year cycle** (= 10% annually), matching the Nissan Excel benchmark.

> **Operational License** is auto-populated when you click *Apply* in the Pricing Calc tab, or can be entered manually.

#### OPEX Discount Schedule

Year-1 discount starts at a configurable rate (default 30%) and decreases by a configurable step (default 3%) per year. This models the standard SR commercial ramp-down.

#### ROI Analysis Panel

The ROI panel shows cumulative results year-by-year.

| Column | Description |
|---|---|
| Labor Baseline | Compounded annual labor cost (inflation applied) |
| Remaining Labor | Manned-driver cost after partial SR coverage |
| SR OPEX | Annual operating cost (discounted schedule) |
| SR Depreciation | CAPEX ÷ useful life |
| Cumulative Savings | Running total: labor saved minus SR cost |

**KPI summary cards:** Net savings over full horizon · Total ROI % · Max annual savings

#### 📊 Sensitivity Analysis *(v1.10.0)*

Five scenarios calculated instantly without re-entering data:

| Scenario | What changes |
|---|---|
| CAPEX −20% | Lower HW/NRE cost (e.g. volume discount) |
| CAPEX −10% | Moderate discount |
| ▶ Base | Current inputs |
| Labor +10% | Customer labor grows faster than assumed |
| Labor +20% | Aggressive labor escalation |

Each row shows Break-Even Point, ROI %, and Cumulative Savings. Use this during negotiations to show the range of outcomes.

#### 💾 Scenario A/B Comparison *(v1.10.0)*

1. Set up one configuration (e.g. Site A, 40% coverage) → click **Save as A**
2. Change inputs (e.g. Site B, 60% coverage) → click **Save as B**
3. Click **Compare** → side-by-side modal of 9 key metrics

Useful for comparing two factory sites, two discount levels, or two coverage scenarios in a single meeting.

---

### 5. 🧮 Pricing Calc

Replicates the **Nissan Pricing Excel** logic. Enter site dimensions and hardware counts — CAPEX and OPEX are calculated automatically.

#### Site Configuration

Each site can be configured as:
- **Area type:** Width (m) × Height (m) = total m²
- **Path type:** Path length (m)

**Difficulty Factors (DF)** — 7 modifiers per site:

| Factor | What it captures |
|---|---|
| Outdoor | Exposure to weather, lighting variation |
| Elevation | Ramp or multi-level layout |
| Road Width | Narrow or irregular paths |
| Surface | Uneven, reflective, or wet surfaces |
| Complexity | Number of intersections, traffic density |
| Paved | Surface quality |
| Capacity | High-throughput lanes |

The combined DF multiplies the NRE cost for that site.

#### NRE Labor Configuration *(v1.10.0)*

NRE is now calculated from actual engineering headcount and duration — not a fixed per-m² rate.

```
Base Labor NRE = Σ (HC × MM × monthly rate)   for each role
Per-site NRE   = Base Labor NRE × (site m² / total m²) × site DF
```

The default configuration matches the Nissan Excel salary benchmarks:

| Role | Monthly Rate | Default HC | Default MM |
|---|---|---|---|
| Jr. Engineer | $7,351 / mo | 5 | 8 |
| Mid Engineer | $9,905 / mo | 3 | 8 |
| Sr. Engineer | $11,607 / mo | 2 | 8 |

**You can add any role** (e.g. Project Manager, Integration Specialist) using the **+ Add Row** button. Edit the label, monthly rate, headcount, and duration freely. Click **Reset Defaults** to restore the standard configuration.

#### Hardware Configuration

Default lineup: Lidar XT32, OT128, QT128, ZT128, Server, Accessories — all prices editable. Add custom items or save named HW presets for reuse across customers.

#### SW License (OPEX)

```
SW License = Adjusted Area × Unit Price × Vehicle Weight Multiplier
```
The vehicle weight multiplier scales with annual throughput (matches Nissan Excel vehicle volume tiers).

#### Apply to SR Pricing

Click **Apply to SR Pricing Tab** to transfer all calculated values:

| SR Pricing field | Source |
|---|---|
| CAPEX HW | HW total from BOM |
| CAPEX NRE | Total NRE (distributed across sites) |
| CAPEX Installation | $84,000 (Dev License, fixed) |
| OPEX Area | Total site area (m²) |
| Operational License | SW License (auto-calculated) |

The app switches to the SR Pricing tab automatically.

---

## PDF Reports

Click the **📄 Report** button in the top-right header.

### Internal Report

For internal review and management sign-off.

**File name:** `SR-ROI-Report_[Client]_[Author]_[YYYYMMDD].pdf`

**Contents:**
- Project information (client, author, department, date)
- Production & Transport KPIs
- Workforce baseline
- CAPEX breakdown (4-step)
- OPEX & ROI summary
- Full year-by-year ROI table

### Customer Quotation

For direct delivery to the customer.

**Quote No.:** Auto-generated `QT-YYYYMMDD-HHMM`
**File name:** `SR-Quotation_[Client]_[SalesRep]_[YYYYMMDD].pdf`

**Contents:**
- Cover page with Quote No., validity period, SR branding
- Hardware BOM
- Step-by-step CAPEX pricing
- OPEX breakdown
- ROI highlights
- Terms & Conditions

### 💾 Save to Google Drive

After generating a PDF, click **💾 Save to Drive** to upload it directly to the shared **SR ATI ROI Reports** folder.

> **v1.10.0:** If the Drive token has expired, the app silently re-authenticates and retries — no manual logout required.

---

## Team Presets (Google Sheets)

Team presets allow any engineer to save a full set of inputs under a customer/factory name and share it with the team instantly.

- Presets load automatically from Google Sheets on login
- Click **🏭 Presets** in the header to browse, load, or delete presets
- Click **💾 Update** to overwrite the currently loaded preset with current values
- Use **🔄 Refresh** to pull the latest presets from Sheets without logging out
- Offline fallback: presets stored in localStorage are used if Sheets is unavailable

**v1.10.0:** NRE labor configuration and Operational License are now included when saving presets, so your full Pricing Calc setup is shared with the team.

---

## Additional Features

| Feature | Description |
|---|---|
| **EN / KR toggle** | `🌐 KO/EN` button in header — all labels switch instantly |
| **Changelog modal** | Click the version badge (e.g. `v1.10.0`) to see release notes |
| **Domain security** | Only `@seoulrobotics.org` Google accounts can log in |
| **Local persistence** | Pricing Calc state (sites, HW, labor config) is auto-saved to localStorage and restored on next open |

---

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| *"Sheets load failed (HTTP 403)"* | Sheets API not enabled or spreadsheet permissions | Check Google Cloud Console — Sheets API must be enabled for project 318386102464 |
| *"Sheets load failed (HTTP 401)"* | Token expired on load | Log out and log back in |
| Drive upload fails | Drive API not enabled or folder permissions | Confirm Drive API is enabled; Workspace admin must approve `drive` scope |
| Login button not showing | GSI script blocked | Check browser extensions / ad blockers |

---

## Version History

| Version | Date | Highlights |
|---|---|---|
| **v1.10.0** | 2026-03-15 | Sensitivity Analysis, Scenario A/B compare, Operational License in OPEX, NRE labor dynamic config, Drive 401 auto-retry, labor config in team presets |
| v1.9.2 | 2026-03-14 | Internal Report & Quotation PDF, Google Drive save, HW presets, Department field |
| v1.9.1 | 2026-03-14 | Mobile responsive layout, Pricing Calc state cache |
| v1.8.x | 2026-03-13 | Analytics charts (Doughnut/Radar/Area), full i18n |
| v1.7.0 | 2026-03-13 | Pricing Calc tab (5th tab) |
| v1.6.0 | 2026-03-12 | Google Sheets team preset sharing |
| v1.5.0 | 2026-03-12 | EN/KR language toggle |
| v1.0.0 | 2026-03-12 | Initial release |
