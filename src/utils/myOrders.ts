import { Order } from '../types';

/* A copy of each order placed from this browser, so a customer can see what they
   ordered without signing in. The live status needs a sign-in (see My orders). */
const KEY = 'pm_my_orders_v2';
const MAX = 20;

export function getMyOrders(): Order[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(o => o && typeof o.id === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberMyOrder(order: Order) {
  try {
    // The proof-of-payment file can be large, so it is not kept on the device.
    const { popUrl: _omit, ...copy } = order;
    const rest = getMyOrders().filter(o => o.id !== order.id);
    localStorage.setItem(KEY, JSON.stringify([copy, ...rest].slice(0, MAX)));
  } catch {
    // Storage full or blocked: the order is still placed, just not remembered here.
  }
}
