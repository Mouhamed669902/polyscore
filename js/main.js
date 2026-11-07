// Traduction des statuts internes en texte affiché
const STATUS_LABELS = {
  upcoming: "À venir",
  live: "En direct",
  finished: "Terminé",
  postponed: "Reporté",
  cancelled: "Annulé",
};

// Crée un élément HTML avec une classe et un texte
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// Transforme "2026-11-14T15:00" en "14 nov., 15:00"
function formatDate(isoString) {
  return new Date(isoString).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Construit la carte HTML d'un match
function createMatchCard(match) {
  const card = createElement("article", "match-card");

  card.appendChild(createElement("p", "match-status", STATUS_LABELS[match.status]));

  const middle =
    match.homeScore === null ? "vs" : `${match.homeScore} - ${match.awayScore}`;

  const teams = createElement("p", "match-teams");
  teams.append(
    createElement("span", "team", match.home),
    createElement("span", "score", middle),
    createElement("span", "team", match.away)
  );
  card.appendChild(teams);

  card.appendChild(
    createElement(
      "p",
      "match-info",
      `${match.sport} · ${match.competition} · ${formatDate(match.date)}`
    )
  );

  return card;
}

// Affiche une liste de matchs dans une section de la page
function renderMatches(sectionId, list, emptyMessage) {
  const section = document.querySelector(`#${sectionId}`);
  if (!section) return;

  // On retire les anciennes cartes (le titre h2 reste)
  section.querySelectorAll(".match-card, .empty-message").forEach((node) => node.remove());

  if (list.length === 0) {
    section.appendChild(createElement("p", "empty-message", emptyMessage));
    return;
  }

  list.forEach((match) => section.appendChild(createMatchCard(match)));
}

// Point d'entrée : on filtre les matchs par statut et on les affiche
renderMatches(
  "direct",
  matches.filter((match) => match.status === "live"),
  "Aucun match en direct pour le moment."
);
renderMatches(
  "calendrier",
  matches.filter((match) => match.status === "upcoming"),
  "Aucune rencontre programmée."
);
renderMatches(
  "resultats",
  matches.filter((match) => match.status === "finished"),
  "Aucun résultat pour le moment."
);