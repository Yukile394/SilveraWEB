// Ödeme sağlayıcısından bağımsız arayüz. İleride PayTR eklemek için
// sadece bu interface'i uygulayan yeni bir dosya (örn. paytr.ts) yaz
// ve getPaymentProvider() içinde seçilecek sağlayıcıyı değiştir.
// Sipariş/webhook/teslimat mantığının HİÇBİRİ sağlayıcıya özel değil.

export interface CheckoutParams {
  orderId: string; // bizim orders.id — provider'a basketId/conversationId olarak gider
  price: number; // TL, server-side (products tablosundan) — asla client'tan alınmaz
  currency: 'TRY';
  buyerNick: string;
  callbackUrl: string;
}

export interface CheckoutResult {
  ok: boolean;
  paymentPageUrl?: string; // kullanıcı buraya yönlendirilir
  error?: string;
}

export interface VerifiedPaymentResult {
  ok: boolean;
  orderId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  status?: 'success' | 'failed';
  error?: string;
}

export interface PaymentProvider {
  name: string;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  // token/callback'ten gelen veriyle sağlayıcıya SUNUCU TARAFINDAN sorup
  // gerçek sonucu döner. Frontend'in "ödeme başarılı" demesine güvenilmez.
  verifyCallback(token: string): Promise<VerifiedPaymentResult>;
}
