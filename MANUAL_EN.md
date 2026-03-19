# SR ATI ROI Calculator — User Manual

**Version:** v1.12.2 · 2026-03-19
**URL:** https://sr-ati-roi.vercel.app/
**Access:** `@seoulrobotics.org` Google Workspace accounts only

---

## What Is This Tool?

Imagine you are visiting a car factory and the customer asks:
> *"If we buy your robots, how much money will we save, and when does it pay off?"*

Before this tool existed, an engineer had to open a big Excel file, type in dozens of numbers, and come back 30–60 minutes later with an answer. That was slow, and mistakes happened easily.

This tool lets you answer that question **in under 10 minutes, right in the meeting**, and hand the customer a printed PDF at the end.

---

## Before You Start — Login

1. Go to **https://sr-ati-roi.vercel.app/**
2. Click **Sign in with Google**
3. Pick your `@seoulrobotics.org` account
4. When asked, click **Allow** to let the tool read/write Google Sheets (this is for team preset sharing)
5. You are in. The tool loads your team's saved factory settings automatically.

> Only `@seoulrobotics.org` accounts can log in. Anyone else is blocked.

---

## The Big Picture — How to Use It

The app has **two areas**:

- **Left panel** — five tabs where you type in the customer's numbers
- **Right panel** — live results that update every time you change something

**Fill the tabs from left to right, in order.** Each tab feeds numbers into the next.

```
📦 Production → 🚗 Transport → 👷 Workforce → 🤖 SR Pricing → 🧮 Pricing Calc
```

---

## Header Bar (Top of the Page)

The blue bar at the top has buttons for the most important actions.

---

### `v1.12.2 · 2026-03-18` (Version Badge)

**What it does:** Opens the **Changelog** — a list of everything that was added or fixed in each version.

**When to use:** When you want to know what's new or show a colleague what changed.

---

### `?` (Help Button)

**What it does:** Opens the **Help Guide** — a short description of each tab and what the latest version added.

**When to use:** When you forget what a tab is for, or when you want a quick refresh.

---

### 📖 (Manual Button)

**What it does:** Opens this full manual in Confluence (external link, opens in a new tab).

**When to use:** When you need the detailed written guide.

---

### 🏠 (Home Button)

**What it does:** Takes you back to the **SR Gate** main portal.

**When to use:** When you're done and want to go back to the SR tools homepage.

---

### `EN` / `한국어` (Language Toggle)

**What it does:** Switches every label, button, and text in the app between English and Korean **instantly**. Nothing you typed is lost — only the display language changes.

**When to use:** Choose whichever language is more comfortable for you or your meeting audience.

---

### 🏭 Presets (+ number badge)

**What it does:** Opens the **Preset Panel** — a library of saved factory configurations.

The number badge shows how many presets are saved in the team's Google Sheet right now.

**When to use:** At the start of a meeting, load a saved configuration for that customer's factory so you don't have to retype everything.

> See the **Preset Panel** section below for details on all the buttons inside.

---

### 📄 Report (Purple Button)

**What it does:** Opens the **Report & Quotation** window where you can generate and download PDFs.

Two types of PDF are available:
- **Internal Report** — for your own team and management review
- **Customer Quotation** — the official branded document you hand to the customer

**When to use:** At the end of the meeting, or before the meeting to prepare materials.

> See the **Report & Quotation** section below for all the buttons inside.

---

### 💾 Save Preset (Green Button)

**What it does:** Opens a form to **save the current state of all inputs** as a named preset in Google Sheets. Your team members will see it immediately.

**Fields to fill in:**
| Field | What to type |
|---|---|
| Brand / OEM | e.g. Toyota, Hyundai, BMW |
| Country | Where the factory is |
| Plant | Factory name or code |
| Department | Your team or department |
| Notes | Anything worth remembering |

**When to use:** After you've set up all the numbers for a customer, save it so you (or a colleague) can load it again next time.

---

### Auto-Saved Badge (Green text, appears briefly)

**What it looks like:** `✔ Auto-saved` appears in the header for about 2 seconds.

**What it means:** The tool automatically saves the **Pricing Calc** tab's site, hardware, and labor settings to your browser's local storage every time you change something. This protects your work if the browser closes.

> If you see a red warning instead, your browser storage is full. Free up space or clear old site data.

---

### Loaded Preset Badge (appears when a preset is active)

**What it looks like:** `Loaded: Toyota · Japan · Motomachi  [Update] [✕]`

**What it means:** You currently have a saved preset loaded. Everything you see on screen came from that preset.

- **`Update` button** — Overwrites the saved preset in Google Sheets with your current inputs. Use this when you've adjusted numbers and want to save the new version.
- **`✕` button** — Clears the "loaded" indicator. Your inputs stay on screen, but the app no longer tracks which preset they belong to. The preset in Sheets is NOT deleted.

---

### User Profile + Logout

**What it shows:** Your Google profile photo and name.

**Logout button** — Signs you out. You'll need to log back in to use the tool. Your local data is not erased.

---

## Left Panel — Five Tabs

---

### 📦 Tab 1: Production

**Purpose:** Tell the tool how the factory operates — how many cars they make, how many hours they work, and what percentage of transport SR will handle.

---

#### Country Selector (Dropdown at the top)

**What it does:** Selects the country the factory is in. This pre-loads default values for public holidays and the reference annual wage.

**The three info boxes that appear:**
- **Public Holidays** — The standard number of public holidays for that country. This reduces the effective working days.
- **Average Annual Wage ($)** — The pre-loaded reference wage. You can type over this number if the customer's actual wage is different.
- **Wage Inflation (%)** — How much labor costs are expected to grow per year. This is used in the ROI projection to make future savings more realistic.

---

#### Regular Work Days

**What it is:** How many days per year the factory operates, before subtracting holidays.

**Typical value:** 250–260 days

**Why it matters:** More working days = more labor cost = a stronger case for SR.

---

#### Public Holidays (with hint text below)

**What it is:** The number of public holidays per year when the factory is closed.

**Hint:** *These are subtracted from regular work days to get the real operating calendar.*

**Tip:** The value fills in automatically when you pick a country, but you can override it.

---

#### Regular Hours / Shift

**What it is:** How many regular (non-overtime) hours are in one shift.

**Typical value:** 8 hours

---

#### Overtime Hours / Shift

**What it is:** How many extra hours per shift, on top of regular hours.

**Typical value:** 0–2 hours. Leave at 0 if there's no overtime.

---

#### Shifts / Day

**What it is:** How many separate shifts run each day.

**Options:** 1, 2, or 3 shifts.

**Why it matters:** More shifts = more total hours = more drivers needed. SR must cover all of them.

---

#### Annual CAPA (units)

**What it is:** The factory's annual vehicle production target — how many cars they plan to build per year.

**Typical value:** 100,000 to 500,000 units

**Why it matters:** This is the core number everything is built from. UPH (units per hour), driver counts, and transport cycles all derive from this.

---

#### Yield Rate % *(with hint text below)*

**What it is:** The percentage of scheduled production time that is actually used for production (excluding line stoppages, breakdowns, etc.).

**Hint:** *Actual uptime ÷ total scheduled time (excl. line stoppages)*

**Typical value:** 85–98%

**Why it matters:** A 95% yield means 5% of time is lost to stoppages. The tool back-calculates a higher UPH to compensate, which means more transport cycles — and more drivers needed.

---

#### SR Coverage Ratio % *(with hint text below)*

**What it is:** What percentage of the manned transport trips will SR replace.

**Hint:** *% of CAPA handled by SR*

**Example:** 100% = SR replaces every driver. 50% = SR handles half the trips; the other half remain manned.

**Why it matters:** At 50% coverage, only half the labor cost is saved. At 100%, the maximum savings apply. Use this to model partial rollouts or phased deployments.

---

#### Blue Result Box (bottom of Production tab)

These six numbers are calculated live from your inputs. You don't type here — just read.

| Display | What it means |
|---|---|
| **Effective Work Days** | Regular days minus holidays — the real number of production days |
| **Back-calc UPH** | Units per Hour needed to hit CAPA, adjusted for yield and hours |
| **Daily Moves (Total)** | How many transport trips the factory needs per day |
| **Daily Moves (SR)** | How many of those trips SR will handle |
| **SR CAPA** | How much of the annual production SR covers |
| **Total Annual Hours** | Total productive hours across all shifts in a year |

---

### 🚗 Tab 2: Transport

**Purpose:** Model how long one manned transport trip takes, from start to finish. This determines how many drivers the factory needs.

Think of it as timing one driver's complete round trip:

```
[Pre-drive prep] → [Drive to destination] → [Park] → [Walk to line] →
[Wait for next takt] → [Ride back] → [Walk to vehicle] → [Other overhead]
```

---

#### Distance (m)

**What it is:** The one-way distance of the transport route in meters.

**Example:** 150m means the driver drives 150 meters to deliver a part, then returns.

---

#### Speed (km/h)

**What it is:** The average driving speed of the internal transport vehicle.

**Typical value:** 10–30 km/h inside a factory.

---

#### Pre-drive Time (min)

**What it is:** Time spent getting ready before driving starts — checking the vehicle, paperwork, etc.

---

#### Parking Time (min)

**What it is:** Time to park and unpark the vehicle at the destination.

---

#### Walk 1 Time (min)

**What it is:** Time to walk from the parked vehicle to the delivery point.

---

#### Headway / Takt Time (min)

**What it is:** How often a trip must happen — the time between consecutive deliveries. This is set by the production line's rhythm.

**Why it matters:** If takt time is 8 minutes and one trip takes 5 minutes, the driver waits 3 minutes. If the trip takes longer than the takt time, you need more drivers.

---

#### Ride Time (min)

**What it is:** Time to ride back to the starting point (e.g., on a bus, bike, or walking).

---

#### Walk 2 Time (min)

**What it is:** Time to walk from the drop-off/ride point back to the vehicle.

---

#### Overhead Time (min)

**What it is:** Any other fixed time per trip not captured above — safety checks, signing, waiting at gates, etc.

---

#### Blue Result Box (bottom of Transport tab)

| Display | What it means |
|---|---|
| **Cycle Time** | Total time for one complete round trip |
| **Trips / Shift** | How many trips one driver can do in one shift |
| **SR Drivers (Total)** | Total drivers SR replaces across all shifts |
| **Manned Drivers** | Drivers that remain after SR takes over its portion |

---

### 👷 Tab 3: Workforce

**Purpose:** Calculate how much the factory currently spends on manned drivers. This is the money SR is competing against.

---

#### Employment Type

Three options:

- **Full-time (annual salary)** — uses the annual wage you entered in the country box
- **Contractor** — same as full-time but with a different surcharge percentage
- **Hourly** — you enter an hourly rate instead

---

#### Hourly Rate / Annual Wage

Depending on the employment type, enter either:
- The **hourly wage** ($/hr) — for hourly workers
- The **annual base salary** ($) — for full-time or contractor employees

---

#### Overtime / Holiday Premium (%)

**What it is:** The extra percentage paid for overtime or holiday work.

**Example:** 50% means overtime hours cost 1.5× the regular rate.

---

#### Benefits / Surcharge (%)

**What it is:** Social insurance, pension contributions, severance pay, and other overhead on top of base salary.

**Typical range:** 20–35% depending on country.

**Why it matters:** A driver paid $30,000/year might actually cost $38,000 when you add benefits. This is the real cost SR must beat.

---

#### Right Panel — Workforce Results

The right panel shows the calculated labor cost automatically.

| Display | What it means |
|---|---|
| **Cost per Person** | Total annual cost for one driver, including all premiums |
| **Effective Hourly Rate** | What one hour of a driver's time actually costs the factory |
| **Annual Labor Baseline** | Total annual cost across all manned drivers (this feeds directly into the ROI calculation) |
| **Annual Remaining Labor** | The cost of drivers that stay manned after SR takes over its portion |

---

### 🤖 Tab 4: SR Pricing

**Purpose:** Set SR's price and see the full return-on-investment analysis.

This tab has two parts: **inputs on the left** (CAPEX, OPEX, projection settings) and **live results on the right** (ROI charts, sensitivity matrix, scenario comparison).

---

#### CAPEX Section

CAPEX = the one-time cost to buy and deploy SR ATI.

The tool calculates it in four steps:

```
Step 1: Base = HW + (NRE × Difficulty Factor) + Installation + Other
Step 2: After Overhead = Base × (1 + Overhead %)
Step 3: After Margin = After Overhead × (1 + Margin %)
Step 4: Final CAPEX = After Margin × (1 − Discount %)
```

---

##### Hardware Cost (HW) `$`

**What it is:** Total hardware purchase cost — sensors, servers, accessories.

**Tip:** This is auto-filled when you click **Apply** in the Pricing Calc tab. Or type it directly.

---

##### NRE `$`

**What it is:** Non-Recurring Engineering — the engineering cost to design, configure, and map the system for this specific factory. It's a one-time cost.

**Tip:** Also auto-filled from Pricing Calc.

---

##### Difficulty Factor

**What it is:** A multiplier applied to NRE. Harder sites cost more engineering time.

- **1.0** = standard site, no special challenges
- **1.2** = moderately complex (default)
- **1.5** = very challenging (outdoor, multi-level, narrow paths)

**Tip:** Set automatically from the Pricing Calc tab's site difficulty settings.

---

##### Installation `$`

**What it is:** The cost to physically install and commission the SR system on-site.

**Default:** $84,000 (Developer License — auto-filled from Pricing Calc).

---

##### Other CAPEX `$`

**What it is:** Any additional one-time cost not captured above (e.g., civil works, network infrastructure).

---

##### Overhead %

**What it is:** Company overhead added on top of direct costs — internal support, admin, insurance.

**Default:** 15%

---

##### Margin %

**What it is:** SR's profit margin added to the customer price.

---

##### First Plant Discount %

**What it is:** A commercial discount, typically applied to the first plant in a new customer relationship to win the deal.

**Default:** 40%

---

#### OPEX Section

OPEX = the annual recurring cost to operate and maintain the SR system after it's installed.

Two modes are available:

- **Per-Move mode** — OPEX is calculated as a cost per transport move
- **Area mode** — OPEX is calculated based on site area (m²) — *this is the default and matches the Nissan Excel*

In **Area mode**, the components are:

| Component | What it is |
|---|---|
| **HW Warranty Rate %** | Annual warranty cost as a % of HW purchase price |
| **Site Support ($/m²)** | On-site technician visits, calibration, maintenance per m² |
| **SW Update ($/m²)** | Annual software update and upgrade cost per m² |
| **Operational License ($)** | Annual software license fee (auto-filled from Pricing Calc) |
| **Overhaul Rate %** | Cost of full hardware overhaul as a % of HW price, per cycle |
| **Overhaul Cycle (years)** | How often the overhaul happens (default 5 years = 10% per year) |

The final OPEX adds Overhead % and Margin % on top of these direct costs.

---

#### OPEX Discount Schedule

SR offers an OPEX discount in early years to help the customer's ROI look better in the critical first 1–3 years.

- **Year 1 Discount %** — How much is discounted in the first year (default 30%)
- **Step % per year** — How fast the discount shrinks each year (default 3% per year, so Year 2 = 27%, Year 3 = 24%, etc.)

---

#### Projection Settings

| Setting | What it is |
|---|---|
| **Useful Life (years)** | How long the SR hardware is expected to last. CAPEX is divided by this for annual depreciation. |
| **Project Horizon (years)** | How many years the ROI analysis covers. |
| **SR Cost Growth %/yr** | How much SR's annual OPEX is expected to grow per year. |

---

### Right Panel — ROI Results

This panel updates live every time you change an input anywhere in the app.

---

#### KPI Cards (three boxes at the top)

| Card | What it means |
|---|---|
| **N-yr Net Savings** | Total money saved over the full project horizon, after subtracting all SR costs |
| **Total ROI %** | Net savings ÷ CAPEX. 100% means you got your investment back and doubled it. |
| **Max Annual Savings** | The largest yearly saving possible (labor baseline minus SR OPEX in one year) |

---

#### Year-by-Year ROI Table

A table showing what happens each year of the project.

| Column | What it means |
|---|---|
| **Year** | Year 1, Year 2, etc. |
| **Labor Baseline** | What the factory would have spent on drivers that year (with wage inflation applied) |
| **Remaining Labor** | The manned driver cost that stays after SR takes its share |
| **SR OPEX** | SR's operating cost that year (with discount schedule applied) |
| **SR Depr.** | SR hardware depreciation for that year (CAPEX ÷ useful life) |
| **SR Total** | Remaining Labor + SR OPEX + SR Depreciation = total annual SR cost |
| **Cum. Savings** | Running total of (Labor Baseline − SR Total) over all years so far |
| **ROI** | Cumulative savings ÷ CAPEX so far |

Green rows = years where cumulative savings are positive (SR is paying off).

**↓ CSV** button — Downloads this table as a spreadsheet file you can open in Excel.

---

#### 📊 Sensitivity Analysis Matrix

**What it is:** A 5×5 grid that shows ROI% for 25 different scenarios simultaneously — without you having to retype anything.

**The two axes:**
- **Rows (left side) = CAPEX variation** — what if the hardware costs more or less?
- **Columns (top) = Labor variation** — what if the customer's wages are higher or lower?

**Each cell = the ROI% for that combination.**

**Color coding:**
- 🟢 Dark green = ROI ≥ 50% (strong outcome)
- 🟢 Light green = ROI 0–50% (positive, breaking even)
- 🔴 Red = ROI < 0% (not profitable under this scenario)
- 🔵 Blue = Base case (your current inputs)

**Hover over any cell** to see the Break-Even Point and Net Savings for that scenario.

**How to edit the axis values:**
- Click directly on any number in the column headers (top row) or row headers (left column)
- Type any number — positive or negative, any value
- The matrix recalculates instantly
- Default values are −20%, −10%, 0%, +10%, +20%
- **Example:** Change the CAPEX row from −20% to −50% to model an aggressive discount scenario

---

#### 💾 Save as A / Save as B / 📊 Compare

**What these do:** Let you compare two completely different configurations side by side.

**How to use:**
1. Set up your first configuration (e.g., Factory A, 40% SR coverage)
2. Click **💾 Save as A** — a green ✓ appears to confirm it's saved
3. Change your inputs (e.g., Factory B, 80% SR coverage, higher CAPEX)
4. Click **💾 Save as B**
5. Click **📊 Compare** to open a side-by-side modal with 9 key metrics

**When to use:** During a meeting when the customer asks "what if we only roll out 50% first?" — save it as A, change to 100%, save as B, and show them the difference.

---

#### Analytics Charts (below the table)

Five charts that visualize the ROI data automatically. No inputs needed — they update with everything else.

| Chart | What it shows |
|---|---|
| **CAPEX Breakdown (pie)** | How the CAPEX is split: HW, NRE, Installation, Other, Overhead, Margin |
| **Annual Cost Mix (pie)** | Year 1 cost breakdown: Remaining Labor, SR OPEX, SR Depreciation, Labor Saved |
| **Cumulative Savings (area chart)** | How savings grow year by year — the curve crosses zero at the Break-Even Point |
| **ROI Radar** | Six KPIs plotted on a radar chart: ROI%, BEP Speed, Labor Saved%, OPEX Efficiency, Year 1 Savings%, SR Coverage% |
| **Annual Net Savings (bar)** | Year-by-year net saving amount as bars |

---

### 🧮 Tab 5: Pricing Calc

**Purpose:** This tab replicates the original Nissan Pricing Excel. You enter site dimensions and hardware quantities, and the tool calculates all CAPEX and OPEX numbers automatically.

**At the end, click Apply → everything transfers to the SR Pricing tab.**

---

#### Site Configuration

A "site" is one area of the factory where SR will operate. You can add multiple sites (e.g., paint shop, assembly line, parking lot).

**+ Add Site button** — Adds a new site card to the list.

**Site name** — Type whatever name makes sense (e.g., "Assembly Line 3").

**Site type — two options:**

| Type | When to use | Inputs needed |
|---|---|---|
| **Area** | Open floor area (most common) | Width (m) × Height (m) |
| **Path** | A defined route (corridor, narrow lane) | Path length (m) |

The site area in m² feeds directly into OPEX calculations.

---

#### Difficulty Factors (DF) — 7 sliders per site

Each slider adds to the site's complexity score. The total DF multiplies the NRE cost for that site — harder site = more engineering work = higher NRE.

| Factor | What it means |
|---|---|
| **Outdoor** | The route goes outside or has variable lighting/weather |
| **Elevation** | The route goes up or down ramps or between floors |
| **Road Width** | The paths are narrow or irregularly shaped |
| **Surface** | The floor is uneven, reflective, wet, or has special markings |
| **Complexity** | Many intersections, lots of traffic, complicated traffic patterns |
| **Paved** | The surface quality is poor or mixed |
| **Capacity** | Very high throughput — many vehicles moving at once |

**Delete Site button (🗑)** — Removes that site. Be careful — there's no undo.

---

#### NRE Labor Configuration

NRE (engineering cost) is calculated from actual headcount and project duration.

```
Base NRE = Sum of (Headcount × Months × Monthly Rate)  for each role
Per-Site NRE = Base NRE × (this site's area ÷ total area) × this site's DF
```

**The table rows:**

| Column | What to enter |
|---|---|
| **Role label** | Job title (e.g., Jr. Engineer, Project Manager) |
| **Monthly Rate ($)** | What that role costs per person per month |
| **HC** | Headcount — how many people of that role |
| **MM** | Man-months — how many months they work on the project |

**➕ Add Row button** — Adds a new role to the table.

**🔄 Reset Defaults button** — Restores the standard Nissan Excel benchmark values:

| Role | Monthly Rate | HC | MM |
|---|---|---|---|
| Jr. Engineer | $7,351 | 5 | 8 |
| Mid Engineer | $9,905 | 3 | 8 |
| Sr. Engineer | $11,607 | 2 | 8 |

**🗑 (row delete)** — Removes that role row from the table.

---

#### Hardware Configuration

A Bill of Materials (BOM) for the SR hardware being deployed.

**Default items:** Lidar XT32, OT128, QT128, ZT128, Server, Accessories

For each item:
- **Unit Price ($)** — Edit the price directly
- **Count** — How many units are needed
- **Total** = Price × Count (calculated automatically)

**➕ Add Item button** — Adds a custom hardware item (e.g., a new sensor model, custom mount).

**🗑 (row delete)** — Removes that hardware item.

**HW Preset buttons:**
- **💾 Save HW Config** — Saves the current hardware list under a name, stored in your browser
- **📂 Load HW Config** — Opens a saved hardware list — useful when you always use the same equipment

---

#### Annual Throughput (units/year)

**What it is:** How many vehicles pass through the SR-covered area per year.

**Why it matters:** The SW License fee scales with vehicle volume — more vehicles through the system = higher license cost.

---

#### SW License (OPEX component)

Calculated automatically:

```
SW License = Adjusted Area × Unit Price × Vehicle Weight Multiplier
```

The vehicle weight multiplier increases in steps based on annual throughput (matching the Nissan Excel tiers). You can see the calculated value displayed here — it flows into OPEX when you click Apply.

---

#### Apply to SR Pricing Tab (Blue Button)

**What it does:** Transfers all calculated values from this tab into the SR Pricing tab inputs:

| SR Pricing field receives | Source from Pricing Calc |
|---|---|
| CAPEX HW | Sum of all hardware (price × count) |
| CAPEX NRE | Total NRE across all sites |
| CAPEX Installation | $84,000 fixed (Developer License) |
| OPEX Area (m²) | Total area across all sites |
| Operational License | SW License calculated above |

The app automatically switches to the SR Pricing tab after applying.

---

## Preset Panel

Open with the **🏭 Presets** button in the header.

This is a shared library for the whole team. When you save a preset, every colleague with access can see and load it immediately.

---

### 🔄 Refresh Button (top right of panel)

**What it does:** Re-downloads the latest presets from Google Sheets right now.

**When to use:** If a colleague just saved a new preset and you want to see it without logging out and back in.

---

### 📂 Import JSON Button (top right of panel)

**What it does:** Loads a preset from a JSON file on your computer (a file that was previously exported).

**When to use:** If someone shared a preset file with you by email or chat, instead of through the shared Sheets.

---

### Each Preset Card

Every saved preset shows as a card with:

- **Factory name** — Brand · Country · Plant
- **Author** — Who saved it
- **Date** — When it was saved
- **Notes** — Any additional context

**Buttons on each card:**

| Button | What it does |
|---|---|
| **Load** | Replaces all your current inputs with this preset's values |
| **↓ Export** | Downloads this preset as a JSON file to your computer |
| **🗑 Delete** | Permanently removes this preset from Google Sheets — be careful! |

> When a preset is loaded, the header shows the preset name and an **Update** button. Use **Update** to save your changes back to that same preset (it overwrites it).

---

## Report & Quotation Modal

Open with the **📄 Report** button in the header.

---

### Mode Toggle: `Internal Report` / `Customer Quotation`

Click either tab to switch between the two types of PDF.

---

### Internal Report Mode

For your team's internal use — contains full cost breakdown including overhead and margin.

**Fields to fill in:**

| Field | What to type |
|---|---|
| **Author** | Your name (pre-filled from your Google account) |
| **Department** | Your team or department |
| **Client / OEM** | The customer's company name |
| **Project / Plant** | The factory or project name |
| **Notes** | Any context or special assumptions |

**📥 Download Internal Report (PDF) button** — Generates and downloads the PDF to your computer.

**PDF contains:**
- Project information
- Production & Transport KPIs
- CAPEX full breakdown (4-step calculation)
- OPEX & ROI summary
- **Sensitivity Analysis Matrix** (the full 5×5 ROI matrix from your current settings)
- Full year-by-year ROI table

---

### Customer Quotation Mode

The official document to hand to the customer. Overhead and margin are NOT shown — only final prices.

**Additional fields:**

| Field | What to type |
|---|---|
| **Contact Person** | Customer's name at the factory |
| **Sales Representative** | Your name (pre-filled) |
| **Valid for (days)** | How many days the quote is valid — used to calculate an expiry date |

**Quote No.** is auto-generated as `QT-YYYYMMDD-HHMM` when you generate the PDF.

**📥 Download Quotation (PDF) button** — Generates and downloads the quotation PDF.

**PDF contains:**
- Cover page with Quote No., validity date, SR branding
- Hardware BOM
- Step-by-step CAPEX pricing
- OPEX breakdown
- ROI highlights
- Terms & Conditions

---

### 💾 Save to Drive Buttons

Two separate Drive buttons — one for Internal Report, one for Quotation.

**What they do:** Generate the PDF and upload it directly to the shared **SR ATI ROI Reports** folder in Google Drive. No need to download and re-upload manually.

**If your Drive token has expired:** The app automatically asks for permission again and retries. You don't need to log out.

---

## Troubleshooting

| Problem | Likely cause | What to do |
|---|---|---|
| Login button doesn't appear | Browser is blocking the Google sign-in script | Disable ad blockers or try a different browser |
| "Sheets load failed (HTTP 401)" | Your Sheets token expired | Log out and log back in |
| "Sheets load failed (HTTP 403)" | API permissions issue | Contact your Workspace admin |
| Preset doesn't save | Offline or Sheets unavailable | Your inputs are saved locally in the browser; try again when connected |
| Drive upload fails | Drive API permissions issue | Contact your Workspace admin — they need to approve the `drive` scope |
| Numbers show as `—` or negative | Inputs are incomplete or zero | Fill in all tabs in order, especially Transport and Workforce |
| Red ⚠ border on an input field | The value is outside the expected range | Check the min/max shown in the hint and correct the value |

---

## Version History

| Version | Date | What changed |
|---|---|---|
| **v1.12.2** | 2026-03-19 | Sensitivity axis values freely editable (type any number, any sign) |
| v1.12.1 | 2026-03-19 | Sensitivity Analysis redesigned as 2D ROI matrix (CAPEX × Labor) |
| v1.12.0 | 2026-03-18 | Sensitivity table added to PDF; jsPDF lazy-loaded for faster startup |
| v1.11.1 | 2026-03-18 | Pricing Calc state saved in presets; React Error Boundary; bundle size −73% |
| v1.11.0 | 2026-03-17 | Sheets 401 auto-retry; CSV export; auto-saved badge; preset JSON import/export |
| v1.10.1 | 2026-03-15 | Sensitivity step configurable; extra shift days fix |
| v1.10.0 | 2026-03-15 | Sensitivity Analysis, Scenario A/B, Operational License, NRE dynamic config |
| v1.9.2 | 2026-03-14 | Internal Report & Quotation PDF; Google Drive save; HW presets |
| v1.9.1 | 2026-03-14 | Mobile responsive layout; Pricing Calc state cache |
| v1.8.x | 2026-03-13 | Analytics charts; full EN/KR i18n |
| v1.7.0 | 2026-03-13 | Pricing Calc tab (5th tab) |
| v1.6.0 | 2026-03-12 | Google Sheets team preset sharing |
| v1.5.0 | 2026-03-12 | EN/KR language toggle |
| v1.0.0 | 2026-03-12 | Initial release |
