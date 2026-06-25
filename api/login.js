const crypto = require('crypto');

const USERS = {
  'demo':  { password: 'Aegis2026!Demo' },
  'admin': { password: 'Aegis2026!Admin' }
};

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function signJWT(payload) {
  const header    = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body      = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64');
  return `${header}.${body}.${signature}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
    const user = USERS[username];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenziali non valide.' });
    }
    const token = signJWT({
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400
    });
    res.setHeader('Set-Cookie', `gdpr_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    return res.status(200).json({ token });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
