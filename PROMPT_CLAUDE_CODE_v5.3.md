# 📋 PROMPT CLAUDE CODE — DASHBOARD GDPR v5.3

## SEZIONE 1: PANORAMICA GENERALE

Ricreare un'**applicazione web GDPR Risk Assessment Dashboard** completa, standalone e senza difetti, seguendo le specifiche tecniche e funzionali descritte di seguito.

L'applicazione deve essere un **singolo file HTML5 autonomo** con JavaScript embedded, senza dipendenze esterne (eccetto per librerie CDN di public domain come html2pdf.js e xlsx.js).

**Scopo primario:** Permettere a SSI/Welmed (telemedicina multistructure) di autovalutare il proprio profilo di rischio GDPR attraverso un questionario di 37 domande, calcolare un Risk Score aggregato, e visualizzare una matrice dettagliata dei 9 rischi principali.

**Clienti finali:** Responsabile Operativo e IT Officer di Welmed

**Lingua:** Italiano

---

## SEZIONE 2: ARCHITETTURA E STRUTTURA

### 2.1 Tecnologie e Stack
```
- Frontend: HTML5, CSS3, JavaScript vanilla (ES6+)
- No framework: React, Vue, Angular — puro JavaScript
- Storage: localStorage (sessione browser, non persistente tra chiusure)
- Export: html2pdf.js v0.10.1 (CDN), xlsx.js v0.18.5 (CDN)
- Compatibilità: Chrome, Firefox, Safari, Edge (ultimi 3 anni)
```

### 2.2 Struttura File
```
Tipo: File singolo HTML (standalone)
Dimensione target: < 100 KB
Sezioni:
  - DOCTYPE HTML5
  - <head> con meta, title, <style> embedded
  - <body> con struttura UI
  - <script> con tutto il codice JavaScript
```

### 2.3 Architettura Dati

**Variabili globali essenziali:**
```javascript
let questionsData = [...];        // Array di 37 domande
let answers = {};                  // Object: {domandaId: "opzione_selezionata"}
const riskMapping = {...};         // Mapping rischi R1-R9 con baseline
let currentView = 'home';          // 'home', 'questions', 'certificate'
let currentSection = 0;            // Indice sezione corrente (0-7)
```

---

## SEZIONE 3: DATI E MAPPATURE

### 3.1 Le 37 Domande — Struttura

Ogni domanda ha questa struttura:
```javascript
{
  id: 'unique_id_lowercase_underscore',
  section: '4.N Nome Sezione',
  question: 'Testo della domanda (formale italiano)',
  type: 'binary' | 'frequenza' | 'temporalità' | 'stato' | 'allocazione' | 'provider' | 'informativo',
  options: ['Opzione1', 'Opzione2', 'Opzione3'],
  optionScores: {
    'Opzione1': 0,   // peso numerico (0, 1, 1.5, 2, 3)
    'Opzione2': 1.5,
    'Opzione3': 3
  } // oppure 'informativo' per domande senza peso
  risks: ['R1', 'R2']  // Array di rischi influenzati
}
```

### 3.2 Le 8 Sezioni

```
Sezione 0: 4.1 Registro dei Trattamenti (6 domande)
Sezione 1: 4.2 Informative agli Interessati (6 domande)
Sezione 2: 4.3 Trasferimenti Internazionali (2 domande)
Sezione 3: 4.4 Misure di Sicurezza (6 domande)
Sezione 4: 4.5 Contratti (4 domande)
Sezione 5: 4.6 Formazione (4 domande)
Sezione 6: 4.7 DPIA (4 domande)
Sezione 7: 4.8 NIS2 e AI Act (5 domande)
TOTALE: 37 domande
```

### 3.3 I 9 Rischi Mappati

```javascript
const riskMapping = {
  'R1': {
    name: 'Assenza Piano BC&DR / Disastro IT',
    baseProb: 2,  // probabilità baseline 1-4
    baseImpact: 4 // impatto baseline 1-4
  },
  'R2': {
    name: 'Registro Trattamenti obsoleto / incompleto',
    baseProb: 3,
    baseImpact: 3
  },
  'R3': {
    name: 'DPIA con piano d\'azione vuoto',
    baseProb: 3,
    baseImpact: 3
  },
  'R4': {
    name: 'Informativa piattaforma non aggiornata per AIDA',
    baseProb: 3,
    baseImpact: 3
  },
  'R5': {
    name: 'Assenza Registro Violazioni (art. 33 par. 5)',
    baseProb: 2,
    baseImpact: 2
  },
  'R6': {
    name: 'DPA AWS/Mailchimp non verificati',
    baseProb: 2,
    baseImpact: 3
  },
  'R7': {
    name: 'Formazione GDPR insufficiente (ultima 2020)',
    baseProb: 3,
    baseImpact: 2
  },
  'R8': {
    name: 'AI Act — classificazione AIDA incerta',
    baseProb: 2,
    baseImpact: 2.5
  },
  'R9': {
    name: 'Cookie Policy non conforme (Provvedimento Garante 2021)',
    baseProb: 2,
    baseImpact: 1.5
  }
};
```

### 3.4 Logica di Assegnazione Pesi

**REGOLA UNIVERSALE:**
- **Peso 0** = Risposta BUONA/POSITIVA → Mitiga il rischio (controllo implementato)
- **Peso 1-2** = Risposta PARZIALE/INTERMEDIA → Mitigazione incompleta
- **Peso 3** = Risposta CATTIVA/NEGATIVA → Non mitiga il rischio (controllo assente / fattore di rischio presente)

**FATTORI AGGRAVANTI** (la risposta "Sì" aumenta il rischio):
```
Q2: Nuovi trattamenti?              Sì=3, No=0
Q4: Modifiche finalità/modalità?    Sì sig=3, No=0
Q5: Nuovi fornitori?                Sì=3, No=0
Q6: Minori nel trattamento?         Sì<14=3, Sì14-18=2, No=0
Q14: Fornitori fuori UE?            Sì=3, No=0
Q33: Superi soglie NIS2?            Sì=3, No=0
Q35: AI decisionale?                Sì dec=3, Sì supp=1, No=0
```

**MISURE MITIGANTI** (la risposta "Sì" riduce il rischio):
```
Q3: Anonimizzazione avviata?        Sì=0, No=3
Q7-12: Informativa aggiornata?      Sì=0, No=3
Q13: DPF verificato?                Sì=0, No=3
Q15-20: Misure sicurezza?           Sì=0, No=3
Q21-24: Contratti/DPA?              Sì=0, No=3
Q25-28: Formazione GDPR?            Sì=0, No=3
Q29-32: DPIA completata?            Sì=0, No=3
Q34: Registrazione ACN?             Sì=0, No=3
Q37: Documentazione AI Act?         Sì=0, No=3
```

---

## SEZIONE 4: INTERFACCIA UTENTE

### 4.1 Viste Principali

L'applicazione ha 3 viste principali, naviga tramite `switchView(viewName)`:

#### Vista 1: HOME
```
Contenuti:
- Header: "GDPR Risk Assessment Dashboard — SSI/Welmed"
- Due bottoni principali:
  1. "Compila Questionario" → switchView('questions')
  2. "Carica da JSON" → file input (opzionale, per riprendere da sessione precedente)

Stile: Minimalista, intestazione blu (#0066cc), bottoni prominenti
```

#### Vista 2: QUESTIONS
```
Contenuti:
- Progress bar mostrante: "Domanda X di 37" (aggiornato in tempo reale)
- Bottoni sezione: 8 tab per le 8 sezioni (con numero domande)
- Pannello sezione corrente con tutte le domande della sezione
- Per ogni domanda:
  * Testo della domanda in bold
  * Bottoni opzioni (uno per ogni opzione)
  * Colore bottone riflette peso:
    - Verde (#00ff00 o #00b300): peso 0 (buono)
    - Giallo (#ffff00 o #ffcc00): peso 1-2 (medio)
    - Rosso (#ff0000 o #ff6666): peso 3 (cattivo)
  * Se domanda già risposta, bottone selezionato rimane evidente

- Pannello "Risk Parziale per Sezione":
  * Mostra i rischi associati alla sezione corrente
  * Per ogni rischio: ID, nome, score parziale
  * Score parziale si aggiorna in tempo reale mentre si rispondono domande

- Bottoni navigazione:
  * "Sezione Precedente" (disabilitato se sezione 0)
  * "Sezione Successiva" (disabilitato se ultima sezione)
  * "Visualizza Certificato" (attivo dopo aver risposto a tutte)

Stile: Tabulazione pulita, domande ben spaziateèd, colori chiari
```

#### Vista 3: CERTIFICATE
```
Contenuti:

1. Header certificato:
   - Titolo: "CERTIFICATO ANALISI DEL RISCHIO GDPR"
   - Cliente: "Soluzioni Salute Informatica S.r.l. (Welmed)"
   - Data: Data odierna formattato (es. "3 giugno 2026")

2. Risk Score Box:
   - Grande numero (0-100) dentro cerchio colorato
   - Colore in base al livello:
     * 0-30: Verde (#00b300) = BASSO
     * 30-50: Giallo (#ff9900) = MEDIO
     * 50-75: Arancione (#ff6600) = ALTO
     * 75-100: Rosso (#cc0000) = CRITICO
   - Testo livello sotto il numero
   - Raccomandazione breve in base al livello

3. Matrice Dettagliata Rischi:
   Tabella con colonne:
   - ID (R1-R9)
   - Nome rischio
   - Probabilità (1-4, con decimali)
   - Impatto (1-4, con decimali)
   - Score (0-100, colorato come sopra)

4. Legenda Interpretazione Punteggi:
   Spiegazione di cosa significano i pesi (0, 1-2, 3)

5. Tabella Tracciabilità Risposte:
   Colonne: ID Domanda | Sezione | Domanda | Risposta | Peso | Rischi Associati
   Righe: Tutte le 37 domande con le risposte date
   Righe senza risposta evidenziate in giallo

6. Matrice Tracciamento Scenari Rischio:
   Matrice interattiva:
   - Righe = Rischi (R1-R9)
   - Colonne = Domande (Q1-Q37)
   - Celle mostrano il peso della risposta per quel rischio
   - Colore celle:
     * Verde: peso 0 (mitiga)
     * Giallo: peso 1-2 (parziale)
     * Rosso: peso 3 (non mitiga)
     * Bianco: domanda non influenza rischio

7. Bottoni Export:
   - "Scarica PDF" → html2pdf.js
   - "Scarica Excel" → xlsx.js
   - "Torna Home" → switchView('home')

Stile: Professionale, tabelle ben formattate, colori di severity chiari
```

### 4.2 Componenti UI Ricorrenti

#### Bottone Opzione Risposta
```html
<button 
  onclick="selectOption('domandaId', 'opzione')"
  class="option-button"
  id="btn_domandaId_opzione"
  style="background: [colore in base a peso]"
>
  opzione
</button>
```

Comportamento:
- Clicco → marca come selezionato
- Aggiorna `answers['domandaId'] = 'opzione'`
- Ricalcola immediatamente i rischi parziali della sezione
- Aggiorna il progress bar
- Cambia stile del bottone (evidenza, bordo, colore)

---

## SEZIONE 5: LOGICA DI CALCOLO DEL RISCHIO

### 5.1 Formula di Calcolo

```
Per ogni rischio Ri:

1. BASELINE:
   prob_baseline = riskMapping[Ri].baseProb    (1-4)
   impact_baseline = riskMapping[Ri].baseImpact (1-4)

2. RACCOLTA PESI:
   Per ogni domanda Q che influenza Ri:
     peso_Q = questionsData[Q].optionScores[answers[Q]]
   weights = [peso_Q1, peso_Q2, ..., peso_Qn]
   
3. SCORE MEDIO:
   avg_weight = media(weights)   // 0-3
   norm = avg_weight / 3          // 0-1, dove 0=mitiga, 1=non mitiga
   
4. AGGIUSTAMENTO:
   prob = Math.max(1, prob_baseline * (1 - (1 - norm) * 0.4))
   // norm=0: prob *= 0.6 (scende)
   // norm=1: prob *= 1 (rimane)
   // norm=0.5: prob *= 0.8 (scende leggermente)
   
   impact = Math.max(1, impact_baseline * (1 - (1 - norm) * 0.3))
   // norm=0: impact *= 0.7 (scende)
   // norm=1: impact *= 1 (rimane)
   
5. CAP A 4:
   prob = Math.min(4, prob)
   impact = Math.min(4, impact)
   
6. NORMALIZZAZIONE A 0-100:
   normalized = Math.min(100, Math.round((prob * impact / 16) * 100))
   // Scala: 0-100
   // 1*1/16*100 = 6 (BASSO)
   // 2*2/16*100 = 25 (BASSO)
   // 3*3/16*100 = 56 (ALTO)
   // 4*4/16*100 = 100 (CRITICO)
```

### 5.2 Risk Score Aggregato

```javascript
function getOverallRiskScore() {
    const risks = calculateRisks();
    const allScores = Object.values(risks).map(r => r.normalized);
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
}
```

Risultato: 0-100, rappresenta il rischio medio dei 9 rischi

### 5.3 Interpretazione Score Aggregato

```
0-30:   BASSO — Conformità adeguata, monitoraggio periodico
30-50:  MEDIO — Interventi 60-90 giorni
50-75:  ALTO — Interventi 30-60 giorni
75-100: CRITICO — Interventi entro 15 giorni
```

---

## SEZIONE 6: FUNZIONI CRITICHE

### 6.1 calculateRisks()

```javascript
function calculateRisks() {
    // Ritorna un object: {R1: {probability, impact, normalized}, R2: {...}, ...}
    // Calcola per ogni rischio secondo la formula di cui in Sezione 5.1
    
    const risks = {};
    
    Object.keys(riskMapping).forEach(rid => {
        // Trova tutte le domande che influenzano questo rischio
        const affectingQuestions = questionsData.filter(q => q.risks.includes(rid));
        
        // Raccolta pesi dalle risposte
        const weights = affectingQuestions
            .map(q => {
                const ans = answers[q.id];
                if (!ans) return null; // Domanda non risposta
                if (q.optionScores === 'informativo') return null;
                return q.optionScores[ans] || 0;
            })
            .filter(w => w !== null);
        
        // Media pesi
        const avgWeight = weights.length > 0 
            ? weights.reduce((a, b) => a + b, 0) / weights.length
            : 1.5; // Default se nessuna risposta
        
        const norm = avgWeight / 3;
        
        // Aggiustamento baseline
        let prob = Math.max(1, riskMapping[rid].baseProb * (1 - (1 - norm) * 0.4));
        let impact = Math.max(1, riskMapping[rid].baseImpact * (1 - (1 - norm) * 0.3));
        
        prob = Math.min(4, prob);
        impact = Math.min(4, impact);
        
        const normalized = Math.min(100, Math.round((prob * impact / 16) * 100));
        
        risks[rid] = {
            probability: prob,
            impact: impact,
            normalized: normalized
        };
    });
    
    return risks;
}
```

### 6.2 selectOption(questionId, option)

```javascript
function selectOption(questionId, option) {
    // Marker come selezionato
    answers[questionId] = option;
    
    // Aggiorna visuale bottoni
    const allBtns = document.querySelectorAll(`button[id*="btn_${questionId}"]`);
    allBtns.forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`btn_${questionId}_${option}`).classList.add('selected');
    
    // Ricalcola e aggiorna UI
    updatePartialRisks();
    updateProgressBar();
}
```

### 6.3 renderAnswerTraceabilityTable()

```javascript
function renderAnswerTraceabilityTable() {
    let html = '<div class="table-container"><table><thead><tr>';
    html += '<th>ID</th><th>Sezione</th><th>Domanda</th><th>Risposta</th><th>Peso</th><th>Rischi</th>';
    html += '</tr></thead><tbody>';
    
    questionsData.forEach(q => {
        const ans = answers[q.id];
        const weight = (q.optionScores === 'informativo' || !ans) 
            ? '-' 
            : q.optionScores[ans];
        const risks = q.risks.join(', ');
        
        const rowStyle = !ans ? 'background: #fff3cd;' : '';
        html += `<tr style="${rowStyle}">`;
        html += `<td>${q.id}</td>`;
        html += `<td>${q.section}</td>`;
        html += `<td>${q.question}</td>`;
        html += `<td>${ans || 'Non risposto'}</td>`;
        html += `<td>${weight}</td>`;
        html += `<td>${risks}</td>`;
        html += `</tr>`;
    });
    
    html += '</tbody></table></div>';
    return html;
}
```

### 6.4 renderScenarioTrackingMatrix()

```javascript
function renderScenarioTrackingMatrix() {
    // Crea matrice: righe=rischi, colonne=domande
    // Ogni cella mostra il peso della risposta per quel rischio
    
    let html = '<div class="table-container"><table style="font-size: 11px;"><thead><tr>';
    html += '<th style="width: 150px;">Rischio</th>';
    
    questionsData.forEach(q => {
        html += `<th style="text-align: center;">${q.id}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    Object.keys(riskMapping).forEach(rid => {
        html += `<tr style="background: #f5f5f5;">`;
        html += `<td style="font-weight: 600;">${rid}</td>`;
        
        questionsData.forEach(q => {
            const influencesThisRisk = q.risks.includes(rid);
            let cellContent = '-';
            let cellStyle = 'text-align: center;';
            
            if (influencesThisRisk && answers[q.id]) {
                const weight = q.optionScores === 'informativo' 
                    ? 'INFO' 
                    : q.optionScores[answers[q.id]];
                cellContent = weight;
                
                if (weight === 0) cellStyle += 'background: #ccffcc; color: #006600;';
                else if (weight === 3) cellStyle += 'background: #ffcccc; color: #660000;';
                else if (weight >= 1.5) cellStyle += 'background: #ffe6cc;';
            } else if (influencesThisRisk && !answers[q.id]) {
                cellContent = '⚠️';
                cellStyle += 'background: #fff3cd;';
            }
            
            html += `<td style="${cellStyle}">${cellContent}</td>`;
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
}
```

### 6.5 switchView(viewName)

```javascript
function switchView(view) {
    // Nascondi tutte le viste
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('questionsView').style.display = 'none';
    document.getElementById('certificateView').style.display = 'none';
    
    // Mostra la vista richiesta
    document.getElementById(view + 'View').style.display = 'block';
    currentView = view;
    
    // Se è la vista del certificato, genera il certificato
    if (view === 'certificate') {
        renderCertificate();
    }
}
```

---

## SEZIONE 7: FEATURE E EXPORT

### 7.1 Export PDF

```javascript
function exportPDF() {
    const element = document.getElementById('certificateContent');
    const opt = {
        margin: 10,
        filename: 'SSI_GDPR_Risk_Assessment_' + new Date().toISOString().split('T')[0] + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
}

// Usa libreria: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
```

### 7.2 Export Excel

```javascript
function exportExcel() {
    const risks = calculateRisks();
    
    // Sheet 1: Matrice Rischi
    const riskData = [
        ['ID', 'Rischio', 'Probabilità', 'Impatto', 'Score', 'Livello'],
        ...Object.entries(risks).map(([rid, rdata]) => [
            rid,
            riskMapping[rid].name,
            rdata.probability.toFixed(1),
            rdata.impact.toFixed(1),
            rdata.normalized,
            rdata.normalized < 30 ? 'BASSO' : rdata.normalized < 50 ? 'MEDIO' : rdata.normalized < 75 ? 'ALTO' : 'CRITICO'
        ])
    ];
    
    // Sheet 2: Risposte
    const answerData = [
        ['ID Domanda', 'Sezione', 'Domanda', 'Risposta', 'Peso', 'Rischi'],
        ...questionsData.map(q => [
            q.id,
            q.section,
            q.question,
            answers[q.id] || 'Non risposto',
            q.optionScores === 'informativo' ? '-' : (q.optionScores[answers[q.id]] || '-'),
            q.risks.join('; ')
        ])
    ];
    
    // Crea workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(riskData), 'Rischi');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(answerData), 'Risposte');
    
    XLSX.writeFile(wb, 'SSI_GDPR_Risk_Assessment_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

// Usa libreria: <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js"></script>
```

---

## SEZIONE 8: VALIDAZIONE E ERROR HANDLING

### 8.1 Validazione Input

```javascript
function validateAnswer(questionId, option) {
    const q = questionsData.find(x => x.id === questionId);
    if (!q) return { valid: false, error: 'Domanda non trovata' };
    if (!q.options.includes(option)) return { valid: false, error: 'Opzione non valida' };
    return { valid: true };
}
```

### 8.2 Error Handling Globale

```javascript
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Errore non catturato:', msg);
    console.error('Stack:', error?.stack);
    alert('Si è verificato un errore nell\'applicazione. Consulta la console per i dettagli.');
    return false;
};

function safeCall(func, ...args) {
    try {
        return func(...args);
    } catch (err) {
        console.error('Errore in ' + func.name + ':', err.message);
        return null;
    }
}
```

### 8.3 Logging Diagnostico

```javascript
const DEBUG = true;

function log(...args) {
    if (DEBUG) console.log('[DASHBOARD]', ...args);
}

// Eseguito al caricamento:
window.addEventListener('load', () => {
    log('✅ Dashboard caricato');
    log('Domande:', questionsData.length);
    log('Rischi:', Object.keys(riskMapping).length);
});
```

---

## SEZIONE 9: CUSTOMIZZAZIONE E ESTENSIONI

### 9.1 Aggiungere una Nuova Domanda

```javascript
// Aggiungi a questionsData:
{
    id: 'new_question_id',
    section: '4.X Nome Sezione',
    question: 'Testo della nuova domanda?',
    type: 'binary',
    options: ['Sì', 'No'],
    optionScores: {'Sì': 0, 'No': 3},
    risks: ['R1', 'R5']
}

// Ricalcola automaticamente nella matrice scenari
```

### 9.2 Aggiungere un Nuovo Rischio

```javascript
// Aggiungi a riskMapping:
'R10': {
    name: 'Nome nuovo rischio',
    baseProb: 2,
    baseImpact: 3
}

// Aggiorna le domande per includerlo in risks[] dove rilevante
```

### 9.3 Personalizzazione Colori

```javascript
const COLORS = {
    BASSO: '#00b300',
    MEDIO: '#ff9900',
    ALTO: '#ff6600',
    CRITICO: '#cc0000',
    WEIGHT_0: '#ccffcc',
    WEIGHT_3: '#ffcccc',
    PRIMARY: '#0066cc'
};

// Usa nelle funzioni di rendering
```

---

## SEZIONE 10: DETTAGLI DI INTERFACCIA

### 10.1 Struttura HTML

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GDPR Risk Assessment — SSI/Welmed</title>
    <style>
        /* CSS embedded qui — responsive, mobile-first */
    </style>
</head>
<body>
    <div id="app">
        <div id="homeView"><!-- HOME VIEW --></div>
        <div id="questionsView" style="display:none;"><!-- QUESTIONS VIEW --></div>
        <div id="certificateView" style="display:none;">
            <div id="certificateContent"><!-- CERTIFICATE DINAMICO --></div>
        </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js"></script>
    <script>
        // Tutto il codice JavaScript qui
    </script>
</body>
</html>
```

### 10.2 CSS Key Classes

```css
.option-button { /* Bottone opzione */ }
.option-button.selected { /* Bottone selezionato */ }
.risk-box { /* Box rischio */ }
.matrix-table { /* Tabella matrice */ }
.score-circle { /* Cerchio score */ }
.section-tab { /* Tab sezione */ }
.progress-bar { /* Barra progresso */ }
.cert-header { /* Header certificato */ }
```

---

## SEZIONE 11: TESTING E VALIDAZIONE

### 11.1 Test Scenario 1: Tutte Risposte Buone
```
Input: Tutte le domande con peso 0
Output atteso: Risk Score ~11 (BASSO)
```

### 11.2 Test Scenario 2: Tutte Risposte Cattive
```
Input: Tutte le domande con peso 3
Output atteso: Risk Score ~50+ (ALTO/CRITICO)
```

### 11.3 Test Scenario 3: Misto
```
Input: 20 risposte buone, 17 cattive
Output atteso: Risk Score ~25-35 (BASSO/MEDIO)
```

---

## SEZIONE 12: CHECKLIST FINALE

Prima di consegnare, verificare:

- [ ] ✅ 37 domande caricate correttamente
- [ ] ✅ 9 rischi mappati con baseline corretto
- [ ] ✅ Pesi Q2, Q3, Q6, Q35 sono CORRETTI
- [ ] ✅ Formula di calcolo implementata secondo Sezione 5.1
- [ ] ✅ 3 viste funzionanti (Home, Questions, Certificate)
- [ ] ✅ Progress bar aggiornato in tempo reale
- [ ] ✅ Parziali rischi per sezione calcolati
- [ ] ✅ Matrice tracciabilità genera HTML corretto
- [ ] ✅ Matrice scenari genera HTML corretto
- [ ] ✅ Export PDF funzionante
- [ ] ✅ Export Excel funzionante
- [ ] ✅ Error handling implementato
- [ ] ✅ Logging diagnostico funzionante
- [ ] ✅ Responsivo su mobile
- [ ] ✅ Compatibile con Chrome, Firefox, Safari, Edge
- [ ] ✅ File singolo HTML senza dipendenze (eccetto CDN pubbliche)
- [ ] ✅ Nessun bug o incongruenze
- [ ] ✅ Interfaccia professionale in italiano

---

## SEZIONE 13: STRUTTURA DATI COMPLETA (DUMP)

**Includi nel file finale la completa struttura di:**
- `questionsData` con tutte le 37 domande
- `riskMapping` con i 9 rischi
- Tutte le funzioni critiche
- CSS completo e responsive
- HTML structure completa

---

## ISTRUZIONI FINALI PER CLAUDE CODE

1. **Ricrea il file HTML** seguendo esattamente le specifiche sopra
2. **Includi tutte le 37 domande** con i pesi CORRETTI
3. **Implementa la formula di calcolo** di Sezione 5.1 esattamente
4. **Crea le 3 viste** con layout professionale
5. **Implementa le funzioni** di Sezione 6
6. **Aggiungi gli export** PDF e Excel
7. **Testa con i 3 scenari** di Sezione 11
8. **Verifica la checklist** di Sezione 12
9. **Assicura che sia responsivo** e compatibile
10. **Ricrea il file come singolo HTML standalone** < 100 KB

**Il risultato deve essere identico a v5.3, senza errori né bug.**

---

**FINE PROMPT**
