
import express from 'express';
import sqlite3Init from 'sqlite3';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cors from 'cors';

const sqlite3 = sqlite3Init.verbose();
const app = express();
const db = new sqlite3.Database('./server/database.sqlite');

app.use(cors());
app.use(bodyParser.json());

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// Criação da tabela de usuários
// id, email, password_hash

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    full_name TEXT,
    phone TEXT,
    plan TEXT DEFAULT 'basico',
    plan_expires_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    vip_only INTEGER DEFAULT 0
  )`);
});
// Rotas de perfil
app.get('/api/profile/:email', (req, res) => {
  const { email } = req.params;
  db.get('SELECT p.* FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.email = ?', [email], (err, profile) => {
    if (err || !profile) return res.status(404).json({ error: 'Perfil não encontrado.' });
    res.json(profile);
  });
});

// health check
app.get('/ping', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.post('/api/profile', (req, res) => {
  const { email, full_name, phone } = req.body;
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    db.run('INSERT INTO profiles (user_id, full_name, phone) VALUES (?, ?, ?)', [user.id, full_name, phone], function(err) {
      if (err) return res.status(400).json({ error: 'Erro ao criar perfil.' });
      res.json({ id: this.lastID, user_id: user.id, full_name, phone });
    });
  });
});

// Rotas de planos
app.get('/api/plans', (req, res) => {
  db.all('SELECT * FROM plans', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar planos.' });
    res.json(rows);
  });
});

// Rotas de sinais
app.get('/api/signals', (req, res) => {
  db.all('SELECT * FROM signals', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar sinais.' });
    res.json(rows);
  });
});

app.post('/api/signals', (req, res) => {
  const { title, description, vip_only } = req.body;
  db.run('INSERT INTO signals (title, description, vip_only) VALUES (?, ?, ?)', [title, description, vip_only ? 1 : 0], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao criar sinal.' });
    res.json({ id: this.lastID, title, description, vip_only });
  });
});

// Cadastro de usuário
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios.' });
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Usuário já existe ou erro no cadastro.' });
    // Cria perfil padrão após registro
    const userId = this.lastID;
    db.run('INSERT INTO profiles (user_id, full_name, phone, plan) VALUES (?, ?, ?, ?)', [userId, '', '', 'basico'], function(err2) {
      if (err2) return res.status(400).json({ error: 'Erro ao criar perfil.' });
      res.json({ id: userId, email });
    });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    db.get('SELECT * FROM profiles WHERE user_id = ?', [user.id], (err, profile) => {
      res.json({ id: user.id, email: user.email, profile });
    });
  });
});

// Alterar senha
app.post('/api/change-password', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e nova senha obrigatórios.' });
  const hash = await bcrypt.hash(password, 10);
  db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email], function(err) {
    if (err || this.changes === 0) return res.status(400).json({ error: 'Usuário não encontrado ou erro.' });
    res.json({ success: true });
  });
});

// Rotas administrativas - Usuários
console.log('Registering admin users routes...');
app.get('/api/admin/users', (req, res) => {
  db.all('SELECT u.id, u.email, p.full_name, p.phone, p.plan FROM users u LEFT JOIN profiles p ON u.id = p.user_id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    res.json(rows);
  });
});
app.post('/api/admin/users', async (req, res) => {
  const { email, password, full_name, phone, plan } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao criar usuário.' });
    const userId = this.lastID;
    db.run('INSERT INTO profiles (user_id, full_name, phone, plan) VALUES (?, ?, ?, ?)', [userId, full_name, phone, plan], function(err2) {
      if (err2) return res.status(400).json({ error: 'Erro ao criar perfil.' });
      res.json({ id: userId, email, full_name, phone, plan });
    });
  });
});
app.put('/api/admin/users/:id', (req, res) => {
  const { full_name, phone, plan } = req.body;
  const userId = req.params.id;
  db.run('UPDATE profiles SET full_name = ?, phone = ?, plan = ? WHERE user_id = ?', [full_name, phone, plan, userId], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao atualizar perfil.' });
    res.json({ success: true });
  });
});
app.delete('/api/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  db.run('DELETE FROM profiles WHERE user_id = ?', [userId], function(err) {
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err2) {
      if (err || err2) return res.status(400).json({ error: 'Erro ao excluir usuário.' });
      res.json({ success: true });
    });
  });
});
console.log('Admin users routes registered.');

// Rotas administrativas - Planos
console.log('Registering admin plans routes...');
app.get('/api/admin/plans', (req, res) => {
  db.all('SELECT * FROM plans', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar planos.' });
    res.json(rows);
  });
});
console.log('Admin plans routes registered.');
app.post('/api/admin/plans', (req, res) => {
  const { name, price, description } = req.body;
  db.run('INSERT INTO plans (name, price, description) VALUES (?, ?, ?)', [name, price, description], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao criar plano.' });
    res.json({ id: this.lastID, name, price, description });
  });
});
app.put('/api/admin/plans/:id', (req, res) => {
  const { name, price, description } = req.body;
  db.run('UPDATE plans SET name = ?, price = ?, description = ? WHERE id = ?', [name, price, description, req.params.id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao atualizar plano.' });
    res.json({ success: true });
  });
});
app.delete('/api/admin/plans/:id', (req, res) => {
  db.run('DELETE FROM plans WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao excluir plano.' });
    res.json({ success: true });
  });
});

// Rotas administrativas - Mercado Pago (simples, arquivo em memória)
console.log('Registering mercadopago routes...');
let mercadoPagoConfig = { access_token: '', public_key: '' };
app.get('/api/admin/mercadopago', (req, res) => {
  res.json(mercadoPagoConfig);
});
app.put('/api/admin/mercadopago', (req, res) => {
  mercadoPagoConfig = req.body;
  res.json({ success: true });
});
console.log('MercadoPago routes registered.');

// Endpoint público para criar pagamento (PIX) - simulado/local
app.post('/api/create-payment', (req, res) => {
  try {
    const { planId, customer, method } = req.body || {};
    // Very small validation
    if (!planId) return res.status(400).json({ error: 'planId required' });

    // Simulate a PIX payload and QR (in a real integration we'd call MercadoPago API here)
    const amount = (() => {
      switch (String(planId)) {
        case 'vip': return 149.90;
        case 'premium': return 79.90;
        case 'basic': return 29.90;
        default: return Number(planId) || 29.90;
      }
    })();

    const pixCode = `00020101021126610014br.gov.bcb.pix0136${(Math.random()+1).toString(36).substr(2,12)}520400005303986540${amount.toFixed(2).replace('.', '')}5802BR5925SinaisVIP6009SAO PAULO62070503***6304`;
    const pixQr = `PIX_QR:${Buffer.from(pixCode).toString('base64')}`;
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // respond with the simulated PIX data
    res.json({ pix_code: pixCode, pix_qr: pixQr, amount, expires_at });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Quick GET test endpoint to return a simulated PIX payload (useful for CLI/browser testing)
app.get('/api/create-payment/test', (req, res) => {
  const amount = 49.9;
  const pixCode = `00020101021126610014br.gov.bcb.pix0136TESTPIX${Date.now()}520400005303986540${amount.toFixed(2).replace('.', '')}5802BR5925SinaisVIP6009SAO PAULO62070503***6304`;
  const pixQr = `PIX_QR:${Buffer.from(pixCode).toString('base64')}`;
  const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  res.json({ pix_code: pixCode, pix_qr: pixQr, amount, expires_at });
});

// Rota de seed (inserir dados de teste) - idempotente
app.get('/api/admin/seed', async (req, res) => {
  try {
    // inserir planos se não existirem
    db.get('SELECT COUNT(*) as cnt FROM plans', [], (err, row) => {
      if (!err && row && row.cnt === 0) {
        const plans = [
          ['Básico', 29.9, 'Plano básico - 7 dias'],
          ['Premium', 79.9, 'Plano premium - 30 dias'],
          ['VIP', 149.9, 'VIP Diamond - 30 dias']
        ];
        const stmt = db.prepare('INSERT INTO plans (name, price, description) VALUES (?, ?, ?)');
        plans.forEach(p => stmt.run(p[0], p[1], p[2]));
        stmt.finalize();
      }
    });

    // inserir usuário master se não existir
    const masterEmail = 'rodrigohnreis@gmail.com';
    db.get('SELECT * FROM users WHERE email = ?', [masterEmail], async (err, user) => {
      if (!user) {
        const hash = await bcrypt.hash('304050Ab!', 10);
        db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [masterEmail, hash], function(err2) {
          if (!err2) {
            const userId = this.lastID;
            db.run('INSERT INTO profiles (user_id, full_name, phone, plan) VALUES (?, ?, ?, ?)', [userId, 'Rodrigo', '', 'vip']);
          }
        });
      } else {
        // garante que o perfil existe e é VIP
        db.get('SELECT * FROM profiles WHERE user_id = ?', [user.id], (err3, profile) => {
          if (!profile) {
            db.run('INSERT INTO profiles (user_id, full_name, phone, plan) VALUES (?, ?, ?, ?)', [user.id, 'Rodrigo', '', 'vip']);
          } else {
            db.run('UPDATE profiles SET plan = ? WHERE user_id = ?', ['vip', user.id]);
          }
        });
      }
    });

    // inserir sinais de exemplo se não existirem
    db.get('SELECT COUNT(*) as cnt FROM signals', [], (err4, row2) => {
      if (!err4 && row2 && row2.cnt === 0) {
        const sigs = [
          ['Momento Ouro: Tigrinho', 'Alta probabilidade no Tigrinho', 0],
          ['Sequência Bônus', 'Padrão detectado', 0],
          ['VIP - Leão Dourado', 'Sinal exclusivo VIP', 1]
        ];
        const stmt2 = db.prepare('INSERT INTO signals (title, description, vip_only) VALUES (?, ?, ?)');
        sigs.forEach(s => stmt2.run(s[0], s[1], s[2]));
        stmt2.finalize();
      }
    });

    res.json({ success: true, message: 'Seed initiated (async). Check admin pages shortly.' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  // listar rotas registradas (debug)
  try {
    const routes = [];
    const routerStack = (app._router && app._router.stack) ? app._router.stack : [];
    routerStack.forEach(mw => {
      if (mw && mw.route && mw.route.path) {
        const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
        routes.push(`${methods} ${mw.route.path}`);
      }
    });
    if (routes.length) {
      console.log('Rotas registradas:\n', routes.join('\n'));
    } else {
      console.log('Nenhuma rota registrada (app._router.stack vazia).');
    }
  } catch (e) {
    console.log('Não foi possível listar rotas:', e);
  }
});
