import { parse } from 'querystring'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export const config = {
  api: {
    bodyParser: false, // we'll parse raw body (Gumroad sends form-encoded)
  }
}

const ordersFile = path.join(process.cwd(), 'data', 'orders.json')

async function rawBody(req){
  return await new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', err => reject(err))
  })
}

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()

  try{
    const body = await rawBody(req)
    const parsed = parse(body)

    // Optional: verify secret (Gumroad sends 'secret' if configured)
    const expectedSecret = process.env.GUMROAD_WEBHOOK_SECRET
    if(expectedSecret){
      if(!parsed.secret || parsed.secret !== expectedSecret){
        return res.status(401).json({ ok: false, error: 'Invalid webhook secret' })
      }
    }

    // Basic sanity: ensure it's a successful sale
    if(parsed['test'] === 'true') {
      // allow test but mark it
    }
    if(parsed['purchasable_type'] && parsed['purchasable_type'] !== 'Product'){
      return res.status(400).json({ ok: false, error: 'Unsupported purchasable type' })
    }
    // Gumroad posts include fields like 'product_permalink', 'product_name', 'buyer_email', etc.
  const order = {
      id: parsed.sale_id || `${Date.now()}`,
      provider: 'gumroad',
      providerPayload: parsed,
      email: parsed.buyer_email || null,
      product_permalink: parsed.product_permalink || null,
      price: parsed.price || null,
      createdAt: new Date().toISOString()
    }

    // append to orders.json
    let orders = []
    try{
      const raw = fs.readFileSync(ordersFile, 'utf8')
      orders = JSON.parse(raw || '[]')
    }catch(e){ orders = [] }
    orders.push(order)
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2))

    // optionally bump analytics
    try{
      const analyticsPath = path.join(process.cwd(), 'data', 'analytics.json')
      const raw = fs.readFileSync(analyticsPath, 'utf8')
      const analytics = JSON.parse(raw || '{}')
      analytics['/sales'] = (analytics['/sales'] || 0) + 1
      fs.writeFileSync(analyticsPath, JSON.stringify(analytics, null, 2))
    }catch(e){}

    return res.status(200).json({ ok: true })
  }catch(err){
    console.error('webhook error', err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
