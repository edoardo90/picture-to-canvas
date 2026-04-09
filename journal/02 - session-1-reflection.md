# Session 1 — Reflection
_Data: 9 aprile 2026_

---

## Cosa ho fatto

Ho costruito da zero lo scaffolding di un progetto spec-first per Copilot.
Partendo da un'idea ("un'app per disegnatori che mappa punti da una foto a un foglio fisico"), senza scrivere una riga di codice applicativo, ho:

1. Definito e creato la struttura di cartelle `.github/` con instructions, agents, prompts
2. Scelto il tech stack (Vite + React + TypeScript + Vitest) e documentato il ragionamento
3. Scritto la prima spec reale (`project-setup.md`)
4. Implementato lo scaffolding dell'app attraverso il `developer` agent
5. Visto i test girare verdi (1 test, 628ms)
6. Identificato e corretto più volte debolezze nei file di configurazione degli agent

---

## Pro

**Lo spec-first forza chiarezza prima dell'azione.**
Scrivere la spec di `project-setup` mi ha obbligato a decidere esplicitamente cose che normalmente si fanno "per abitudine": struttura cartelle, quale test runner, cosa conta come "funzionante". Senza la spec, avrei solo fatto `npm create vite@latest` e basta — senza tracciare le decisioni.

**Il template delle spec è potente.**
Avere un formato fisso (Objective, AC, Out of Scope, NFR, Open Questions) ha impedito di scrivere spec vaghe. Il campo "Out of Scope" in particolare è sottovalutato: scrivere cosa una feature NON fa è spesso più utile di scrivere cosa fa, perché rimuove ambiguità e previene scope creep.

**I constraints espliciti degli agent funzionano.**
Aver scritto "DO NOT write application code" nel `requirements` agent, e "DO NOT modify spec content" nel `developer` agent, ha creato una separazione netta di responsabilità. Non è ovvio finché non lo si vede in pratica: senza quei constraint, un agent tende a fare "di più" di quello che gli è stato chiesto.

**Il `copilot-instructions.md` come livello zero è la scelta giusta.**
È il file sempre attivo. Tenerlo come puro indice — senza duplicare contenuto che sta altrove — è stata una decisione importante per prevenire il context rot. Ogni volta che ho aggiunto contenuto lì, ho poi rimosso e spostato nel file giusto.

**La Definition of Done è non negoziabile.**
Averla esplicita nella `spec-first-workflow.instructions.md`, con il punto "smoke test manuale dell'orchestrator", cambia il frame mentale: non è l'agent che dice "è fatto", sei tu che decidi. Questa distinzione sembrava piccola ma è fondamentale.

---

## Contro / Attenzioni

**Ho continuato a perfezionare invece di usare.**
Il consiglio più importante — "usalo il prima possibile" — l'ho dato io stesso e poi ho passato gran parte della sessione a raffinare i file. È un pattern facile da cadere: lo scaffolding sembra incompleto, quindi si aggiunge ancora qualcosa. Il rischio è non arrivare mai alla prima feature reale.

**I constraint degli agent sono stati scritti a freddo, non testati.**
So che `reviewer` ha `[read, search]` e non può scrivere file. Ma non ho ancora visto cosa succede quando un agent prova a violare un constraint — se lo rispetta, se lo ignora, o se chiede conferma. La vera validazione dei constraint avviene solo usandoli.

**Il gate di approvazione umana è concettualmente presente ma praticamente fragile.**
Ho aggiunto `approved-by`, `approved-date`, `open-questions-resolved` al frontmatter — ottima idea. Ma nella prima spec reale ho lasciato quei campi vuoti e ho approvato lo stesso. Non c'è nessun meccanismo che impedisce questo. Il workflow dipende dalla disciplina dell'orchestrator, non da una regola tecnica. È ok, ma va capito: la spec-first è un impegno culturale, non solo tecnico.

**5 AC è un limite utile ma artificiale.**
Per `project-setup` ho dovuto fare un trade-off (spostare il build check nei Notes per fare spazio ad AC-5). Ha funzionato, ma il limite di 5 è una euristica, non una legge. La domanda da porsi non è "sono 5 o 6?" ma "ogni AC è indipendentemente verificabile?". Se la risposta è sì, si splitta la spec. Se no, si consolida.

**Le vulnerabilità di sicurezza di `npm install` vanno ignorate o gestite.**
Install ha completato con "5 moderate severity vulnerabilities". Nel contesto di uno scaffolding iniziale con dipendenze popolari, questo è normale rumore — ma vale la pena sapere quando preoccuparsi e quando no: `npm audit` prima di ogni release, non prima di ogni install.

---

## Lesson Learned

### 1. La struttura `.github/` non è opzionale
Se metti gli agent o le instructions in cartelle diverse, VS Code non li trova. Non è configurabile. `.github/agents/*.agent.md`, `.github/instructions/*.instructions.md`, `.github/prompts/*.prompt.md` — questi path sono fissi.

### 2. `description` è la superficie di discovery degli agent
Se la description di un agent è vaga, l'agent non viene invocato quando dovrebbe. Le descrizioni devono contenere le parole chiave che un orchestrator userebbe per descrivere il task. "Use when defining a new feature, refining requirements, or creating a spec" è buona. "Helpful agent for project tasks" è inutile.

### 3. Il template delle spec è il contratto tra tutti gli agent
Se il template cambia, tutti gli agent che lo leggono (requirements, developer, reviewer, docs-updater) devono essere aggiornati di conseguenza. È il file più critico del progetto — non l'applicazione.

### 4. Separare CREATE da UPDATE
`requirements` crea spec, `docs-updater` le aggiorna. Sembra ovvio, ma senza questa separazione esplicita si creano sovrapposizioni: due agent che credono entrambi di poter modificare lo stesso file, con risultati imprevedibili.

### 5. Il `developer` agent ha bisogno di `execute` non solo per i test
Questa è stata una correzione in corso d'opera. Il constraint iniziale ("execute solo per i test") aveva senso in produzione matura, ma durante lo scaffolding blocca operazioni legittime come `npm install` e `npm create vite`. La regola corretta è: execute per install, build, scaffold, test — mai per operazioni destructive.

### 6. Il `journal/` è diverso da `docs/`
`docs/` è content stabile che gli agent leggono come reference. `journal/` è cronologico, personale, informale — note di lavoro. Tenerli separati previene che un agent legga le note personali come se fossero specifiche tecniche.

---

## Riflessioni sull'approccio spec-first

Lo spec-first non rallenta lo sviluppo: **rallenta i primi 20 minuti e accelera tutto il resto**.
Il valore non è nella spec in sé, ma nel processo di scriverla: ti costringe a fare domande che altrimenti faresti a metà implementazione. "Cosa si vede nel browser?" sembra banale fino a quando non lo scrivi come AC e realizzi che non l'hai mai deciso esplicitamente.

**La difficoltà reale non è scrivere la spec, è scrivere AC testabili.**
Un AC testabile risponde "sì" o "no" senza ambiguità. "L'app funziona bene" non è un AC. "Running `npm test` executes the unit test suite and all tests pass" è un AC. Questa distinzione richiede pratica — le prime spec avranno AC vaghi, ed è normale.

**L'AI amplifica sia la qualità che la vaghezza delle spec.**
Se scrivi una spec precisa, il developer agent produce codice preciso. Se scrivi una spec vaga, produce codice plausibile ma non quello che volevi. Lo spec-first con AI è come dare istruzioni a un contractor molto bravo ma molto letterale: quello che dici è quello che ottieni, nel bene e nel male.

---

## Spunti per le prossime sessioni

- **Completa il ciclo completo almeno una volta**: `@requirements` → approva → `@developer` → `@reviewer` → `@docs-updater`. Non fermarti prima.
- **Scegli una feature banale**: la prima feature reale deve essere così piccola che il workflow sia il soggetto, non la feature. Esempio: "caricare un'immagine e mostrarla a schermo".
- **Testa i constraint degli agent intenzionalmente**: chiedi al `reviewer` di modificare un file — vedi se il constraint regge. Questo ti insegnerà dove il workflow è robusto e dove è fragile.
- **Aggiorna le instructions quando scopri un pattern**: se un agent fa qualcosa di sbagliato ripetutamente, aggiungi un constraint esplicito invece di correggerlo ogni volta manualmente.
- **Ricordati del journal come strumento attivo**: prima di ogni step, scrivi cosa ti aspetti. Dopo, scrivi cosa è successo di diverso. Dopo 3-4 feature, avrai una mappa chiara dei tuoi punti di frizione con lo spec-first.

---

## In una frase

> Lo spec-first non è un processo per produrre documentazione — è un processo per rendere esplicite le decisioni che comunque prenderesti, ma in modo consapevole e tracciabile, prima che costino tempo.
