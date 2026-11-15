# Powermeat Welkom — Security Specification & Rule Audit

## 1. Data Invariants
1. **Catalog Integrity:** Only authenticated staff with `owner` or `manager` roles can create, update, or delete products and promotional specials.
2. **Pricing Safeguards:** Product prices must always be numbers `>= 0`.
3. **Order State Isolation:** Customers can create `new` orders. Customers can only read orders matching their authenticated identity.
4. **Order Status Progression:** Once an order reaches terminal status (`completed` or `cancelled`), subsequent field mutations are locked, except by the `owner`.
5. **Staff Access Control (RBAC):** Role hierarchy is enforced via `/staff/{userId}` lookup:
   - `owner`: Full privileges (including staff invites, role changes, settings, and deletion).
   - `manager`: Catalog, specials, orders, run sheets, and reporting. Cannot manage staff or change business settings.
   - `counter`: Order viewing, processing, scale weigh-and-adjust, marking ready for collection.
   - `driver`: Restricted to updating orders assigned to their `userId` (marking out for delivery, delivered, failed, and recording cash collected).
6. **Immutable Audit Trail:** Documents in `/activity_logs/{logId}` can only be appended by active staff and are strictly immutable (`allow update, delete: if false`).

---

## 2. The "Dirty Dozen" Threat Payloads (Blocked by Security Rules)

1. **Payload 1 (Privilege Escalation on User Profile):**
   A standard customer or counter staff writes `{ role: 'owner' }` to their `/staff/{uid}` document.
   *Result:* Rejected by `isOwner()` gate on `/staff/{userId}`.

2. **Payload 2 (Anonymous Product Creation):**
   An unauthenticated client attempts to POST to `/products/hacked-cut` with price `0.01`.
   *Result:* Denied by default-deny and `isManager()` check.

3. **Payload 3 (Negative Price Injection):**
   A malicious staff payload attempts to update a hamper price to `-500`.
   *Result:* Rejected by `incoming().price >= 0` check.

4. **Payload 4 (Ghost Field Injection):**
   An attacker sends an order update including an undeclared property `isInternalApproved: true`.
   *Result:* Blocked by `affectedKeys().hasOnly(...)` constraints.

5. **Payload 5 (Cross-Customer Order Scraping):**
   An authenticated customer attempts `list` on `/orders` without staff credentials.
   *Result:* Denied; client cannot read non-owned order documents.

6. **Payload 6 (Unauthorized Driver Tampering):**
   A driver attempts to edit customer name or pricing on an assigned order.
   *Result:* Blocked by driver constraint restricting `affectedKeys` strictly to `['orderStatus', 'cashCollected', 'driverNotes', 'paymentStatus', 'updatedAt']`.

7. **Payload 7 (Unassigned Driver Order Hijack):**
   Driver B attempts to update an order assigned to Driver A.
   *Result:* Denied by `existing().assignedDriverId == request.auth.uid`.

8. **Payload 8 (Audit Log Deletion):**
   A compromised staff account attempts to `DELETE` records from `/activity_logs/log-123` to cover tracks.
   *Result:* Denied by `allow delete: if false`.

9. **Payload 9 (Audit Log Modification):**
   A user tries to alter the timestamp of an action in `/activity_logs`.
   *Result:* Denied by `allow update: if false`.

10. **Payload 10 (Settings Tampering by Counter Staff):**
    Counter staff tries to toggle `onlinePaymentEnabled` or change bank account info in `/settings`.
    *Result:* Denied; only `isOwner()` can write to `/settings/{settingId}`.

11. **Payload 11 (Oversized Document ID Exhaustion):**
    Attacker passes a 2KB string as document ID to exhaust Firestore resources.
    *Result:* Blocked by `isValidId()` enforcing `size() <= 128` and regex alphanumeric match.

12. **Payload 12 (Self-Activation of Deactivated Staff):**
    A deactivated staff member attempts to update `active: true` on their own record.
    *Result:* Blocked; only `isOwner()` can update `/staff/{userId}` documents.
