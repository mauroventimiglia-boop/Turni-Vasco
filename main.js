// Funzione per caricare i turni dal backend Apps Script
window.caricaTurni = function caricaTurni() {
  const mese = document.getElementById('mese')?.value;
  const anno = document.getElementById('anno')?.value;
  const output = document.getElementById('output');
  if (!mese || !anno) {
    window.setFeedback('Seleziona mese e anno!', '#b80000', 3000);
    return;
  }
  if (output) {
    output.innerHTML = `<span style='color:#007bff;font-weight:bold;'>Caricamento turni in corso...</span>`;
  }
  fetch(`${APPSCRIPT_URL}?action=getTurniMese&mese=${encodeURIComponent(mese)}&anno=${encodeURIComponent(anno)}`)
    .then(r => r.json())
    .then(dati => {
      if (!dati.ok || !Array.isArray(dati.data) || dati.data.length === 0) {
        if (output) output.innerHTML = `<span style='color:#b80000;font-weight:bold;'>Nessun turno trovato per il mese selezionato.</span>`;
        return;
      }

      // Definisci gli operatori (puoi modificarli o recuperarli dinamicamente se necessario)
      const operatori = ["MACALUSO", "DINOLFO", "NAPOLI", "VENTIMIGLIA"];
      const opzioniTurno = ["", "Mattina", "Pomeriggio", "Notte"];

      let html = `<table class='table-container' style='margin:0 auto 1.5em auto;font-size:1.05em;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px #0001;'>`;
      html += `<tr style='background:#eaf2fa;color:#1a2a3a;'>`+
        `<th>Giorno</th>`;
      operatori.forEach(op => {
        html += `<th colspan='3'>${op}</th>`;
      });
      html += `</tr>`;
      html += `<tr style='background:#eaf2fa;color:#1a2a3a;'>`+
        `<th></th>`;
      operatori.forEach(() => {
        html += `<th>Mattina</th><th>Pomeriggio</th><th>Notte</th>`;
      });
      html += `</tr>`;

      dati.data.forEach(row => {
        html += `<tr style='background:#f7fafc;'>`+
          `<td>${row.giorno}</td>`;
        operatori.forEach((op) => {
          ["Mattina", "Pomeriggio", "Notte"].forEach((fascia) => {
            // Trova il turno assegnato per questo giorno, operatore e fascia
            let valoreTurno = "";
            if (row.turni && row.turni[op] && row.turni[op][fascia]) {
              valoreTurno = row.turni[op][fascia];
            }
            html += `<td><select name="turno_${row.giorno}_${op}_${fascia}" style="min-width:70px;">` +
              opzioniTurno.map(opt => `<option value='${opt}'${valoreTurno === opt ? ' selected' : ''}>${opt}</option>`).join("") +
            `</select></td>`;
          });
        });
        html += `</tr>`;
      });
      html += `</table>`;
      if (output) output.innerHTML = html;
    })
    .catch(err => {
      if (output) output.innerHTML = `<span style='color:#dc3545;font-weight:bold;'>Errore nel caricamento dei turni!<br>${err && err.message ? err.message : ''}</span>`;
    });
};
// Inserisci qui l'URL del tuo Google Apps Script pubblicato come Web App
// Esempio: https://script.google.com/macros/s/AKfycbw.../exec
// URL ufficiale della tua Web App Google Apps Script
const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbwzXGsfLWICNaQQRxXe11x-oYJPrr2Ok_jthCoHv0TEu_Xl6duVWpwmpSRVbe73MH5H7w/exec";
// --- Funzioni principali spostate da index.html ---

// Funzione di feedback centralizzato
window.setFeedback = function(msg, color = '#b80000', timeout = 2500) {
  const el = document.getElementById('feedback');
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
  if (timeout > 0) setTimeout(() => { el.textContent = ''; }, timeout);
};

// Funzione globale per generare la tabella progetto
window.generaTabellaProgetto = function generaTabellaProgetto(mese, anno) {
  let container = document.getElementById('reperibilita-container');
  if (!container) container = document.getElementById('preview-container');
  if (!container) {
    alert('Errore: nessun contenitore trovato per mostrare la tabella progetto!');
    console.error('[DEBUG generaTabellaProgetto] Nessun container trovato!');
    return;
  }
  container.innerHTML = `<p style="text-align:center;color:#007bff;font-weight:bold;">Generazione tabella progetto in corso...</p>`;
  setTimeout(() => {
    if (container.innerHTML.includes('Generazione tabella progetto in corso')) {
      container.innerHTML = `<span style='color:#dc3545;font-weight:bold;'>Nessun dato ricevuto dal server.<br>Verifica la connessione o contatta l'amministratore.</span>`;
    }
  }, 5000);
  fetch(APPSCRIPT_URL + '?action=getTabellaProgettoMese', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mese: Number(mese), anno: Number(anno) })
  })
  .then(r => r.json())
  .then(dati => {
    if (!Array.isArray(dati.data) || dati.data.length === 0) {
      container.innerHTML = `<p style='text-align:center;color:#b80000;font-weight:bold;'>Nessun progetto trovato per il mese selezionato.</p>`;
      return;
    }
    let html = `<h3 style='color:#176d1a;text-align:center;margin-bottom:0.2em;font-size:1.18em;'>PROGETTI VASCOLARI MESE ${('0'+mese).slice(-2)}/${anno}</h3>`;
    html += `<div style='display:flex;justify-content:center;gap:18px;margin-bottom:1em;'>
      <button onclick="window.esportaProgettoPDF()" style="background:#b80000;color:#fff;padding:7px 18px;border:none;border-radius:4px;font-size:1em;cursor:pointer;">Esporta PDF</button>
      <button onclick="window.esportaProgettoExcel()" style="background:#176d1a;color:#fff;padding:7px 18px;border:none;border-radius:4px;font-size:1em;cursor:pointer;">Esporta Excel</button>
      <button onclick="window.chiudiTabellaProgetto()" style="background:#222;color:#fff;padding:7px 18px;border:none;border-radius:4px;font-size:1em;cursor:pointer;">Chiudi</button>
    </div>`;
    html += `<div style='overflow-x:auto;'><table id="tabella-progetto-stampabile" style='margin:0 auto 1.5em auto;font-size:1.05em;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px #0001;'>`;
    html += `<caption style='caption-side:top;padding:12px 0 8px 0;font-size:1.18em;font-weight:bold;color:#1a2a3a;background:#eaf2fa;border-radius:10px 10px 0 0;'>PROGETTI VASCOLARI MESE ${mese}/${anno}</caption>`;
    html += `<tr style='background:#eaf2fa;color:#1a2a3a;'>`
      +`<th style='padding:10px 0;min-width:120px;font-weight:bold;background:#f7fafc;'>TSRM</th>`
      +`<th style='min-width:110px;font-weight:bold;background:#f7fafc;'>Data</th>`
      +`<th style='min-width:90px;font-weight:bold;background:#f7fafc;'>Giorno</th>`
      +`<th style='min-width:90px;font-weight:bold;background:#f7fafc;'>Ora Entrata</th>`
      +`<th style='min-width:90px;font-weight:bold;background:#f7fafc;'>Ora Uscita</th>`
      +`<th style='min-width:80px;font-weight:bold;background:#f7fafc;'>Totale Ore</th>`
      +`</tr>`;
    dati.data.forEach(row => {
      let op = row.operatore;
      if (op && op.length <= 5) {
        const mappaNomi = { 'MACA':'MACALUSO', 'DINO':'DINOLFO', 'NAPO':'NAPOLI', 'VENTI':'VENTIMIGLIA', 'VENT':'VENTIMIGLIA' };
        const op4 = op.toUpperCase().substring(0,4);
        if (mappaNomi[op4]) op = mappaNomi[op4];
      }
      html += `<tr style='background:#f7fafc;'>`+
        `<td style='color:#1a2a3a;background:#f7fafc;'>${op}</td>`+
        `<td style='color:#1a2a3a;background:#f7fafc;'>${row.data}</td>`+
        `<td style='color:#1a2a3a;background:#f7fafc;'>${row.giornoSett}</td>`+
        `<td style='color:#1a2a3a;background:#f7fafc;'>${row.oraInizio}</td>`+
        `<td style='color:#1a2a3a;background:#f7fafc;'>${row.oraFine}</td>`+
        `<td style='color:#1a2a3a;background:#f7fafc;'>${row.totOre}</td>`+
      `</tr>`;
    });
    html += `</table></div>`;
    container.innerHTML = html;
  })
  .catch(err => {
    let msg = (err && err.message) ? err.message : '';
    container.innerHTML = `<span style='color:#dc3545;font-weight:bold;'>Errore nel caricamento dei dati progetto!<br>${msg}</span><br><span style='color:#888;'>Controlla i log Apps Script per dettagli.</span>`;
  });
};

// Stub globale per evitare ReferenceError se la funzione non è definita altrove
window.caricaListaArchivio = window.caricaListaArchivio || function(){};
if (!window.generaTabellaProgetto) {
  const btns = document.querySelectorAll('button[onclick*="generaTabellaProgetto"]');
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      alert('Funzione generaTabellaProgetto non disponibile!');
    });
  });
}

// --- Fine funzioni principali ---
// Tutto il codice JS che era fuori dai tag <script> va qui.
// Inserisci qui tutte le funzioni e la logica che prima era in chiaro nell'HTML.
// Esempio:

window.generaTabellaProgetto = function generaTabellaProgetto(mese, anno) {
  // ...tutta la funzione qui...
};

// ...inserire qui tutte le altre funzioni JS che erano fuori dal <script>...

// Stub globale per evitare ReferenceError se la funzione non è definita altrove
window.caricaListaArchivio = window.caricaListaArchivio || function(){};
if (!window.generaTabellaProgetto) {
  const btns = document.querySelectorAll('button[onclick*="generaTabellaProgetto"]');
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      alert('Funzione generaTabellaProgetto non disponibile!');
    });
  });
}

// ...altro codice JS...

