const { pool } = require('../config/db')

async function getUsers(req, res) {
  try {
    const result = await pool.query('SELECT id, name, email, role, manager_id FROM users')
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('getUsers error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

module.exports = {
  getUsers,
}