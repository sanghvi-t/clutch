import Stripe from 'stripe';
import { ENV } from './env';

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: '2025-04-30.basil',
});

export const PRICES = {
  pro: ENV.stripeProPriceId,
  elite: ENV.stripeElitePriceId,
  charter: ENV.stripeCharterPriceId,
};
