import { supabase } from './supabase'

// Fallback products for when Supabase is not configured yet
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

// Race a promise against a timeout (default 4 s)
function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), ms)),
  ])
}

// Fetch all active products from Supabase
export async function getProducts() {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    )

    if (error || !data?.length) {
      console.warn('Using fallback products:', error?.message)
      return fallbackProducts
    }

    return data
  } catch (err) {
    console.warn('Supabase unavailable, using fallback products')
    return fallbackProducts
  }
}

// Fetch a single product by ID
export async function getProduct(id) {
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
      return fallbackProducts.find(p => p.id === id) || null
    }

    return data
  } catch (err) {
    return fallbackProducts.find(p => p.id === id) || null
  }
}

// Helper: format price from cents to display string
export function formatPrice(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Keep default export for backward compatibility during migration
export default fallbackProducts
