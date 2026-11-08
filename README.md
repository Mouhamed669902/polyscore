# PolyScore

Plateforme web des compétitions sportives de l'INP-HB : scores en direct, calendrier,
résultats et classements pour le football, le basketball, le volleyball et le handball.

**Version actuelle : front-end (HTML, CSS, JavaScript) avec des données de démonstration.**

## Lancer le projet

Ouvre `index.html` dans le navigateur, ou utilise l'extension **Live Server** de VS Code
(clic droit sur `index.html`, puis « Open with Live Server »).

## Structure

```
polyscore/
├── index.html       structure de la page
├── css/style.css    mise en forme, thème clair et sombre
├── js/data.js       données de démonstration (remplacées plus tard par une API)
├── js/main.js       affichage, filtres, classement calculé, direct simulé
├── fonts/           polices hébergées avec le site
└── images/          logos
```

## Charte graphique

Les couleurs viennent du logo de l'INP-HB : vert `#028d34`, orange `#f68100`, blanc.
Aucun noir dans la palette de marque. Codes à confirmer avec les références officielles.

## Prochaines étapes

1. Charger les matchs avec `fetch` depuis une API.
2. Back-end Node.js, Express et PostgreSQL.
3. Authentification des responsables et scores en direct réels.
