# SR ATI ROI Calculator — Tool Guide
**Version:** v1.10.0 · 2026-03-15
**URL:** https://sr-ati-roi.vercel.app/
**Access:** `@seoulrobotics.org` Google Workspace accounts only

---

## Purpose

The SR ATI ROI Calculator is an internal sales engineering tool designed to help Seoul Robotics field engineers **quickly and credibly present the ROI of our ATI (Autonomous Transport Infrastructure) solution** to automotive factory customers.

In under 10 minutes before or during a customer meeting, it produces:
- Estimated **baseline manned-driver labor cost** for the customer's factory
- **CAPEX / OPEX** calculation for SR ATI deployment
- **Break-Even Point (BEP)** and **ROI %** over a configurable project horizon
- **Internal report / customer quotation** PDF ready for immediate use
- Auto-save to Google Drive + team preset sharing via Google Sheets

---

## Tab Overview

The app is organized into 5 tabs, designed to be filled in sequentially from left to right.

---

### 1. 📦 Production
Enter the customer factory's **production parameters**.

| Input | Description |
|---|---|
| Annual Production (CAPA) | Factory's annual output target |
| Yield % | Effective production after defects |
| Shifts / Work Days / Hours per Shift | Shift structure |
| SR Coverage % | % of manned trips replaced by ATI |

**Output:** UPH (units/hr), required SR units, drivers per shift

---

### 2. 🚗 Transport
Analyze the **8-stage manned-trip cycle time** to calculate how many drivers are needed.

```
Pre-drive → Drive → Parking → Walk 1 → Headway Wait
→ Ride → Walk 2 → Overhead
```

**Output:** Total cycle time, trips per shift, total driver headcount (used as the labor baseline)

---

### 3. 👷 Workforce
Calculate the **annual labor cost baseline** for manned drivers — the primary value SR must beat.

| Setting | Description |
|---|---|
| Country / Wage level | Base hourly or annual salary |
| Employment type | Full-time / Contractor / Hourly |
| Overtime & Holiday premiums | Legal pay multipliers |
| Benefits surcharge % | Social insurance, benefits overhead |
| Wage inflation % YoY | Compound labor cost growth over project life |

**Output:** Annual cost per driver, total baseline labor cost (input to ROI calculation)

---

### 4. 🤖 SR Pricing
Configure SR ATI **CAPEX / OPEX** and review the full **ROI analysis**.

#### CAPEX (4-step calculation)
```
capexBase = HW + NRE × Difficulty Factor + Installation + Other
  → × (1 + Overhead %)
  → × (1 + Margin %)
  → × (1 − Discount %)
= Final CAPEX
```

#### OPEX (Area mode)
```
HW Warranty (%)
+ Site Support ($/m²)
+ SW Update ($/m²)
+ Operational License ($)          ← Added in v1.10.0
+ Overhaul (% of HW / cycle years)
= Direct OPEX × (1 + Overhead%) × (1 + Margin%)
= Annual SR Total Cost
```

> **v1.10.0:** `Operational License` field added to OPEX — auto-populated from Pricing Calc tab or manually editable.

#### ROI Analysis Panel
- **Year-by-Year ROI table** — Labor baseline vs. SR total cost vs. cumulative savings for each year
- **Cumulative cost / savings charts** (Bar, Area)
- **ROI Radar chart** — 6-axis visual score

#### 📊 Sensitivity Analysis *(v1.10.0)*
Instantly shows how ROI changes under 5 scenarios without re-entering data:

| Scenario | What changes |
|---|---|
| CAPEX −20% | CAPEX reduced by 20% |
| CAPEX −10% | CAPEX reduced by 10% |
| ▶ Base | Current inputs |
| Labor +10% | Customer labor cost 10% higher |
| Labor +20% | Customer labor cost 20% higher |

Each row shows: Break-Even Point / ROI % / Cumulative Savings

#### 💾 Scenario A/B Comparison *(v1.10.0)*
- Click **Save as A** or **Save as B** to snapshot the current result set
- Click **Compare** to open a side-by-side modal comparing 9 key metrics
- Use case: compare two factory sites, two discount levels, or two coverage scenarios

---

### 5. 🧮 Pricing Calc
Replicates the **Nissan Pricing Excel logic** inside the app. No manual dollar entry — input site dimensions and hardware quantities, and CAPEX/OPEX are calculated automatically.

#### Site Input
- Site name, type (Area m² or Path Length m)
- 7 difficulty factors (DF): Outdoor / Elevation / Road width / Surface / Complexity / Paved / Capacity

#### NRE Labor Configuration *(v1.10.0)*
NRE is now calculated from actual engineer headcount and duration, using Nissan Excel salary benchmarks:

| Level | Monthly Rate | Default HC | Default MM |
|---|---|---|---|
| Jr. Engineer | $7,351/mo | 5 | 8 |
| Mid Engineer | $9,905/mo | 3 | 8 |
| Sr. Engineer | $11,607/mo | 2 | 8 |

```
Base Labor NRE = Σ (HC × MM × monthly rate)
Per-site NRE  = Base Labor NRE × (site area / total area) × Difficulty Factor
```

A **Reset Defaults** button restores the standard headcount configuration.

#### Hardware Configuration
- Default HW lineup: XT32, OT128, QT128, ZT128, Server, Accessories
- Add / remove custom HW items
- Save and load HW presets (named, timestamped)

#### OPEX Calculation
- SW License = adjusted area × unit price × vehicle weight multiplier (based on annual throughput)
- Includes: HW Warranty / Site Support / SW Update / Overhaul

#### ✅ Apply to SR Pricing Tab
Clicking **Apply to SR Pricing Tab** transfers all calculated values directly:

| SR Pricing field | Source |
|---|---|
| CAPEX HW | hwTotal |
| CAPEX NRE | totalNRE |
| CAPEX Installation | DEV_LICENSE ($84,000) |
| OPEX Area | totalArea |
| Operational License | swLicense ← *v1.10.0* |

Then automatically switches to the SR Pricing tab.

---

## 📄 Report & Quotation (PDF)

Accessed via the **📄 Report** button in the top-right header.

### Internal Report
**File name:** `SR-ROI-Report_[Client]_[Author]_[Date].pdf`
**Contents:** Project info, Production & Workforce KPIs, CAPEX breakdown, OPEX & ROI summary, N-year ROI table

### Customer Quotation
**Quote No.** auto-generated: `QT-YYYYMMDD-HHMM`
**File name:** `SR-Quotation_[Client]_[SalesRep]_[Date].pdf`

### 💾 Save to Google Drive
- Saves directly to the **SR ATI ROI Reports** shared folder
- **v1.10.0:** If the token has expired (401), the app silently re-authenticates and retries — no manual logout/re-login required

---

## ☁️ Team Presets (Google Sheets)

- Automatically loaded from the shared Google Sheet on login
- **v1.10.0:** NRE labor configuration and Operational License now included in preset saves
- Fallback: localStorage when offline

---

## 🌐 Additional Features

| Feature | Description |
|---|---|
| **EN / KR language toggle** | `🌐 KO/EN` button in header |
| **Changelog modal** | Click the version badge |
| **Domain security** | `@seoulrobotics.org` accounts only |
| **Local state persistence** | Pricing Calc state auto-saved to localStorage |

---

## 📦 Version History

| Version | Date | Highlights |
|---|---|---|
| **v1.10.0** | 2026-03-15 | Sensitivity Analysis, Scenario A/B compare, Operational License, NRE labor config UI, Drive 401 auto-retry, laborInputs in team presets |
| v1.9.2 | 2026-03-14 | Internal Report & Quotation PDF, Google Drive save, HW presets |
| v1.9.1 | 2026-03-14 | Mobile responsive, Pricing Calc state cache |
| v1.8.x | 2026-03-13 | KPI visibility fixes, i18n completion, Analytics charts |
| v1.7.0 | 2026-03-13 | Pricing Calc tab (5th tab) |
| v1.6.0 | 2026-03-12 | Google Sheets team preset sharing |
| v1.5.0 | 2026-03-12 | EN/KR language toggle |
| v1.0.0 | 2026-03-12 | Initial release |
