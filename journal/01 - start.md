Il mio obiettivo è provare l'approccio spec-first e prendere familiarità con il context-engineering.
Come esempio creerò un'app per chi disegna a mano libera:
a partire da una foto, e dalle dimensioni di un foglio di carta, mi permette di mettere dei punti sulla foto e sapere dove si collocano sul foglio di carta.

Non devi sviluppare l'app ne provare a farlo, questo è solo il contesto per sapere di cosa sto parlando, voglio procedere per gradi a piccoli step.

Voglio che tu mi faccia un minimale scaffolding di un progetto pensato per essere spec-first con copilot

il progetto userà le instructions, che danno delle linee guida sul buon codice, architettura, principi agnostici all'applicazione.

Poi ci sarà una cartella docs con le specifiche funzionali (ora solo accennata)

E infine una cartella per gli agents:
uno per i requisiti funzionali, 
uno per la scrittura software e test
uno per la review del codice
uno che aggiorna la documentazione

Trova eventauli debolezze del mio approccio e guidami a realizzare questa cosa.
Ricorda che lo scopo numero uno è capire le best practice nel fare spec-first

--

un'altra cosa: 
voglio specificare che il testing è fondamentale, ci saranno unit test e e2e test,
per entrambi il NFR è la velocità (l'efficacia, sensatezza va da sé)

è importante definire queste cose ora o si possono aggiungere in seguito?

--
il senso della cartella "prompts" era salvare i prompt che sto dando ai vari agent (poi) e alla chat corrente (ora)
per riguardarli in futuro se dovessi rifare un'app simile a questa, 

Suggerisci pure la location e nome per una cartella del genere.

--

va bene. 
crea i file per quanto detto. 

--

trova eventuali debolezze di quanto fatto fin'ora, tieni conto il mio goal fondamentale: imparare spec-first e best practice varie da ai-engineer

--
sistemali e poi fai un riassunto

-- 
chiarisci il punto 5
-- 

che altri suggerimenti puoi darmi, in base ai prompt che ti ho dato fin'ora e a quello che voglio fare
ragiona in ottica 80/20

Risposta:

```
Ragionando sull'80/20: il 20% che dà l'80% del valore di apprendimento è uno solo.

La cosa più importante: usalo
Hai uno scaffolding solido. Il rischio adesso è continuare a perfezionarlo invece di usarlo. Tutto quello che scoprirai nelle prossime ore a usarlo ti insegnerà più di settimane a raffinarlo a freddo.

Prossima azione concreta: scegli la feature più piccola possibile dell'app (es. "inserire le dimensioni del foglio"), invoca @requirements, e percorri l'intero ciclo fino a @docs-updater. Non scegliere una feature normale — scegli la più banale, perché vuoi che il workflow sia il soggetto, non la feature.

Il vero skill gap dello spec-first: i criteri di accettazione testabili
Scrivere spec è facile. Scrivere AC che siano contemporaneamente:

verificabili (può un agent o un test dire con certezza se è soddisfatto?)
non ambigue (un developer e un reviewer leggono la stessa cosa?)
sufficientemente piccole (non AC-1 che nasconde tre requisiti diversi)
...è difficile. È la skill che probabilmente ti mancherà alla prima iterazione. Il segnale che stai sbagliando: il reviewer non riesce a dire ✅ o ❌ senza fare supposizioni.

Euristiche per quando scrivi gli AC col requirements agent:

Inizia sempre con "dato che... quando... allora..." anche se non usi formalmente Gherkin
Se un AC non può essere trasformato in un test case, è troppo vago
Se un AC descrive come invece di cosa, è troppo implementativo
Il journal: usalo come strumento di riflessione, non solo archivio
Prima di eseguire ogni step del workflow, scrivi nel journal cosa ti aspetti. Dopo, scrivi cosa è successo di diverso. Questo è il modo in cui il journal diventa uno strumento di apprendimento invece di un semplice log. Dopo 3-4 feature avrai un pattern chiarissimo su dove il workflow si inceppa per te nello specifico.

Cosa non fare (il 80% a basso rendimento)
Non aggiungere altri agenti o instructions prima di aver completato il ciclo almeno due volte
Non correggere i file che hai già finché non vedi il problema in pratica
Non aspettarti che gli agenti rispettino tutti i constraint al primo colpo — imparare a correggere un agente che devia è parte del curriculum
```

correggli gli errori che hai notato prima
-

Che linguaggi tecnologie consigli?

Deve essere qualcosa di semplice per un developer agent, qualcosa che sia popolare e che perciò sia largamente supportato.

Vorrei poter distribuire facilmente la mia app, su mac, non serve ci sia la versione mobile.

Potrebbe anche essere eseguita nel browser in un primo momento,
oppure meglio partire subito app?

Oppure stile electron?

--

e se voglio mandarlo a un amico per farglielo provare?
--
e se un domani voglio salvare dello stato dell'app?
Es. ultimo file aperto, dove ha messo i punti, che setting per il foglio fisico ha usato..? 
Cose così?

Se è browser-first non può salvare settings su disco, o sbaglio?

Aiutami a ragionare con te
--
fammi un breve recap di quanto detto

-

cosa serve docs/decisions/README.md ?  in che senso log decisioni?  chi lo consuma?  non è meglio metterlo in journal?

Inoltre:  immagina che farò 3 feature: significa  3 specs/<title-n>.md  ?

--

il rischio che vedo è che questi file .md crescano troppo, portanto a context rot.
Immagina 100 feature, e immagina come tenere conto di questo problema, non voglio che nessuno di questi .md esploda in grandezza, 
che strategia proponi?

--

esiste un posto dove scrivere queste "meta" decisioni?

_-

ok allora aggiorna i file .md con quanto detto,
incorpora anche la decisione dello stack tecnologico discussa prima

Ogni cosa nei file corretti e tenendo le dimensioni a bada per un uso ottimale degli agent / context e così via

--

in alternativa a netlify, perché magari non voglio pubblicarlo,
se lo mandassi con airdrop?
cosa gli mando? tutta la cartella dist?


** rileggo i file md e cerco di capire

--
Quando in output leggo "Report which acceptance.."
Si intende la creazione di un report (es md file) o solo che lo dirà in chat?

E cosa serve?

--

nei miei agents, chi ha il compito di "archiviare" le spec una volta "done"? 
e chi dice quando sono "done"?

quale è la best practice di spec-first?

--

credo che "da qualche parte" dovrebbe comparire la "definition of done", 
che almeno dovrebbe essere:
- soddisfa gli AC

--
credo che "da qualche parte" dovrebbe comparire la "definition of done", 
che almeno dovrebbe essere:
- soddisfa gli AC
- unit test e e2e passano

Che altro?  una prova a mano "mia"?  come mi riferisco a me stesso, secondo la letteratura? agent-manager?

>> risposta: principal o orchestrator

--

si, vorrei tu aggiunga la DOD, e inoltre correggi docs-updater per quanto detto prima