import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSpecialRunning, runningSpecialLabels } from './specials';
import { SpecialCampaign } from '../types';

const base: SpecialCampaign = { id: 's1', title: 'Pork Knuckle Special', label: 'While Stock Lasts', startDate: '2026-11-01', active: true, productIds: ['pork-knuckle'] };
const now = new Date('2026-11-17T10:00:00');

test('an ended (switched off) special does not run', () => {
  assert.equal(isSpecialRunning({ ...base, active: false }, now), false);
});
test('a special runs through the whole of its end date, then stops', () => {
  assert.equal(isSpecialRunning({ ...base, endDate: '2026-11-17' }, new Date('2026-11-17T23:00:00')), true);
  assert.equal(isSpecialRunning({ ...base, endDate: '2026-11-16' }, now), false);
});
test('a special that has not started yet does not run', () => {
  assert.equal(isSpecialRunning({ ...base, startDate: '2026-11-20' }, now), false);
});
test('labels come only from running specials', () => {
  const labels = runningSpecialLabels([base, { ...base, id: 's2', active: false, productIds: ['p2'], label: 'Old' }], now);
  assert.equal(labels.get('pork-knuckle'), 'While Stock Lasts');
  assert.equal(labels.has('p2'), false);
});
