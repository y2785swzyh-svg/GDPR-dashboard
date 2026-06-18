# GDPR Risk Dashboard — Setup Netlify + Login + Captcha

## 📋 Struttura File

```
.
├── login.html                 # Pagina di login con Cloudflare Turnstile
├── dashboard.html             # Wrapper app protetto
├── public/
│   ├── app.html              # GDPR_Risk_Dashboard_v5.3.html (rinominato)
│   └── assets/               # CSS, JS, images (se presenti)
├── netlify/
│   └── functions/
│       ├── login.js          # API login + JWT
│       └── verify-session.js # Verifica token
├── netlify.toml              # Configurazione Netlify
├── package.json              # Dipendenze Node.js
└── SETUP_NETLIFY.md          # Questo file
```

---

## 🔑 Step 1: Cloudflare Turnstile

### Registrati su Cloudflare
1. Vai su https://dash.cloudflare.com
2. **Account Home** → **Turnstile**
3. Crea un sito:
   - **Domain**: `tuodominio.netlify.app` (es. `gdpr-dashboard.netlify.app`)
   - **Mode**: Managed
   - **Widget Mode**: Non-interactive (o Invisible)

4. **Salva le chiavi**:
   - 🔑 **Site Key** (pubblica, metti in `login.html`)
   - 🔐 **Secret Key** (segreta, metti in Netlify Environment)

### Aggiorna login.html
```html
<!-- Sostituisci SITEKEY_HERE con il tuo Site Key di Cloudflare -->
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY_HERE"></div>
```

---

## 🌐 Step 2: Setup Netlify

### 1. Crea repo GitHub
```bash
cd /path/to/project
git init
git add .
git commit -m "Initial commit: GDPR Dashboard with login"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gdpr-dashboard.git
git push -u origin main
```

### 2. Collega a Netlify
1. Vai su https://app.netlify.com
2. **New site from Git**
3. Seleziona GitHub → autorizza → scegli repo `gdpr-dashboard`
4. **Build settings**:
   - **Base directory**: (lascia vuoto)
   - **Build command**: `npm run build`
   - **Publish directory**: `public`

### 3. Imposta Environment Variables
In **Site settings** → **Build & deploy** → **Environment**:
```
JWT_SECRET=your-super-secret-key-min-32-chars-change-this
TURNSTILE_SECRET=your-cloudflare-secret-key
```

### 4. Deploy
Netlify auto-deploy ad ogni push su `main`:
```bash
git push origin main  # Netlify deploya automaticamente
```

---

## 📄 Step 3: Prepara il Dashboard

### Rinomina il file app
Copia `GDPR_Risk_Dashboard_v5.3.html` in `public/app.html`:
```bash
cp GDPR_Risk_Dashboard_v5.3.html public/app.html
```

### Struttura public/
```
public/
├── app.html              # GDPR_Risk_Dashboard_v5.3.html
└── (altri file statici se presenti)
```

---

## 🔐 Step 4: Database Utenti (Produzione)

**Attualmente**: Credenziali hardcoded in `netlify/functions/login.js`

Per produzione, integra un vero DB:

### Opzione A: Firebase (Consigliato)
```javascript
// In netlify/functions/login.js
const admin = require('firebase-admin');
const db = admin.firestore();

const user = await db.collection('users').doc(username).get();
if (user.exists && await admin.auth().verifyPassword(username, password)) {
  // Login OK
}
```

### Opzione B: Supabase
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .single();
```

### Opzione C: MongoDB + Atlas
```javascript
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.MONGODB_URI);

const user = await client.db('gdpr').collection('users').findOne({ username });
```

---

## 🧪 Step 5: Test Locale

### Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Run locally
```bash
netlify dev
```

Accedi a:
- **Login**: http://localhost:8888/login.html
- **Dashboard**: http://localhost:8888/dashboard.html

**Credenziali di test**:
- Username: `demo`
- Password: `Aegis2026!Demo`

---

## 📝 Credenziali Hardcoded (Solo Test)

In `netlify/functions/login.js`:
```javascript
const USERS = {
  'demo': { password: 'Aegis2026!Demo' },
  'admin': { password: 'Aegis2026!Admin' }
};
```

⚠️ **CAMBIA PRIMA DI PRODUZIONE** — migra a un vero database!

---

## 🔗 URL Stabile

Una volta deployed, la tua app sarà disponibile su:
```
https://gdpr-dashboard.netlify.app/login.html
```

Puoi personalizzare il dominio:
1. Netlify → **Site settings** → **Domain management**
2. Aggiungi dominio custom (es. `gdpr.tuazienda.it`)
3. Configura CNAME su DNS della tua zona

---

## 🛡️ Security Checklist

- ✅ Turnstile captcha integrato
- ✅ JWT tokens con expiration (24 ore)
- ✅ HttpOnly cookies per sessione
- ✅ CORS headers sicuri
- ✅ Rate limiting su login
- ⚠️ TODO: Integrare vero database utenti
- ⚠️ TODO: Implementare 2FA (opzionale)
- ⚠️ TODO: HTTPS forzato (Netlify lo fa auto)
- ⚠️ TODO: Audit logging

---

## 📞 Support

Per problemi:
1. **Netlify logs**: `netlify dev --debug`
2. **Cloudflare Turnstile**: https://developers.cloudflare.com/turnstile/
3. **JWT debugging**: Usa https://jwt.io/ per decodificare i token

---

## 📋 Checklist Deployment

- [ ] Site Key Cloudflare impostato in `login.html`
- [ ] Secret Key Cloudflare in Netlify env vars
- [ ] JWT_SECRET generato e impostato in env vars
- [ ] `public/app.html` pronto
- [ ] `netlify.toml` configured
- [ ] Git repo creato e pushato
- [ ] Netlify site creato e linckato
- [ ] Test locale con `netlify dev`
- [ ] Deploy iniziale completato
- [ ] URL stabile generato
- [ ] Condiviso link con clienti
- [ ] Credenziali di test inviate a clienti
- [ ] Database utenti produzione pianificato

---

**Versione**: 5.3  
**Ultimo aggiornamento**: 2026-06-17  
**Powered by Aegis Advisory**
