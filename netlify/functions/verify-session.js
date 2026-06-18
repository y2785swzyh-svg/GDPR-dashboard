const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verifica JWT
function verifyJWT(token) {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${header}.${body}`)
      .digest('base64');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64').toString());

    // Controlla expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token scaduto
    }

    return payload;
  } catch (err) {
    console.error('[JWT VERIFY]', err);
    return null;
  }
}

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing or invalid authorization header' })
      };
    }

    const token = authHeader.slice(7);
    const payload = verifyJWT(token);

    if (!payload) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true, user: payload.username })
    };

  } catch (err) {
    console.error('[VERIFY ERROR]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
