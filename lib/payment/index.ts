import { iyzicoProvider } from './iyzico';
import type { PaymentProvider } from './types';

export function getPaymentProvider(): PaymentProvider {
  // Şimdilik tek sağlayıcı iyzico. PayTR eklendiğinde:
  // const name = process.env.PAYMENT_PROVIDER ?? 'iyzico';
  // return name === 'paytr' ? paytrProvider : iyzicoProvider;
  return iyzicoProvider;
}

export * from './types';
