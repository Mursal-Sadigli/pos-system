import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export async function createCheckoutSession(sessionId: string) {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe yüklənə bilmədi');
  }

  return (stripe as typeof stripe & { redirectToCheckout?: (options: { sessionId: string }) => Promise<unknown> }).redirectToCheckout?.({ sessionId });
}
