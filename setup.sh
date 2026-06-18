#!/bin/bash

# ═══════════════════════════════════════════════════════════
# GDPR Dashboard — Setup Automatico Netlify + Cloudflare
# ═══════════════════════════════════════════════════════════

set -e

echo "🚀 GDPR Risk Dashboard — Setup Netlify + Turnstile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Chiedi le credenziali
echo "📋 Inserisci le tue credenziali Cloudflare:"
read -p "  🔑 Site Key (Turnstile): " SITE_KEY
read -sp "  🔐 Secret Key (Turnstile): " TURNSTILE_SECRET
echo ""
echo ""

read -p "📋 Inserisci i tuoi dati GitHub:"
read -p "  👤 Username GitHub: " GITHUB_USER
read -p "  📦 Nome repo (es. gdpr-dashboard): " REPO_NAME
echo ""

read -p "🌐 Dominio Netlify (es. gdpr-dashboard): " NETLIFY_DOMAIN
echo ""

# Genera JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "✅ JWT_SECRET generato: $JWT_SECRET"
echo ""

# Crea cartella public
echo "📁 Creando struttura cartelle..."
mkdir -p public
mkdir -p netlify/functions

# Copia GDPR_Risk_Dashboard_v5.3.html -> public/app.html
if [ -f "GDPR_Risk_Dashboard_v5.3.html" ]; then
  cp GDPR_Risk_Dashboard_v5.3.html public/app.html
  echo "✅ GDPR_Risk_Dashboard_v5.3.html → public/app.html"
else
  echo "⚠️  GDPR_Risk_Dashboard_v5.3.html non trovato nel path corrente"
  echo "   Assicurati che il file sia nella stessa cartella di questo script"
fi

# Aggiorna login.html con Site Key
echo "🔐 Aggiornando login.html con Site Key Turnstile..."
if [ -f "login.html" ]; then
  sed -i '' "s/SITEKEY_HERE/$SITE_KEY/g" login.html
  echo "✅ Site Key inserito in login.html"
else
  echo "⚠️  login.html non trovato"
fi

# Crea .env file
echo "📝 Creando .env file..."
cat > .env << EOF
# Cloudflare Turnstile
TURNSTILE_SECRET=$TURNSTILE_SECRET

# JWT Secret
JWT_SECRET=$JWT_SECRET

# Netlify
NETLIFY_SITE_NAME=$NETLIFY_DOMAIN
EOF
echo "✅ .env creato"

# Crea .gitignore
echo "🚫 Creando .gitignore..."
cat > .gitignore << EOF
node_modules/
.env
.env.local
.env*.local
dist/
build/
.DS_Store
*.log
EOF
echo "✅ .gitignore creato"

# Inizializza Git
echo "📦 Inizializzando Git repository..."
if [ ! -d ".git" ]; then
  git init
  git add .
  git commit -m "Initial commit: GDPR Dashboard with login + Turnstile + Netlify"
  git branch -M main
  echo "✅ Git repository inizializzato"
else
  echo "ℹ️  Repository Git già esistente"
fi

# Mostra prossimi step
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup locale completato!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Prossimi step:"
echo ""
echo "1️⃣  Push su GitHub:"
echo "   git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "2️⃣  Connetti a Netlify:"
echo "   - Vai su https://app.netlify.com/start"
echo "   - Autorizza GitHub"
echo "   - Seleziona repo: $REPO_NAME"
echo "   - Build command: npm run build"
echo "   - Publish directory: public"
echo ""
echo "3️⃣  Imposta Environment Variables in Netlify:"
echo "   - TURNSTILE_SECRET = $TURNSTILE_SECRET"
echo "   - JWT_SECRET = $JWT_SECRET"
echo ""
echo "4️⃣  Deploy automatico quando piusti su main"
echo ""
echo "🌐 URL finale: https://$NETLIFY_DOMAIN.netlify.app/login.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup completato! Ora puoi fare il push su GitHub"
echo ""
