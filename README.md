# Powermeat Welkom — Online Butchery Store + Central Admin & Staff System

> **"Meat so good, it hits different!"**  
> Physical Butchery: **145 Power Road, Welkom, Free State, 9460, South Africa**  
> Phone: 057 396 3189 / 057 396 1805 | WhatsApp Orders: 072 477 9314

A mobile-first e-commerce web platform and central administrative back-office built specifically for Powermeat in Welkom, designed for fast 3G/4G loading on Android smartphones, with full dispatch management, hamper building, 12h00 day-before cut-off scheduling, and automated driver run sheets.

---

## 1. Staff Demo Mode (read this first)

The staff area currently runs in **demo mode**: there are **no passwords**, and all data (products, orders, staff) is saved in the visitor's own browser. It is meant for trying the system out, not for real customer data.

- Demo mode is **on** while developing (`npm run dev`) and **off** in a normal production build (`npm run build`). With it off, the staff sign-in page says it is switched off.
- To show the demo on a hosted preview, build with `VITE_DEMO_MODE=true npm run build`. Do not do this for the real public shop.
- In demo mode, sign in with any of these emails (no password), or tap a role on the sign-in page:

| Role | Email | What they can do |
|---|---|---|
| **Owner** | `owner@powermeat.co.za` | Everything: products, prices, specials, settings, staff accounts, reports, deleting. |
| **Store manager** | `manager@powermeat.co.za` | Products, hamper builder, specials, orders, delivery days, reports. |
| **Counter staff** | `counter@powermeat.co.za` | Process orders, weigh and adjust per-kg items, capture walk-in / phone / WhatsApp orders. |
| **Delivery driver** | `driver@powermeat.co.za` | Their own deliveries only: out for delivery, delivered or failed, cash collected. |

Real staff accounts need Firebase Authentication connected (see section 4). The database rules in `firestore.rules` are already written and tested for that.

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
- **Architecture:** Client-authoritative state store with resilient local storage persistence and full dual-mode Firebase integration ready for cloud deployment.
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

# 4. Start development server on port 3000
npm run dev
```

### Production Build
```bash
npm run build
```

### Connecting Live Firebase
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore Database** and **Firebase Authentication**.
3. Place your Firebase credentials in `firebase-applet-config.json` in the project root:
```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "...",
  "appId": "..."
}
```
4. Deploy the production security rules (after `npm run test:rules` passes):
```bash
npx firebase-tools deploy --only firestore:rules
```
5. Hosting: `firebase.json` already sends the security headers (Content-Security-Policy, HSTS, nosniff, no framing, referrer and permissions policies). On Netlify or Cloudflare Pages the same headers come from `public/_headers`.

### How to Add New Staff Accounts
1. Sign in to `/admin` as the **Owner**.
2. Navigate to **Staff Management** in the left sidebar.
3. Click **+ Add Staff Account**.
4. Enter their full name, email, cell phone, and select their operational role (Manager, Counter Staff, or Driver).
5. Accounts are preserved in the system and can be **deactivated** at any time without losing order historical logs.
