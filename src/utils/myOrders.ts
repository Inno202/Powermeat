/* Order numbers placed from this browser, so a customer sees only their own orders. */
const KEY = 'pm_my_orders_v1';

export function getMyOrderIds(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberMyOrder(id: string) {
  const ids = getMyOrderIds();
  if (!ids.includes(id)) localStorage.setItem(KEY, JSON.stringify([id, ...ids].slice(0, 50)));
}
