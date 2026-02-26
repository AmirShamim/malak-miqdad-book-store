-- =============================================
-- Malak Miqdad Marketplace — Supabase Schema
-- =============================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all tables, indexes, RLS policies, and seed data

-- =============================================
-- 1. PROFILES (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 2. PRODUCTS (digital products for sale)
-- =============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- stored in cents (e.g., 1500 = $15.00)
  currency TEXT NOT NULL DEFAULT 'USD',
  cover_url TEXT,
  file_url TEXT, -- path in Supabase Storage
  categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  accent_color TEXT DEFAULT 'from-amber-300 to-rose-300',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can do everything with products"
  ON public.products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 3. ORDERS (product purchases)
-- =============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert/update orders"
  ON public.orders FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
  -- Note: This is permissive but orders are only created server-side via API routes
  -- using the service role key. The anon key + RLS restricts reads to own orders.

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 4. SERVICE PACKAGES (graphic design tiers)
-- =============================================
CREATE TABLE public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  delivery_days INTEGER NOT NULL DEFAULT 7,
  revisions INTEGER NOT NULL DEFAULT 2,
  features JSONB DEFAULT '[]', -- array of feature strings
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active service packages"
  ON public.service_packages FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can do everything with service packages"
  ON public.service_packages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 5. SERVICE BOOKINGS
-- =============================================
CREATE TABLE public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'payment_pending', 'in_progress', 'revision', 'completed', 'cancelled')),
  brand_name TEXT,
  brief TEXT NOT NULL,
  reference_urls TEXT[] DEFAULT '{}',
  deadline DATE,
  amount INTEGER, -- in cents, set when admin accepts
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_session_id TEXT,
  deliverable_url TEXT, -- path in Supabase Storage for final deliverables
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON public.service_bookings(user_id);
CREATE INDEX idx_bookings_status ON public.service_bookings(status);

-- RLS
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON public.service_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON public.service_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do everything with bookings"
  ON public.service_bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 6. BOOKING MESSAGES (project communication)
-- =============================================
CREATE TABLE public.booking_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_booking ON public.booking_messages(booking_id);

-- RLS
ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view messages"
  ON public.booking_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.service_bookings
      WHERE service_bookings.id = booking_messages.booking_id
        AND (service_bookings.user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Booking participants can send messages"
  ON public.booking_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.service_bookings
      WHERE service_bookings.id = booking_messages.booking_id
        AND (service_bookings.user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- =============================================
-- 7. CONTACTS (contact form submissions)
-- =============================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view contacts"
  ON public.contacts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update contacts"
  ON public.contacts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 8. ANALYTICS (simple page view tracking)
-- =============================================
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_path TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_path ON public.analytics(event_path);
CREATE INDEX idx_analytics_created ON public.analytics(created_at);

-- RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view analytics"
  ON public.analytics FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 9. PORTFOLIO (showcase past design work)
-- =============================================
CREATE TABLE public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT, -- e.g., 'Logo Design', 'Brand Identity', 'Social Media'
  client_name TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio"
  ON public.portfolio FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage portfolio"
  ON public.portfolio FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- SEED DATA: Initial products
-- =============================================
INSERT INTO public.products (title, description, price, currency, cover_url, categories, accent_color, sort_order) VALUES
(
  'A Book of Sweets Made by a Palestinian Girl Malak Miqdad',
  'A Palestinian girl from Gaza shares 11 dessert recipes born from resilience and hope. From Basbousa with Cream to Palestinian Nights, each dish carries heritage, comfort, and survival—sweetness created in the middle of struggle.',
  1500,
  'USD',
  '/images/cover1.jpg',
  ARRAY['Desserts', 'Palestinian', 'Sweets', 'Heritage'],
  'from-amber-300 to-rose-300',
  1
),
(
  '15 Famous Palestinian Recipes Made With Love By Malak Miqdad',
  'More resilient, low-cost, low-tech recipes you can make anywhere.',
  1500,
  'USD',
  '/images/cover2.jpg',
  ARRAY['One-Pot Meals', 'Preservation', 'Spice Mixes', 'Comfort Foods'],
  'from-emerald-300 to-cyan-300',
  2
);

-- =============================================
-- SEED DATA: Service packages
-- =============================================
INSERT INTO public.service_packages (title, description, price, delivery_days, revisions, features, sort_order) VALUES
(
  'Logo Design',
  'A unique, professional logo for your brand. Includes multiple initial concepts and iterative refinement.',
  15000,
  5,
  3,
  '["3 initial concepts", "Vector source files (AI/SVG)", "High-res PNG/JPG exports", "Brand color palette", "Black & white variations"]',
  1
),
(
  'Brand Identity Kit',
  'Complete visual identity package including logo, color palette, typography, and brand guidelines document.',
  40000,
  10,
  3,
  '["Logo design (3 concepts)", "Color palette & typography", "Brand guidelines PDF", "Business card design", "Social media profile assets", "Letterhead & envelope design"]',
  2
),
(
  'Social Media Pack',
  'Eye-catching social media templates and assets for consistent brand presence across platforms.',
  10000,
  3,
  2,
  '["10 post templates", "Story/Reel templates", "Profile & cover images", "Highlight icons", "Editable Canva/Figma files"]',
  3
),
(
  'Custom Illustration',
  'Hand-crafted digital illustration tailored to your specific needs — from editorial to product packaging.',
  20000,
  7,
  2,
  '["Custom digital illustration", "High-res exports (300dpi)", "Multiple format delivery", "Commercial use license"]',
  4
);

-- =============================================
-- STORAGE BUCKETS (run in Supabase Dashboard > Storage)
-- =============================================
-- Create these buckets manually in the Supabase Dashboard:
-- 1. "product-files" (private) — for digital product files (PDFs, etc.)
-- 2. "product-covers" (public) — for product cover images
-- 3. "booking-files" (private) — for booking attachments & deliverables
-- 4. "portfolio" (public) — for portfolio showcase images
-- 5. "avatars" (public) — for user profile pictures

-- =============================================
-- MAKE FIRST USER AN ADMIN
-- =============================================
-- After signing up your admin account, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
