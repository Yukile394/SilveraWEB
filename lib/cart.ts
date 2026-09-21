// Sepet, tarayıcıda (localStorage) tutulur. Fiyat/kredi bilgisi sadece
// gösterim içindir; ödeme sırasında fiyat HER ZAMAN sunucudan okunur.

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  credit_price: number | null;
  category: string;
}

const KEY = 'silvera_cart';
const EVENT = 'silvera-cart-change';

export function readCart(): CartItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CartItem;
    if (!parsed || typeof parsed.product_id !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCart(item: CartItem | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (item) window.localStorage.setItem(KEY, JSON.stringify(item));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Depolama kapalıysa sessizce yoksay.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCart(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}
