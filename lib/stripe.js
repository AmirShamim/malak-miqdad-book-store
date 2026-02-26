import Stripe from 'stripe'

// Server-side Stripe instance — only use in API routes
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export default stripe
