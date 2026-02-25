import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const usersFile = path.join(process.cwd(), 'data', 'users.json')

function readUsers() {
  try {
    const raw = fs.readFileSync(usersFile, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (e) {
    return []
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

function isEmail(v) {
  return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, password } = req.body || {}
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters'
  if (!email || !isEmail(email)) errors.email = 'Valid email is required'
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters'
  if (Object.keys(errors).length) return res.status(400).json({ errors })

  const users = readUsers()
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ errors: { email: 'An account with this email already exists' } })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashed,
    createdAt: new Date().toISOString()
  }
  users.push(user)
  writeUsers(users)

  return res.status(201).json({ ok: true, user: { id: user.id, name: user.name, email: user.email } })
}
