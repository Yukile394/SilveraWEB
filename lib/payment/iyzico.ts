import Iyzipay from 'iyzipay';
import type { PaymentProvider, CheckoutParams, CheckoutResult, VerifiedPaymentResult } from './types';

// PAYMENT_MODE=test  -> sandbox-api.iyzipay.com (gerçek para çekilmez)
// PAYMENT_MODE=production -> api.iyzipay.com
const isTestMode = (process.env.PAYMENT_MODE ?? 'test') !== 'production';

const client = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: isTestMode ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com',
});

function request<T>(fn: (req: any, cb: (err: any, result: T) => void) => void, req: any): Promise<T> {
  return new Promise((resolve, reject) => {
    fn(req, (err: any, result: T) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export const iyzicoProvider: PaymentProvider = {
  name: 'iyzico',

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    try {
      // Kart bilgilerini biz hiç görmüyoruz — kullanıcı iyzico'nun kendi
      // hosted ödeme sayfasına (checkout form) yönlendiriliyor.
      const req = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: params.orderId,
        price: params.price.toFixed(2),
        paidPrice: params.price.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        basketId: params.orderId,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: params.callbackUrl,
        enabledInstallments: [1],
        buyer: {
          id: params.buyerNick,
          name: params.buyerNick,
          surname: 'Silvera',
          gsmNumber: '+905000000000',
          email: `${params.buyerNick}@players.silvera.net`,
          identityNumber: '11111111111',
          registrationAddress: 'Minecraft sunucusu üzerinden dijital ürün',
          ip: '85.34.78.112',
          city: 'Istanbul',
          country: 'Turkey',
        },
        shippingAddress: {
          contactName: params.buyerNick,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Dijital teslimat — kargo yok',
        },
        billingAddress: {
          contactName: params.buyerNick,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Dijital teslimat — kargo yok',
        },
        basketItems: [
          {
            id: params.orderId,
            name: 'Silvera Mağaza Ürünü',
            category1: 'Minecraft',
            itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
            price: params.price.toFixed(2),
          },
        ],
      };

      const result: any = await request(client.checkoutFormInitialize.create.bind(client.checkoutFormInitialize), req);

      if (result.status !== 'success') {
        return { ok: false, error: result.errorMessage || 'iyzico başlatılamadı' };
      }

      return { ok: true, paymentPageUrl: result.paymentPageUrl };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  },

  async verifyCallback(token: string): Promise<VerifiedPaymentResult> {
    try {
      const result: any = await request(client.checkoutForm.retrieve.bind(client.checkoutForm), {
        locale: Iyzipay.LOCALE.TR,
        token,
      });

      if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
        return { ok: false, status: 'failed', orderId: result.basketId, error: result.errorMessage };
      }

      return {
        ok: true,
        status: 'success',
        orderId: result.basketId, // biz conversationId/basketId olarak orders.id gönderdik
        providerPaymentId: String(result.paymentId),
        amount: Number(result.paidPrice),
        currency: result.currency,
      };
    } catch (err) {
      return { ok: false, status: 'failed', error: (err as Error).message };
    }
  },
};
