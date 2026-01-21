import fs from 'fs'
import path from 'path'

const contactsFile = path.join(process.cwd(), 'data', 'contacts.json')

function isEmail(v){
  return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)
}

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, email, message } = req.body || {}
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = 'Name too short'
  if (!email || !isEmail(email)) errors.email = 'Invalid email'
  if (!message || message.trim().length < 10) errors.message = 'Message is too short'
  if (Object.keys(errors).length) return res.status(400).json({ errors })

  const entry = { name: name.trim(), email: email.trim(), message: message.trim(), createdAt: new Date().toISOString() }
  let current = []
  try{
    const raw = fs.readFileSync(contactsFile, 'utf8')
    current = JSON.parse(raw || '[]')
  }catch(e){ current = [] }
  current.unshift(entry)
  try{
    fs.writeFileSync(contactsFile, JSON.stringify(current, null, 2))
  }catch(e){ console.error('Failed to write contact', e) }

  return res.status(200).json({ ok: true })
}
