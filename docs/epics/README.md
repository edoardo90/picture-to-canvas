# Epic Backlog

> Panoramica delle feature ad alto livello. Non sono spec — sono candidati a diventarlo.
> Per creare uno spec da un epic, invoca il `requirements` agent.
>
> ⚠️ Agent scope: questo file è fuori scope per `requirements`, `developer`, `reviewer`, `docs-updater`.

## Epics

| # | Epic | Descrizione breve | Dipende da | Stato |
|---|------|-------------------|------------|-------|
| E-1 | Load picture | Carica e visualizza una foto di riferimento | — | ✅ done |
| E-2 | Paper setup | Inserisce dimensioni foglio reale (larghezza × altezza, unità) | E-1 | done |
| E-3 | Point placement | Tocca un punto sulla foto → ottiene coordinate reali sul foglio | E-1, E-2 | done |
| E-4 | Coordinate display | Mostra le coordinate in modo leggibile (numeri grandi, contrasto alto) | E-3 | done |
| E-5 | Multiple points | Piazza e gestisce più punti, ognuno con un ID | E-3 | done |
| E-11 | Make it possible to hide the toolbar, and make it appear again 
| E-6 | Zoom & pan | Naviga e ingrandisce la foto per posizionare punti con precisione | E-3 | backlog |
| E-7 | Undo last point | Rimuove l'ultimo punto piazzato | E-5 | backlog |
| E-8 | Session persistence | Salva sessione in localStorage | E-5 | backlog |
| E-9 | Export point list | Esporta lista punti come testo / JSON | E-5 | backlog |
| E-10 | Export as image | Esporta la foto annotata con punti e coordinate | E-5 | backlog |

## Note

- L'ordine suggerisce una priorità di massima, non è vincolante.
- Aggiorna questo file dopo ogni feature completata (cambia stato in ✅ done).
- Se un epic è troppo grande per uno spec singolo, spezzalo in sotto-epic prima di passare al `requirements` agent.
