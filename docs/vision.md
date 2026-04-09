# Vision — get-to-canvas

> Questo documento è uno spazio libero per ragionare sul futuro dell'app.
> **Non è un contratto, non è uno spec, non è vincolante.**
> È una bussola personale.
>
> ⚠️ Agent scope: questo file è fuori scope per `requirements`, `developer`, `reviewer`, `docs-updater`.
> Solo il `brainstorming` agent (o una sessione libera con l'utente) può leggerlo.

---

## North Star

Un artista che disegna a mano libera da una foto di riferimento apre l'app, carica la foto, definisce il suo foglio reale, e con un tocco su qualsiasi punto della foto sa esattamente dove mettere la matita sul foglio. Nessun calcolo manuale, nessun righello, nessun errore di scala.

L'app funziona sul telefono appoggiato accanto al foglio. Non richiede connessione. È veloce, diretta, senza distrazioni.

---

## Feature future (brainstorming, non priorizzate)

### Flusso core
- **Paper setup**: l'utente inserisce le dimensioni del foglio (es. A4: 210 × 297 mm) e l'orientamento (portrait / landscape). Il sistema usa questi dati per mappare le coordinate.
- **Point placement**: l'utente tocca un punto sulla foto e vede le coordinate reali (es. "x: 145 mm, y: 203 mm dal bordo in alto a sinistra del foglio").
- **Coordinate display**: visualizzazione chiara e leggibile, anche con la luce della stanza. Forse numeri grandi, contrasto alto.
- **Multiple points**: posizionare più punti contemporaneamente, ognuno con un numero/lettera identificativo. Utile per strutturare il disegno in più passaggi (es. "prima segna i punti 1–5, poi disegna le curve").

### Miglioramenti UX
- **Zoom sulla foto**: per posizionare punti con precisione su dettagli piccoli.
- **Pan / scroll**: per navigare su foto grandi.
- **Undo last point**: rimuovere l'ultimo punto piazzato con un gesto o tasto.
- **Haptic feedback** (mobile): vibrazione leggera quando si conferma un punto.

### Persistenza e sessioni
- **Salvataggio sessione**: localStorage per non perdere i punti se si chiude per errore.
- **Esporta sessione**: scarica un JSON con foto (o solo il nome), dimensioni foglio e lista punti.
- **Importa sessione**: ricarica una sessione esportata.

### Condivisione e output
- **Esporta come immagine**: un'immagine della foto con i punti sovrapposti e le coordinate annotate, da stampare o condividere.
- **Lista punti**: una vista testuale con la lista ordinata dei punti (id, x, y) — da leggere mentre si disegna.

### Funzioni avanzate (ipotesi lontane)
- **Griglia di riferimento**: overlay opzionale di una griglia sul foglio e sulla foto per orientarsi meglio.
- **Linee guida**: connettere i punti con linee per costruire la struttura del disegno.
- **Fotocamera live**: invece di caricare una foto, usare la fotocamera in tempo reale (per scene dal vivo).
- **Calibrazione prospettica**: se la foto è scattata di sbieco, correggere la prospettiva prima di mappare.

---

## Vincoli che non cambiano
- Mobile-first: deve funzionare bene con il pollice
- Offline: nessun dato lascia il dispositivo
- Velocità: ogni interazione deve essere istantanea — nessun loader visibile per le operazioni core

---

## Domande aperte (senza risposta oggi)
- Quanto è grande il pubblico target? Solo illustratori, o anche architetti / designer?
- Ha senso una versione desktop con tablet support (Apple Pencil)?
- Vale la pena il PWA / installabile, o basta il browser?
- Il "foglio" è sempre rettangolare, o servirà supporto per formati irregolari (canvas circolare, sagome)?
