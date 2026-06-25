const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyJWT(token) {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const expected = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

module.exports = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const payload = verifyJWT(auth.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  return res.status(200).json({ valid: true, user: payload.username });
};
