import { PricingType } from '../types';

/**
 * Formats a number as South African Rand (ZAR): R1,050.00
 */
export function formatZAR(amount: number): string {
  if (isNaN(amount)) return 'R0.00';
  const parts = amount.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `R${parts.join('.')}`;
}

/**
 * Calculates and formats price per kilogram: R105.00/kg
 */
export function calcPricePerKg(price: number, weightKg?: number): string | null {
  if (!weightKg || weightKg <= 0 || price <= 0) return null;
  const perKg = price / weightKg;
  return `${formatZAR(perKg)}/kg`;
}

/**
 * Free delivery rule:
 * "Free delivery on any Family Hamper or Meat Combo."
 */
export function checkCartFreeDelivery(items: Array<{ category: string; isFreeDelivery?: boolean }>): boolean {
  if (!items || items.length === 0) return false;
  return items.some(item => {
    if (item.isFreeDelivery) return true;
    const cat = (item.category || '').toLowerCase();
    return cat.includes('family hamper') || cat.includes('meat combo');
  });
}

/**
 * Calculates delivery fee based on delivery type, area fee, and cart items
 */
export function calculateDeliveryFee(
  deliveryType: 'delivery' | 'collection',
  areaFee: number,
  items: Array<{ category: string; isFreeDelivery?: boolean }>
): number {
  if (deliveryType === 'collection') return 0;
  if (checkCartFreeDelivery(items)) return 0;
  return Math.max(0, areaFee);
}

/**
 * Calculates the line item total
 */
export function calculateLineTotal(
  pricingType: PricingType,
  unitPrice: number,
  quantity: number,
  actualWeightKg?: number
): number {
  const qty = (actualWeightKg !== undefined && actualWeightKg > 0 && pricingType === 'per_kg')
    ? actualWeightKg
    : quantity;
  return Math.round((unitPrice * qty + 0.0001) * 100) / 100;
}

/**
 * Calculates bulk price adjustment with rounding to nearest 50c / 99c or 2 decimals
 */
export function applyBulkPriceUpdate(currentPrice: number, percentage: number): number {
  const newPrice = currentPrice * (1 + percentage / 100);
  return Math.round(newPrice * 100) / 100;
}
