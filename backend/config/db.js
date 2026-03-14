const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'projeto',
})

async function initDB() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      institution VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'member',
      password VARCHAR(255) NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      position VARCHAR(255),
      manager_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await pool.query(createTableSql)
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'member'")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(255)")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id INTEGER")

  const seedUsers = [
    { name: 'Ana Silva', email: 'ana@azis.com', institution: 'Azis', role: 'manager', points: 1250, position: 'CEO', managerEmail: null },
    { name: 'Carlos Santos', email: 'carlos@azis.com', institution: 'Azis', role: 'member', points: 980, position: 'Frontend Developer', managerEmail: 'ana@azis.com' },
    { name: 'Maria Oliveira', email: 'maria@azis.com', institution: 'Azis', role: 'member', points: 1100, position: 'Backend Developer', managerEmail: 'ana@azis.com' },
    { name: 'Pedro Costa', email: 'pedro@azis.com', institution: 'Azis', role: 'member', points: 750, position: 'QA Engineer', managerEmail: 'maria@azis.com' },
    { name: 'Julia Lima', email: 'julia@azis.com', institution: 'Azis', role: 'member', points: 890, position: 'UX Designer', managerEmail: 'carlos@azis.com' },
    { name: 'Rafael Souza', email: 'rafael@azis.com', institution: 'Azis', role: 'member', points: 1350, position: 'DevOps Engineer', managerEmail: 'ana@azis.com' },
  ]

  const defaultPassword = '123456'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  for (const user of seedUsers) {
    let userId;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [user.email])
    if (existing.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO users (name, email, institution, role, points, position, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [user.name, user.email, user.institution, user.role, user.points, user.position, hashedPassword]
      )
      userId = insertResult.rows[0].id
    } else {
      userId = existing.rows[0].id
      await pool.query(
        'UPDATE users SET role = $1, points = $2, position = $3 WHERE id = $4',
        [user.role, user.points, user.position, userId]
      )
    }

    if (user.managerEmail) {
      const manager = await pool.query('SELECT id FROM users WHERE email = $1', [user.managerEmail])
      if (manager.rows.length > 0) {
        await pool.query('UPDATE users SET manager_id = $1 WHERE id = $2', [manager.rows[0].id, userId])
      }
    }
  }
}

module.exports = { pool, initDB }
