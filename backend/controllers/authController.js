const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')

const JWT_SECRET = process.env.JWT_SECRET || 'azis_secret_key'

async function register(req, res) {
  try {
    const { name, email, institution, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' })
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const insertResult = await pool.query(
      'INSERT INTO users (name, email, institution, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, institution',
      [name, email, institution || null, hashedPassword]
    )

    const user = insertResult.rows[0]

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      user: { ...user, points: 0 },
    })
  } catch (error) {
    console.error('register error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' })
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = userResult.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' })
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      institution: user.institution,
      role: user.role ?? 'member',
      points: typeof user.points === 'number' ? user.points : 0,
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: payload,
    })
  } catch (error) {
    console.error('login error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

module.exports = {
  register,
  login,
}
