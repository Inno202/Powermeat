import { DeliveryArea, OrderItem } from '../types';
import { formatZAR } from './pricing';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Checks if a specific target date is eligible for delivery/collection given:
 * - Current timestamp
 * - Area allowed delivery days
 * - Blocked dates
 * - Cutoff hour (default 12 for 12:00 noon the day before)
 */
export function isDateEligible(
  targetDateStr: string, // YYYY-MM-DD
  areaDays: string[],
  blockedDates: string[] = [],
  cutoffHour: number = 12,
  now: Date = new Date()
): { eligible: boolean; reason?: string } {
  if (blockedDates.includes(targetDateStr)) {
    return { eligible: false, reason: 'This date is blocked for public holiday or closure.' };
  }

  // Parse target date at midnight local time
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 0, 0, 0);

  // Today at midnight
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return { eligible: false, reason: 'Orders must be placed by 12:00 noon the day before delivery.' };
  }

  // If ordering for tomorrow (diffDays === 1), check current time against cutoff
  if (diffDays === 1) {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    if (currentHour > cutoffHour || (currentHour === cutoffHour && currentMin > 0)) {
      return { eligible: false, reason: '12:00 noon cutoff has passed for tomorrow.' };
    }
  }

  // Check if day of week is supported by area
  const targetDayName = DAY_NAMES[targetDate.getDay()];
  if (!areaDays.includes(targetDayName)) {
    return { eligible: false, reason: `Deliveries to this area are not scheduled on ${targetDayName}.` };
  }

  return { eligible: true };
}

/**
 * Returns a list of next available eligible dates (up to `limit` dates)
 */
export function getAvailableDates(
  areaDays: string[],
  blockedDates: string[] = [],
  cutoffHour: number = 12,
  limit: number = 14,
  now: Date = new Date()
): Array<{ dateStr: string; label: string; dayName: string }> {
  const dates: Array<{ dateStr: string; label: string; dayName: string }> = [];
  const searchStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  for (let i = 0; i < 30 && dates.length < limit; i++) {
    const candidate = new Date(searchStart);
    candidate.setDate(searchStart.getDate() + i);

    const year = candidate.getFullYear();
    const month = String(candidate.getMonth() + 1).padStart(2, '0');
    const day = String(candidate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const check = isDateEligible(dateStr, areaDays, blockedDates, cutoffHour, now);
    if (check.eligible) {
      const dayName = DAY_NAMES[candidate.getDay()];
      const formatted = candidate.toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      dates.push({
        dateStr,
        label: formatted,
        dayName
      });
    }
  }

  return dates;
}

/**
 * Generates an order number in format PM-000123
 */
export function generateOrderNumber(sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(6, '0');
  return `PM-${padded}`;
}

/**
 * Formats a WhatsApp link for ordering cart items
 */
export function createWhatsAppOrderLink(
  phone: string, // e.g. "072 477 9314" or "27724779314"
  orderData: {
    orderNumber?: string;
    customerName: string;
    customerCell: string;
    deliveryType: 'delivery' | 'collection';
    area: string;
    deliveryAddress?: string;
    deliveryDate: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: string;
    notes?: string;
  }
): string {
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  const cleanPhone = digitsOnly.startsWith('0') ? '27' + digitsOnly.slice(1) : digitsOnly;
  const lines: string[] = [
    `*POWERMEAT ORDER REQUEST*`,
    orderData.orderNumber ? `*Order ID:* ${orderData.orderNumber}` : `*New Order*`,
    `--------------------------------`,
    `*Customer:* ${orderData.customerName}`,
    `*Cell:* ${orderData.customerCell}`,
    `*Fulfillment:* ${orderData.deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Collection'}`,
    `*Area:* ${orderData.area}`,
    orderData.deliveryAddress ? `*Address:* ${orderData.deliveryAddress}` : '',
    `*Date:* ${orderData.deliveryDate}`,
    `--------------------------------`,
    `*ITEMS:*`,
    ...orderData.items.map(
      (item, idx) =>
        `${idx + 1}. ${item.name}${item.selectedOption ? ` (${item.selectedOption})` : ''} x ${item.quantity} = ${formatZAR(item.lineTotal)}`
    ),
    `--------------------------------`,
    `*Subtotal:* ${formatZAR(orderData.subtotal)}`,
    `*Delivery Fee:* ${orderData.deliveryFee === 0 ? 'FREE' : formatZAR(orderData.deliveryFee)}`,
    `*TOTAL:* ${formatZAR(orderData.total)}`,
    `*Payment:* ${orderData.paymentMethod.toUpperCase()}`,
    orderData.notes ? `*Notes:* ${orderData.notes}` : '',
    `--------------------------------`,
    `_Meat so good, it hits different!_`
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

/**
 * Customer notification WhatsApp template generator
 */
export function createStaffCustomerWhatsAppLink(
  customerPhone: string,
  templateType: 'ready_collection' | 'out_for_delivery' | 'confirmed' | 'weighed',
  orderNumber: string,
  customerName: string,
  extraDetails?: { date?: string; total?: number; adjustedNotes?: string }
): string {
  const cleanPhone = customerPhone.replace(/^0/, '27').replace(/[^0-9]/g, '');
  let message = '';

  switch (templateType) {
    case 'ready_collection':
      message = `Hello ${customerName}! 🥩 Your Powermeat order *${orderNumber}* is packed and READY FOR COLLECTION at 145 Power Road, Welkom. Trading hours: Mon-Fri 07:30-17:30, Sat 07:30-14:00. See you soon!`;
      break;
    case 'out_for_delivery':
      message = `Hello ${customerName}! 🚚 Great news — your Powermeat order *${orderNumber}* is OUT FOR DELIVERY with our driver today. Please ensure someone is available at your delivery address.`;
      break;
    case 'confirmed':
      message = `Hello ${customerName}! ✅ Your Powermeat order *${orderNumber}* has been confirmed for ${extraDetails?.date || 'your scheduled date'}. Total: ${extraDetails?.total ? formatZAR(extraDetails.total) : ''}. Thank you for choosing Powermeat!`;
      break;
    case 'weighed':
      message = `Hello ${customerName}! ⚖️ Your order *${orderNumber}* with fresh per-kg butchery cuts has been weighed. ${extraDetails?.adjustedNotes || ''} Updated total: ${extraDetails?.total ? formatZAR(extraDetails.total) : ''}.`;
      break;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
