import { supabase } from './supabase'

// Fallback products — served instantly, always available
const fallbackProducts = [
  {
    id: 'book-1',
    title: 'A Book of Sweets Made by a Palestinian Girl Malak Miqdad',
    price: 1500,
    currency: 'USD',
    description: 'A Palestinian girl from Gaza shares 11 dessert recipes born from resilience and hope. From Basbousa with Cream to Palestinian Nights, each dish carries heritage, comfort, and survival—sweetness created in the middle of struggle.',
    cover_url: '/images/cover1.jpg',
    accent_color: 'from-amber-300 to-rose-300',
    categories: ['Desserts', 'Palestinian', 'Sweets', 'Heritage'],
    is_active: true,
  },
  {
    id: 'book-2',
    title: '15 Famous Palestinian Recipes Made With Love By Malak Miqdad',
    price: 1500,
    currency: 'USD',
    description: 'More resilient, low-cost, low-tech recipes you can make anywhere.',
    cover_url: '/images/cover2.jpg',
    accent_color: 'from-emerald-300 to-cyan-300',
    categories: ['One-Pot Meals', 'Preservation', 'Spice Mixes', 'Comfort Foods'],
    is_active: true,
  }
]

// Race a promise against a timeout
function withTimeout(promise, ms = 3000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), ms)),
  ])
}

/**
 * Fetch all active products — fallback-first strategy.
 * Returns fallback immediately if Supabase env vars are missing or fetch fails.
 * ISR revalidation silently updates the page when Supabase data is available.
 */
export async function getProducts() {
  // If Supabase isn't configured, skip the network call entirely
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return fallbackProducts
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    )

    if (error || !data?.length) {
      return fallbackProducts
    }

    return data
  } catch {
    return fallbackProducts
  }
}

/**
 * Fetch a single product by ID — fallback-first strategy.
 */
export async function getProduct(id) {
  const fallback = fallbackProducts.find(p => p.id === id) || null

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return fallback
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()
    )

    if (error || !data) {
      return fallback
    }

    return data
  } catch {
    return fallback
  }
}

// Keep default export for backward compatibility during migration
export default fallbackProducts
