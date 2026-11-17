import { SpecialCampaign } from '../types';

function startOf(date: string): number {
  return new Date(date.length === 10 ? `${date}T00:00:00` : date).getTime();
}
function endOf(date: string): number {
  return new Date(date.length === 10 ? `${date}T23:59:59` : date).getTime();
}

/** A special counts only while it is switched on and today is within its dates. */
export function isSpecialRunning(s: SpecialCampaign, now: Date = new Date()): boolean {
  const t = now.getTime();
  if (!s.active) return false;
  if (s.startDate && !isNaN(startOf(s.startDate)) && startOf(s.startDate) > t) return false;
  if (s.endDate && !isNaN(endOf(s.endDate)) && endOf(s.endDate) < t) return false;
  return true;
}

/** Product id -> the label of the running special it belongs to. */
export function runningSpecialLabels(specials: SpecialCampaign[], now: Date = new Date()): Map<string, string> {
  const labels = new Map<string, string>();
  for (const s of specials) {
    if (!isSpecialRunning(s, now)) continue;
    for (const id of s.productIds) if (!labels.has(id)) labels.set(id, s.label || 'Special');
  }
  return labels;
}
