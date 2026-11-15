import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isDateEligible,
  getAvailableDates,
  generateOrderNumber,
  createWhatsAppOrderLink,
  createStaffCustomerWhatsAppLink
} from './delivery';

test('generateOrderNumber pads sequence number to 6 digits with PM- prefix', () => {
  assert.equal(generateOrderNumber(1), 'PM-000001');
  assert.equal(generateOrderNumber(123), 'PM-000123');
  assert.equal(generateOrderNumber(9999), 'PM-009999');
});

test('isDateEligible blocks same-day delivery', () => {
  // Current time: 2026-10-15 09:00:00 (Thursday)
  const now = new Date(2026, 9, 15, 9, 0, 0);
  const targetDateStr = '2026-10-15';
  const result = isDateEligible(targetDateStr, ['Thursday'], [], 12, now);
  assert.equal(result.eligible, false);
});

test('isDateEligible respects 12:00 noon cut-off for next-day delivery', () => {
  // Current time: 2026-10-15 11:30:00 (before noon)
  const morning = new Date(2026, 9, 15, 11, 30, 0);
  // Tomorrow is Friday 2026-10-16
  const nextDay = '2026-10-16';
  const morningCheck = isDateEligible(nextDay, ['Friday'], [], 12, morning);
  assert.equal(morningCheck.eligible, true);

  // Current time: 2026-10-15 12:30:00 (after noon)
  const afternoon = new Date(2026, 9, 15, 12, 30, 0);
  const afternoonCheck = isDateEligible(nextDay, ['Friday'], [], 12, afternoon);
  assert.equal(afternoonCheck.eligible, false);
});

test('isDateEligible rejects unscheduled area days and blocked dates', () => {
  const morning = new Date(2026, 9, 15, 10, 0, 0); // Thursday
  // Target: Sunday 2026-10-18
  const sunday = '2026-10-18';
  const sundayCheck = isDateEligible(sunday, ['Monday', 'Tuesday', 'Wednesday'], [], 12, morning);
  assert.equal(sundayCheck.eligible, false);

  // Blocked date (e.g. holiday)
  const tuesday = '2026-10-20';
  const blockedCheck = isDateEligible(tuesday, ['Tuesday'], ['2026-10-20'], 12, morning);
  assert.equal(blockedCheck.eligible, false);
});

test('getAvailableDates returns list of upcoming valid dates', () => {
  const morning = new Date(2026, 9, 15, 10, 0, 0);
  const dates = getAvailableDates(['Wednesday'], [], 12, 3, morning);
  assert.ok(dates.length > 0);
  for (const d of dates) {
    assert.equal(d.dayName, 'Wednesday');
  }
});

test('createWhatsAppOrderLink creates correct wa.me link with order details', () => {
  const link = createWhatsAppOrderLink('072 477 9314', {
    orderNumber: 'PM-000123',
    customerName: 'Sipho Zulu',
    customerCell: '0821234567',
    deliveryType: 'delivery',
    area: 'Welkom',
    deliveryAddress: '12 Bok Street, Welkom',
    deliveryDate: '2026-10-20',
    items: [
      {
        productId: 'mc-1',
        name: 'Meat Combo 1',
        category: 'Meat Combos',
        pricingType: 'fixed',
        unitPrice: 1050,
        quantity: 1,
        lineTotal: 1050
      }
    ],
    subtotal: 1050,
    deliveryFee: 0,
    total: 1050,
    paymentMethod: 'cod'
  });

  assert.ok(link.startsWith('https://wa.me/27724779314?text='));
  assert.ok(link.includes(encodeURIComponent('PM-000123')));
  assert.ok(link.includes(encodeURIComponent('Meat Combo 1')));
});

test('createStaffCustomerWhatsAppLink creates template notification for collection', () => {
  const link = createStaffCustomerWhatsAppLink(
    '0821234567',
    'ready_collection',
    'PM-000123',
    'Sipho'
  );
  assert.ok(link.startsWith('https://wa.me/27821234567?text='));
  assert.ok(link.includes(encodeURIComponent('READY FOR COLLECTION')));
});
