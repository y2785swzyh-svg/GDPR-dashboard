const crypto = require('crypto');

// TODO: Sostituisci con un vero database (Firebase, Supabase, MongoDB, ecc.)
// Per ora: credenziali hardcoded (SOLO PER TEST)
const USERS = {
  'demo': { password: 'Aegis2026!Demo' },
  'admin': { password: 'Aegis2026!Admin' }
};

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || 'your-turnstile-secret';

// JWT semplice (in produzione usa una libreria come jsonwebtoken)
function signJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${body}`)
    .digest('base64');
  return `${header}.${body}.${signature}`;
}

// Verifica Cloudflare Turnstile
async function verifyTurnstile(token) {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET,
        response: token
      })
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[TURNSTILE]', err);
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password, token } = JSON.parse(event.body);

    // Valida Turnstile
    const captchaOk = await verifyTurnstile(token);
    if (!captchaOk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Captcha verification failed' })
      };
    }

    // Valida credenziali
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing username or password' })
      };
    }

    const user = USERS[username];
    if (!user || user.password !== password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Crea JWT token
    const jwtToken = signJWT({
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 // 24 ore
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `gdpr_token=${jwtToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
      },
      body: JSON.stringify({ token: jwtToken })
    };

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
