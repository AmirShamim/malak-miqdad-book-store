/**
 * Pure formatting utilities — zero dependencies.
 * Separated from lib/products.js so importing formatPrice
 * doesn't drag in @supabase/supabase-js.
 */

export function formatPrice(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}
