# Gumroad + Next.js Starter

This is a small starter that demonstrates:

- Next.js storefront with product pages
- Gumroad buy links (simple integration)
- A Gumroad webhook handler to record orders
- Minimal file-based analytics for quick local testing

Important: This is a prototype. For production, swap file-based storage for a DB (Supabase/Postgres) and use secure webhook signature verification.

Getting started

1. Install dependencies

```powershell
npm install
```

2. Run the dev server

```powershell
npm run dev
```

3. Open http://localhost:3000

Configuration

- Edit product metadata in `lib/products.js` to set `gumroadUrl` to your Gumroad product links.
- Configure a Gumroad webhook pointing to `https://<your-domain>/api/webhooks/gumroad` if you want server-side order recording.

Notes

- Webhook handler accepts form-encoded Gumroad payloads and appends orders to `data/orders.json`.
- Analytics endpoint records simple pageviews in `data/analytics.json`.

Next steps (recommended):
- Add a real DB (Supabase) and switch analytics/orders to it
- Add Stripe endpoints and signed download generation when you're ready to control fulfillment
- Add secure verification of Gumroad webhook signatures (if you configure a secret)
