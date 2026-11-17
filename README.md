# Powermeat Welkom — Online Butchery Store + Central Admin & Staff System

> **"Meat so good, it hits different!"**  
> Physical Butchery: **145 Power Road, Welkom, Free State, 9460, South Africa**  
> Phone: 057 396 3189 / 057 396 1805 | WhatsApp Orders: 072 477 9314

A mobile-first e-commerce web platform and central administrative back-office built specifically for Powermeat in Welkom, designed for fast 3G/4G loading on Android smartphones, with full dispatch management, hamper building, 12h00 day-before cut-off scheduling, and automated driver run sheets.

---

## 1. Going live: what is set up and what you do once

The site runs on **GitHub Pages** and stores everything in the **Firebase project `powermeat-8e3ff`**.

**Already done in the code**
- Orders, products, specials, delivery areas, settings, staff and the activity log live in Cloud Firestore.
- Staff sign in with Google or email and password (Firebase Authentication). Customers can sign in with Google on *Track my order* to see live status.
- `firestore.rules` decides who may read and change what. `npm run test:rules` proves it with 68 forged-request tests.
- `.github/workflows/deploy.yml` runs the type check, unit tests, rule tests and dependency scan on every pull request, and on `main` builds and publishes to GitHub Pages.

**One-time steps in your accounts (in this order)**
1. **Publish the database rules.** Firebase console → Firestore Database → Rules → paste the whole of `firestore.rules` → Publish. Do this before the site goes live.
2. **Allow the website address to sign in.** Firebase console → Authentication → Settings → Authorised domains → add `inno202.github.io`.
3. **Turn on GitHub Pages.** GitHub repo → Settings → Pages → Source: **GitHub Actions**. Then merge to `main` (or re-run the workflow). The site appears at `https://inno202.github.io/Powermeat/`.
4. **Make yourself Owner.** Open `https://inno202.github.io/Powermeat/#admin`, sign in, and follow *Setting up as the Owner for the first time?* (it shows your account code and the four fields to add in Firestore).
5. **Load the catalogue.** In the staff area: Settings → *Load the starting catalogue*. Then edit products and prices as needed.
6. **Invite staff.** Staff → *Invite staff* (name, email, role). They sign in with that email using Google, or choose *Create a password* and confirm their email.

**Recommended next**
- Firebase console → App Check → register the web app with reCAPTCHA, then enforce it for Firestore (blocks bots placing fake orders).
- Google Cloud console → APIs & Services → Credentials → restrict the browser API key to `inno202.github.io/*` and `localhost`.
- Authentication → Settings → keep *Email enumeration protection* on.

### Demo mode (optional)
`VITE_DEMO_MODE=true npm run dev` runs a password-free demo with sample data kept in the browser only, with these emails:

| Role | Email | What they can do |
|---|---|---|
| **Owner** | `owner@powermeat.co.za` | Everything: products, prices, specials, settings, staff accounts, reports, deleting. |
| **Store manager** | `manager@powermeat.co.za` | Products, hamper builder, specials, orders, delivery days, reports. |
| **Counter staff** | `counter@powermeat.co.za` | Process orders, weigh and adjust per-kg items, capture walk-in / phone / WhatsApp orders. |
| **Delivery driver** | `driver@powermeat.co.za` | Their own deliveries only: out for delivery, delivered or failed, cash collected. |

---

## 2. Key Features

### 2.1 Customer Storefront (`/`)
- **Brand Identity:** The Powermeat horn logo and red (`#D7141A`) with yellow price badges (`#FFC400`), on a warm off-white page with upright serif headings (Cormorant Garamond) and a clean sans for everything else (DM Sans).
- **Navigate Drawer:** Top utility bar with cart count badge; black main header with "Navigate" outlined button opening a full-width slide-down drawer with expandable submenus for Hampers and Butchery cuts.
- **Product Catalog & Detail View:** Square card grid (2 columns on mobile, 4 on desktop), "Image varies from product" overlay, "What's inside" hamper breakdown tabs, and 0.5kg quantity steppers for per-kg items with estimated totals and butcher scale weighing disclaimers.
- **Free Delivery Guarantee:** Free delivery applies automatically to **any order containing a Family Hamper or Meat Combo**.
- **12h00 Cut-Off Engine:** Orders placed after 12:00 noon cannot be selected for next-day delivery or collection, enforcing butcher prep times.
- **Order via WhatsApp Alternative:** One-tap button opening `wa.me/27724779314` with pre-filled line items, subtotal, area, and delivery date.
- **Order Tracking & Reorder:** Format `PM-000123` with live status tracking and a one-click Reorder button to refill the cart.
- **POPIA Privacy & Compliance:** Marketing opt-in consent recorded at checkout, with minimum data collection.

### 2.2 Central Admin & Back-Office (`/admin`)
- **Orders Pipeline:** Dual-view pipeline featuring a searchable List view and a drag-and-drop style Kanban board.
- **Weigh & Adjust:** Staff enter butcher scale readings for per-kg lines; totals update in real-time and changes are logged to the immutable audit trail with a mandatory reason.
- **Printable Slips:**
  - 80mm thermal receipt format for point-of-sale receipt printers.
  - A4 tax invoice & packing slip format.
  - Driver Delivery Run Sheet grouped by delivery area and date with cash collection lines.
- **Hamper Builder & Duplication:** Add "What's inside" item lines (pack size × quantity × item name) with automatic total weight and price/kg calculation. One-click product cloning for fast hamper creation.
- **Bulk Price Update:** Adjust prices across entire meat categories (e.g., +5% on Beef) with a live preview before applying.
- **Specials & Campaign Re-Run:** Automated date expiry; archived specials can be re-run with new dates in one tap.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Architecture:** React front end on GitHub Pages; Cloud Firestore and Firebase Authentication; all permissions enforced by `firestore.rules`.
- **Security:** ABAC role-based rules (`firestore.rules`), intermediate schema definition (`firebase-blueprint.json`), and comprehensive threat modeling (`security_spec.md`).

---

## 4. Setup, Deployment & Firebase Configuration

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Pricing, delivery cut-offs, order numbers)
npm test

# 3. Run the database rule tests (needs Java; starts a local Firestore emulator)
npm run test:rules

# 4. Start the site on port 3000 (uses the live Firebase project)
npm run dev

# Or against local Firebase emulators (no live data touched)
npx firebase-tools emulators:start --only firestore,auth --project demo-powermeat
VITE_USE_EMULATORS=true npm run dev
```

### Production Build
```bash
npm run build
```

### How to Add New Staff Accounts
1. Sign in to the staff area (`#admin`) as the **Owner**.
2. Open **Staff** and choose **Invite staff**.
3. Enter their name, email, cell phone and role (Manager, Counter staff or Driver).
4. They sign in with that email. Their account is created with exactly that role.
5. Accounts can be **deactivated** at any time without losing order history.
