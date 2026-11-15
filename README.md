# Powermeat Welkom — Online Butchery Store + Central Admin & Staff System

> **"Meat so good, it hits different!"**  
> Physical Butchery: **145 Power Road, Welkom, Free State, 9460, South Africa**  
> Phone: 057 396 3189 / 057 396 1805 | WhatsApp Orders: 072 477 9314

A mobile-first e-commerce web platform and central administrative back-office built specifically for Powermeat in Welkom, designed for fast 3G/4G loading on Android smartphones, with full dispatch management, hamper building, 12h00 day-before cut-off scheduling, and automated driver run sheets.

---

## 1. Demo Logins (Seeded for Instant Access)

The platform includes seeded accounts for all 4 operational roles. You can sign in using the credentials below, or click any role in the **Role Switcher** bar at the top of the `/admin` screen for instant testing:

| Role | Email | Password | Permissions & Responsibilities |
|---|---|---|---|
| **Owner / Admin** | `owner@powermeat.co.za` | `Powermeat#2026` | Full system access: products, prices, bulk price updates, specials, settings, staff accounts, financial reports, delete actions. |
| **Store Manager** | `manager@powermeat.co.za` | `Manager#2026` | Catalog CRUD, hamper builder, specials, orders pipeline, area delivery days schedule, and sales reports. |
| **Counter Staff** | `counter@powermeat.co.za` | `Counter#2026` | Order processing, butcher scale weigh & adjust for per-kg items, mark ready for collection, capture walk-in/phone/WhatsApp orders. |
| **Delivery Driver** | `driver@powermeat.co.za` | `Driver#2026` | Sees only their assigned town deliveries for the day. Can mark Out for Delivery / Delivered / Failed with notes, and record cash collected. |

---

## 2. Key Features

### 2.1 Customer Storefront (`/`)
- **Brand Identity:** High-contrast charcoal and Powermeat Red (`#D7141A`) with yellow starburst price badges (`#FFC400`).
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

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Architecture:** Client-authoritative state store with resilient local storage persistence and full dual-mode Firebase integration ready for cloud deployment.
- **Security:** ABAC role-based rules (`firestore.rules`), intermediate schema definition (`firebase-blueprint.json`), and comprehensive threat modeling (`security_spec.md`).

---

## 4. Setup, Deployment & Firebase Configuration

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Pricing, delivery cut-offs, order numbers)
npx tsx --test src/utils/pricing.test.ts src/utils/delivery.test.ts

# 3. Start development server on port 3000
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
4. Deploy the production security rules:
```bash
firebase deploy --only firestore:rules
```

### How to Add New Staff Accounts
1. Log in to `/admin` as the **Owner** (`owner@powermeat.co.za`).
2. Navigate to **Staff Management** in the left sidebar.
3. Click **+ Add Staff Account**.
4. Enter their full name, email, cell phone, and select their operational role (Manager, Counter Staff, or Driver).
5. Accounts are preserved in the system and can be **deactivated** at any time without losing order historical logs.
