import fs from 'fs'
import path from 'path'

const analyticsFile = path.join(process.cwd(), 'data', 'analytics.json')

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const { path: pagePath = '/' } = req.body || {}
  let data = {}
  try{
    const raw = fs.readFileSync(analyticsFile, 'utf8')
    data = JSON.parse(raw || '{}')
  }catch(e){ data = {} }
  data[pagePath] = (data[pagePath] || 0) + 1
  fs.writeFileSync(analyticsFile, JSON.stringify(data, null, 2))
  return res.status(200).json({ ok: true })
}
