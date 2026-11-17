// Firestore rule tests. Run with: npm run test:rules
// Each "blocked" test is a forged request that the rules must refuse.
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

let env;
const nowSeconds = () => Math.floor(Date.now() / 1000);

const staff = (uid, opts = {}) =>
  env.authenticatedContext(uid, { auth_time: opts.oldSignIn ? nowSeconds() - 10 * 3600 : nowSeconds() }).firestore();
const customer = (uid, email, verified = true) =>
  env.authenticatedContext(uid, { email, email_verified: verified }).firestore();
const guest = () => env.unauthenticatedContext().firestore();

const newOrder = (over = {}) => ({
  id: 'PM-000200',
  customerName: 'Thabo Mokoena',
  customerCell: '082 123 4567',
  customerEmail: 'thabo@example.com',
  deliveryType: 'delivery',
  area: 'Welkom',
  deliveryAddress: '12 Stateway',
  deliveryDate: '2026-11-20',
  items: [{ productId: 'p1', name: 'Family Hamper 1', quantity: 1, unitPrice: 950, lineTotal: 950 }],
  subtotal: 950,
  deliveryFee: 0,
  total: 950,
  paymentMethod: 'cod',
  paymentStatus: 'pending',
  orderStatus: 'new',
  source: 'web',
  marketingOptIn: false,
  createdAt: '2026-11-16T10:00:00.000Z',
  updatedAt: '2026-11-16T10:00:00.000Z',
  ...over
});

const product = (over = {}) => ({
  id: 'p1', name: 'Family Hamper 1', slug: 'family-hamper-1', category: 'Family Hampers', sku: 'FH-001',
  description: '10kg hamper', pricingType: 'fixed', price: 950, isFreeDelivery: true, stockStatus: 'in_stock',
  sortOrder: 1, tags: [], ...over
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-powermeat',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 }
  });
});
after(async () => { await env.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'staff/owner1'), { name: 'Owner', role: 'owner', active: true });
    await setDoc(doc(db, 'staff/manager1'), { name: 'Manager', role: 'manager', active: true });
    await setDoc(doc(db, 'staff/counter1'), { name: 'Counter', role: 'counter', active: true });
    await setDoc(doc(db, 'staff/driverA'), { name: 'Driver A', role: 'driver', active: true });
    await setDoc(doc(db, 'staff/driverB'), { name: 'Driver B', role: 'driver', active: true });
    await setDoc(doc(db, 'staff/exstaff'), { name: 'Gone', role: 'manager', active: false });
    await setDoc(doc(db, 'products/p1'), product());
    await setDoc(doc(db, 'orders/PM-000101'), newOrder({ id: 'PM-000101' }));
    await setDoc(doc(db, 'orders/PM-000102'), newOrder({
      id: 'PM-000102', orderStatus: 'out_for_delivery', assignedDriverId: 'driverA', customerEmail: 'other@example.com'
    }));
    await setDoc(doc(db, 'orders/PM-000103'), newOrder({ id: 'PM-000103', orderStatus: 'completed', paymentStatus: 'paid' }));
    await setDoc(doc(db, 'activity_logs/log1'), { id: 'log1', userId: 'owner1', userName: 'Owner', userRole: 'owner', action: 'x', details: 'y', timestamp: 't' });
    await setDoc(doc(db, 'settings/site'), { businessName: 'Powermeat' });
  });
});

// ----- Catalogue -----
test('anyone can read the catalogue', async () => {
  await assertSucceeds(getDoc(doc(guest(), 'products/p1')));
});
test('blocked: a visitor creating a product', async () => {
  await assertFails(setDoc(doc(guest(), 'products/hacked'), product({ id: 'hacked', price: 0.01 })));
});
test('blocked: counter staff changing a price', async () => {
  await assertFails(setDoc(doc(staff('counter1'), 'products/p1'), product({ price: 1 })));
});
test('a manager can update a product', async () => {
  await assertSucceeds(setDoc(doc(staff('manager1'), 'products/p1'), product({ price: 990 })));
});
test('blocked: a negative price', async () => {
  await assertFails(setDoc(doc(staff('manager1'), 'products/p1'), product({ price: -500 })));
});
test('blocked: an extra made-up field on a product', async () => {
  await assertFails(setDoc(doc(staff('manager1'), 'products/p1'), product({ isInternalApproved: true })));
});
test('blocked: a product photo that is not an https link', async () => {
  await assertFails(setDoc(doc(staff('manager1'), 'products/p1'), product({ imageUrl: 'javascript:alert(1)' })));
});
test('blocked: a deactivated manager', async () => {
  await assertFails(setDoc(doc(staff('exstaff'), 'products/p1'), product({ price: 990 })));
});
test('blocked: a manager deleting a product (Owner only)', async () => {
  await assertFails(deleteDoc(doc(staff('manager1'), 'products/p1')));
});
test('blocked: Owner deleting with a sign-in older than 8 hours', async () => {
  await assertFails(deleteDoc(doc(staff('owner1', { oldSignIn: true }), 'products/p1')));
});
test('the Owner can delete a product after a recent sign-in', async () => {
  await assertSucceeds(deleteDoc(doc(staff('owner1'), 'products/p1')));
});

// ----- Orders: placing -----
test('a visitor can place a valid order', async () => {
  await assertSucceeds(setDoc(doc(guest(), 'orders/PM-000200'), newOrder()));
});
test('blocked: an order that arrives already paid', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ paymentStatus: 'paid' })));
});
test('blocked: an order that arrives already confirmed', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ orderStatus: 'completed' })));
});
test('blocked: a total that does not add up', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ total: 1 })));
});
test('blocked: a negative delivery fee', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ deliveryFee: -900, total: 50 })));
});
test('blocked: an extra made-up field on an order', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ assignedDriverId: 'driverA' })));
});
test('blocked: an empty order', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ items: [], subtotal: 0, total: 0 })));
});
test('blocked: a proof of payment that is a web page', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ popUrl: 'data:text/html;base64,AAAA' })));
});
test('a photo proof of payment is accepted', async () => {
  await assertSucceeds(setDoc(doc(guest(), 'orders/PM-000200'), newOrder({ popUrl: 'data:image/jpeg;base64,AAAA' })));
});
test('blocked: an oversized document id', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/' + 'x'.repeat(200)), newOrder()));
});
test('blocked: overwriting an existing order by placing it again', async () => {
  await assertFails(setDoc(doc(guest(), 'orders/PM-000101'), newOrder({ id: 'PM-000101', customerName: 'Someone Else' })));
});
test('counter staff can capture a walk-in order', async () => {
  await assertSucceeds(setDoc(doc(staff('counter1'), 'orders/PM-000201'), newOrder({ id: 'PM-000201', source: 'walk_in' })));
});

// ----- Orders: reading -----
test('blocked: a visitor reading an order', async () => {
  await assertFails(getDoc(doc(guest(), 'orders/PM-000101')));
});
test('blocked: a customer listing all orders', async () => {
  await assertFails(getDocs(collection(customer('c1', 'thabo@example.com'), 'orders')));
});
test('a customer can read their own order', async () => {
  await assertSucceeds(getDoc(doc(customer('c1', 'thabo@example.com'), 'orders/PM-000101')));
});
test('blocked: a customer reading someone else\'s order', async () => {
  await assertFails(getDoc(doc(customer('c1', 'thabo@example.com'), 'orders/PM-000102')));
});
test('blocked: a customer with an unverified email claiming an order', async () => {
  await assertFails(getDoc(doc(customer('c2', 'thabo@example.com', false), 'orders/PM-000101')));
});
test('staff can list orders', async () => {
  await assertSucceeds(getDocs(collection(staff('counter1'), 'orders')));
});

// ----- Orders: processing -----
test('counter staff can move an order along and mark it paid', async () => {
  await assertSucceeds(updateDoc(doc(staff('counter1'), 'orders/PM-000101'), { orderStatus: 'confirmed', paymentStatus: 'paid' }));
});
test('blocked: counter staff rewriting the customer on an order', async () => {
  await assertFails(updateDoc(doc(staff('counter1'), 'orders/PM-000101'), { customerName: 'Me', customerCell: '0820000000' }));
});
test('blocked: counter staff editing a completed order', async () => {
  await assertFails(updateDoc(doc(staff('counter1'), 'orders/PM-000103'), { paymentStatus: 'refunded' }));
});
test('the Owner can still correct a completed order', async () => {
  await assertSucceeds(updateDoc(doc(staff('owner1'), 'orders/PM-000103'), { paymentStatus: 'refunded' }));
});
test('a driver can record the outcome of their own delivery', async () => {
  await assertSucceeds(updateDoc(doc(staff('driverA'), 'orders/PM-000102'), { orderStatus: 'completed', cashCollected: 950, paymentStatus: 'paid' }));
});
test('blocked: a driver updating another driver\'s delivery', async () => {
  await assertFails(updateDoc(doc(staff('driverB'), 'orders/PM-000102'), { orderStatus: 'completed' }));
});
test('blocked: a driver changing the price or customer', async () => {
  await assertFails(updateDoc(doc(staff('driverA'), 'orders/PM-000102'), { total: 1 }));
  await assertFails(updateDoc(doc(staff('driverA'), 'orders/PM-000102'), { customerName: 'X' }));
});
test('blocked: a driver taking an order that is not out for delivery', async () => {
  await assertFails(updateDoc(doc(staff('driverA'), 'orders/PM-000101'), { orderStatus: 'completed' }));
});
test('blocked: a manager deleting an order (Owner only)', async () => {
  await assertFails(deleteDoc(doc(staff('manager1'), 'orders/PM-000101')));
});

// ----- Staff -----
test('blocked: counter staff making themselves Owner', async () => {
  await assertFails(updateDoc(doc(staff('counter1'), 'staff/counter1'), { role: 'owner' }));
});
test('blocked: a deactivated account re-activating itself', async () => {
  await assertFails(updateDoc(doc(staff('exstaff'), 'staff/exstaff'), { active: true }));
});
test('blocked: a customer reading the staff list', async () => {
  await assertFails(getDocs(collection(customer('c1', 'thabo@example.com'), 'staff')));
});
test('blocked: a customer creating a staff record for themselves', async () => {
  await assertFails(setDoc(doc(customer('c1', 'thabo@example.com'), 'staff/c1'), { name: 'Me', role: 'owner', active: true }));
});
test('the Owner can add staff after a recent sign-in', async () => {
  await assertSucceeds(setDoc(doc(staff('owner1'), 'staff/new1'), { name: 'New', role: 'counter', active: true }));
});
test('blocked: the Owner changing roles with a sign-in older than 8 hours', async () => {
  await assertFails(updateDoc(doc(staff('owner1', { oldSignIn: true }), 'staff/counter1'), { role: 'manager' }));
});
test('blocked: an invented role', async () => {
  await assertFails(setDoc(doc(staff('owner1'), 'staff/new2'), { name: 'New', role: 'superadmin', active: true }));
});

// ----- Activity log -----
const logEntry = (over = {}) => ({ id: 'log2', userId: 'counter1', userName: 'Counter', userRole: 'counter', action: 'Weigh', details: 'ok', timestamp: '2026-11-16T10:00:00Z', ...over });
test('staff can add a log entry under their own name', async () => {
  await assertSucceeds(setDoc(doc(staff('counter1'), 'activity_logs/log2'), logEntry()));
});
test('blocked: a log entry written under someone else\'s name', async () => {
  await assertFails(setDoc(doc(staff('counter1'), 'activity_logs/log2'), logEntry({ userId: 'owner1' })));
});
test('blocked: editing or deleting the activity log, even by the Owner', async () => {
  await assertFails(updateDoc(doc(staff('owner1'), 'activity_logs/log1'), { timestamp: 'changed' }));
  await assertFails(deleteDoc(doc(staff('owner1'), 'activity_logs/log1')));
});
test('blocked: a visitor reading the activity log', async () => {
  await assertFails(getDoc(doc(guest(), 'activity_logs/log1')));
});

// ----- Settings, areas, unknown collections -----
test('blocked: counter staff changing site settings', async () => {
  await assertFails(updateDoc(doc(staff('counter1'), 'settings/site'), { onlinePaymentEnabled: true }));
});
test('the Owner can change site settings', async () => {
  await assertSucceeds(updateDoc(doc(staff('owner1'), 'settings/site'), { onlinePaymentEnabled: true }));
});
test('blocked: counter staff changing a delivery fee', async () => {
  await assertFails(setDoc(doc(staff('counter1'), 'delivery_areas/a1'), { name: 'Welkom', fee: 0, active: true }));
});
test('blocked: any collection the rules do not name', async () => {
  await assertFails(setDoc(doc(staff('owner1'), 'anything_else/x'), { a: 1 }));
  await assertFails(getDoc(doc(guest(), 'anything_else/x')));
});
