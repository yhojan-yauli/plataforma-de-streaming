import api from './api';
import type { SubscriptionPlan, Subscription, PaymentRequest, PaymentResponse } from '@/types';

export const subscriptionService = {
  getPlans: () =>
    api.get<SubscriptionPlan[]>('/subscriptions/plans'),

  getCurrentSubscription: () =>
    api.get<Subscription>('/subscriptions/current'),

  processPayment: (data: PaymentRequest) =>
    api.post<PaymentResponse>('/subscriptions/pay', data),

  /** Calculate proportional access given partial payment */
  calculateProportional: (planId: string, availableAmount: number) =>
    api.post<{ days: number; hours: number }>('/subscriptions/calculate-proportional', {
      planId,
      availableAmount,
    }),
};
