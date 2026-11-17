/** Builds a wa.me link from a South African number such as "072 477 9314". */
export function whatsappLink(localNumber: string, message?: string): string {
  const digits = localNumber.replace(/[^0-9]/g, '');
  const international = digits.startsWith('0') ? '27' + digits.slice(1) : digits;
  const base = `https://wa.me/${international}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Builds a tel: link from a number typed with spaces. */
export function telLink(number: string): string {
  return `tel:${number.replace(/[^0-9+]/g, '')}`;
}
