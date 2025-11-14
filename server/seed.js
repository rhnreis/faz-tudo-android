const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./server/database.sqlite');

(async () => {
  try {
    console.log('Seeding database...');

    // ensure tables exist (same schema as server)
    db.serialize(async () => {
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

      // insert plans if none
      db.get('SELECT COUNT(*) as cnt FROM plans', [], (err, row) => {
        if (err) return console.error(err);
        if (row.cnt === 0) {
          const plans = [
            ['Básico', 29.9, 'Plano básico - 7 dias'],
            ['Premium', 79.9, 'Plano premium - 30 dias'],
            ['VIP', 149.9, 'VIP Diamond - 30 dias']
          ];
          const stmt = db.prepare('INSERT INTO plans (name, price, description) VALUES (?, ?, ?)');
          plans.forEach(p => stmt.run(p[0], p[1], p[2]));
          stmt.finalize();
          console.log('Inserted plans');
        } else {
          console.log('Plans already present');
        }
      });

      // insert master user if not exists
      const masterEmail = 'rodrigohnreis@gmail.com';
      db.get('SELECT * FROM users WHERE email = ?', [masterEmail], async (err, user) => {
        if (err) return console.error(err);
        if (!user) {
          const hash = await bcrypt.hash('304050Ab!', 10);
          db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [masterEmail, hash], function(err2) {
            if (err2) return console.error(err2);
            const userId = this.lastID;
            db.run('INSERT INTO profiles (user_id, full_name, phone, plan) VALUES (?, ?, ?, ?)', [userId, 'Rodrigo', '', 'vip']);
            console.log('Inserted master user');
          });
        } else {
          db.get('SELECT * FROM profiles WHERE user_id = ?', [user.id], (err3, profile) => {
            if (err3) return console.error(err3);
            if (!profile) {
              db.run('INSERT INTO profiles (user_id, full_name, phone, plan) VALUES (?, ?, ?, ?)', [user.id, 'Rodrigo', '', 'vip']);
              console.log('Inserted profile for existing master user');
            } else {
              db.run('UPDATE profiles SET plan = ? WHERE user_id = ?', ['vip', user.id]);
              console.log('Ensured master user is VIP');
            }
          });
        }
      });

      // insert signals if none
      db.get('SELECT COUNT(*) as cnt FROM signals', [], (err4, row2) => {
        if (err4) return console.error(err4);
        if (row2.cnt === 0) {
          const sigs = [
            ['Momento Ouro: Tigrinho', 'Alta probabilidade no Tigrinho', 0],
            ['Sequência Bônus', 'Padrão detectado', 0],
            ['VIP - Leão Dourado', 'Sinal exclusivo VIP', 1]
          ];
          const stmt2 = db.prepare('INSERT INTO signals (title, description, vip_only) VALUES (?, ?, ?)');
          sigs.forEach(s => stmt2.run(s[0], s[1], s[2]));
          stmt2.finalize();
          console.log('Inserted signals');
        } else {
          console.log('Signals already present');
        }
      });

    });

  } catch (e) {
    console.error('Seed error', e);
  } finally {
    // close after a short delay to allow async inserts
    setTimeout(() => db.close(), 1000);
  }
})();
