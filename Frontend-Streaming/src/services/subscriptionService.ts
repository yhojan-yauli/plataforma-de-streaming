import api from './api';
import type {
  CreateStripePaymentIntentRequest,
  PaymentResponse,
  StripeCheckoutConfig,
  StripePaymentIntentResponse,
  Subscription,
  SubscriptionPlan,
} from '@/types';

export const subscriptionService = {
  getPlans: () =>
    api.get<SubscriptionPlan[]>('subscriptions/plans'),

  getCurrentSubscription: async (): Promise<Subscription | null> => {
    const response = await api.get<Subscription>('subscriptions/current', {
      validateStatus: (status) => status === 200 || status === 204,
    });

    return response.status === 204 ? null : response.data;
  },

  getStripeConfig: () =>
    api.get<StripeCheckoutConfig>('subscriptions/stripe/config'),

  createStripePaymentIntent: (payload: CreateStripePaymentIntentRequest) =>
    api.post<StripePaymentIntentResponse>('subscriptions/stripe/payment-intents', payload),

  syncStripePaymentIntent: (paymentId: string) =>
    api.post<PaymentResponse>(`subscriptions/stripe/payment-intents/${paymentId}/sync`, null),
};
