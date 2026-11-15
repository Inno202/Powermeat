import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatZAR,
  calcPricePerKg,
  checkCartFreeDelivery,
  calculateDeliveryFee,
  calculateLineTotal,
  applyBulkPriceUpdate
} from './pricing';

test('formatZAR formats numbers according to South African Rand standard', () => {
  assert.equal(formatZAR(1050), 'R1,050.00');
  assert.equal(formatZAR(99.99), 'R99.99');
  assert.equal(formatZAR(0), 'R0.00');
  assert.equal(formatZAR(2450.5), 'R2,450.50');
});

test('calcPricePerKg calculates correct unit price per kg', () => {
  assert.equal(calcPricePerKg(1050, 10), 'R105.00/kg');
  assert.equal(calcPricePerKg(1420, 15), 'R94.67/kg');
  assert.equal(calcPricePerKg(100, 0), null);
});

test('checkCartFreeDelivery gives free delivery on Family Hampers or Meat Combos', () => {
  assert.equal(checkCartFreeDelivery([{ category: 'Meat Combos' }]), true);
  assert.equal(checkCartFreeDelivery([{ category: 'Family Hampers' }]), true);
  assert.equal(checkCartFreeDelivery([{ category: 'Bulk Meat', isFreeDelivery: true }]), true);
  assert.equal(checkCartFreeDelivery([{ category: 'Bulk Meat', isFreeDelivery: false }]), false);
  assert.equal(checkCartFreeDelivery([]), false);
});

test('calculateDeliveryFee respects collection and hamper rules', () => {
  // Collection is always 0
  assert.equal(calculateDeliveryFee('collection', 50, [{ category: 'Bulk Meat' }]), 0);
  // Free hamper in cart means 0
  assert.equal(calculateDeliveryFee('delivery', 50, [{ category: 'Meat Combos' }]), 0);
  // Otherwise standard area fee
  assert.equal(calculateDeliveryFee('delivery', 50, [{ category: 'Bulk Meat' }]), 50);
});

test('calculateLineTotal handles fixed, per_kg, and adjusted weight lines', () => {
  assert.equal(calculateLineTotal('fixed', 150, 2), 300);
  assert.equal(calculateLineTotal('per_kg', 99.99, 1.5), 149.99);
  // Staff weighed line with actual weight
  assert.equal(calculateLineTotal('per_kg', 99.99, 1.5, 1.82), 181.98);
});

test('applyBulkPriceUpdate adjusts price by percentage accurately', () => {
  assert.equal(applyBulkPriceUpdate(100, 5), 105);
  assert.equal(applyBulkPriceUpdate(99.99, 5), 104.99);
  assert.equal(applyBulkPriceUpdate(100, -10), 90);
});
