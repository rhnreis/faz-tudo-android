const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

function all(query) {
  return new Promise((res, rej) => db.all(query, [], (err, rows) => err ? rej(err) : res(rows)));
}

(async () => {
  try {
    const users = await all('SELECT u.id, u.email, p.full_name, p.phone, p.plan FROM users u LEFT JOIN profiles p ON u.id = p.user_id');
    const plans = await all('SELECT * FROM plans');
    const signals = await all('SELECT * FROM signals');
    console.log('USERS:\n', JSON.stringify(users, null, 2));
    console.log('\nPLANS:\n', JSON.stringify(plans, null, 2));
    console.log('\nSIGNALS:\n', JSON.stringify(signals, null, 2));
  } catch (e) {
    console.error('Error reading DB', e);
  } finally {
    db.close();
  }
})();
