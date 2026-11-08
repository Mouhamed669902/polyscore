/* ==========================================================================
   PolyScore : logique de la page
   Plan : 1 Outils  2 Rendu des matchs  3 Classement  4 Compétitions
          5 Tableau d'affichage (hero)  6 Démo du direct  7 Interface (thème, menu)
          8 Démarrage
   Les données (MATCHES, SCHOOLS...) viennent de data.js.
   ========================================================================== */

(() => {
  "use strict";

  /* ---------- 1. Outils ---------- */

  const STATUS_LABELS = {
    upcoming: "À venir",
    live: "En direct",
    finished: "Terminé",
    postponed: "Reporté",
    cancelled: "Annulé",
  };

  /* L'état de la page : tout ce qui peut changer à l'écran est ici. */
  const state = { view: "upcoming", sport: "all", school: "all" };

  const $ = (selector, root = document) => root.querySelector(selector);
  const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Crée un élément HTML. h("p", { class: "x" }, "texte", autreElement)
   * Les textes passent par append(), qui les traite comme du TEXTE et jamais comme du HTML :
   * c'est ce qui protège contre la faille XSS (voir le cours précédent sur innerHTML).
   */
  function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === false || value == null) continue;
      if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
    node.append(...children.flat().filter((child) => child !== false && child != null));
    return node;
  }

  /* Les éléments SVG demandent un "namespace" particulier pour être créés en JavaScript. */
  const SVG_NS = "http://www.w3.org/2000/svg";
  function sportIcon(id) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "sport-icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#icon-${id}`);
    svg.append(use);
    return svg;
  }

  const schoolName = (id) => SCHOOLS.find((school) => school.id === id)?.name ?? id;
  const sportLabel = (id) => SPORTS.find((sport) => sport.id === id)?.label ?? id;
  const competitionName = (id) => COMPETITIONS.find((c) => c.id === id)?.name ?? id;
  const matchById = (id) => MATCHES.find((match) => match.id === Number(id));
  const byDate = (a, b) => new Date(a.date) - new Date(b.date);

  /* Intl formate les dates selon la langue : pas besoin de tableaux de noms de mois. */
  const fmt = {
    weekday: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }),
    day: new Intl.DateTimeFormat("fr-FR", { day: "numeric" }),
    month: new Intl.DateTimeFormat("fr-FR", { month: "short" }),
    time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    long: new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
  };

  function relativeDay(date) {
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const days = Math.round((startOfDay(date) - startOfDay(new Date())) / 86_400_000);
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "demain";
    return `le ${fmt.long.format(date)}`;
  }

  function countdownText(date) {
    const minutes = Math.max(0, Math.round((new Date(date) - Date.now()) / 60_000));
    if (minutes < 60) return `Dans ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Dans ${hours} h ${String(minutes % 60).padStart(2, "0")}`;
    return `Dans ${Math.floor(hours / 24)} j ${hours % 24} h`;
  }

  /* ---------- 2. Matchs : filtres, onglets, liste ---------- */

  function visibleMatches() {
    const statuses = state.view === "upcoming" ? ["upcoming", "postponed", "cancelled"] : ["finished"];
    return MATCHES.filter((match) => statuses.includes(match.status))
      .filter((match) => state.sport === "all" || match.sport === state.sport)
      .filter((match) => state.school === "all" || match.home === state.school || match.away === state.school)
      .sort((a, b) => (state.view === "upcoming" ? byDate(a, b) : byDate(b, a)));
  }

  function teamAbbr(id) {
    return h("abbr", { title: schoolName(id) }, id);
  }

  function createMatchRow(match) {
    const date = new Date(match.date);
    const finished = match.status === "finished";
    const homeWon = finished && match.homeScore > match.awayScore;
    const awayWon = finished && match.awayScore > match.homeScore;

    const teamLine = (id, goals, isLoser) =>
      h(
        "p",
        { class: `team-line${isLoser ? " is-loser" : ""}` },
        teamAbbr(id),
        finished ? h("span", { class: "goals" }, String(goals)) : false
      );

    return h(
      "li",
      { class: "match" },
      h(
        "time",
        { class: "match-date", datetime: match.date },
        h("span", { class: "weekday" }, fmt.weekday.format(date)),
        h("span", { class: "day" }, fmt.day.format(date)),
        h("span", { class: "month" }, fmt.month.format(date))
      ),
      h(
        "div",
        { class: "team-lines" },
        teamLine(match.home, match.homeScore, awayWon),
        teamLine(match.away, match.awayScore, homeWon)
      ),
      h(
        "div",
        { class: "match-info" },
        finished ? false : h("span", { class: "kickoff" }, fmt.time.format(date)),
        h("span", { class: "sport-tag" }, sportIcon(match.sport), sportLabel(match.sport)),
        h("span", {}, competitionName(match.competition)),
        h("span", {}, match.venue),
        ["postponed", "cancelled"].includes(match.status)
          ? h("span", { class: "status-tag" }, STATUS_LABELS[match.status])
          : false
      )
    );
  }

  function renderMatches() {
    const list = visibleMatches();
    const container = $("#matches");

    if (list.length === 0) {
      container.replaceChildren(
        h(
          "li",
          { class: "empty-state" },
          h("strong", {}, "Aucun match ne correspond à ces filtres."),
          h("span", {}, "Choisis une autre discipline ou une autre école."),
          h("button", { class: "button-outline", type: "button", onclick: resetFilters }, "Réinitialiser les filtres")
        )
      );
    } else {
      container.replaceChildren(...list.map(createMatchRow));
    }

    $("#matches-status").textContent =
      list.length === 0 ? "Aucun match." : `${list.length} match${list.length > 1 ? "s" : ""} affiché${list.length > 1 ? "s" : ""}.`;
  }

  function renderTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
      const selected = tab.dataset.view === state.view;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected) $("#matches-panel").setAttribute("aria-labelledby", tab.id);
    });
  }

  /* Change l'état puis redessine. Si le navigateur le permet, la transition est animée. */
  function update(changes) {
    Object.assign(state, changes);
    const apply = () => {
      renderTabs();
      renderMatches();
    };
    if (document.startViewTransition && !prefersReducedMotion()) document.startViewTransition(apply);
    else apply();
  }

  function resetFilters() {
    $('.chips input[value="all"]').checked = true;
    $("#school-filter").value = "all";
    update({ sport: "all", school: "all" });
  }

  function buildFilters() {
    const chips = $(".chips");
    [{ id: "all", label: "Tous" }, ...SPORTS].forEach((option) => {
      chips.append(
        h(
          "label",
          { class: "chip" },
          h("input", { type: "radio", name: "sport", value: option.id, checked: option.id === state.sport }),
          sportIcon(option.id === "all" ? "all" : option.id),
          h("span", {}, option.label)
        )
      );
    });
    chips.addEventListener("change", (event) => update({ sport: event.target.value }));

    const select = $("#school-filter");
    SCHOOLS.forEach((school) => select.append(h("option", { value: school.id, title: school.name }, school.id)));
    select.addEventListener("change", () => update({ school: select.value }));

    const tablist = $(".tabs");
    const tabs = [...tablist.querySelectorAll(".tab")];
    tabs.forEach((tab) => tab.addEventListener("click", () => update({ view: tab.dataset.view })));
    /* Les flèches gauche/droite changent d'onglet, comme le veut la norme d'accessibilité. */
    tablist.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const current = tabs.findIndex((tab) => tab.dataset.view === state.view);
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(current + step + tabs.length) % tabs.length];
      next.focus();
      update({ view: next.dataset.view });
    });
  }

  /* ---------- 3. Classement (football, Inter-Écoles) ---------- */

  /**
   * Calcule le classement à partir des matchs terminés. Barème : 3 points la victoire,
   * 1 le nul. Départage : points, différence de buts, buts marqués, ordre alphabétique.
   * À confirmer avec le règlement officiel.
   */
  function computeStandings(sport, competition) {
    const table = new Map(
      SCHOOLS.map((school) => [
        school.id,
        { id: school.id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, form: [] },
      ])
    );

    MATCHES.filter((m) => m.status === "finished" && m.sport === sport && m.competition === competition)
      .sort(byDate)
      .forEach((match) => {
        const sides = [
          [table.get(match.home), match.homeScore, match.awayScore],
          [table.get(match.away), match.awayScore, match.homeScore],
        ];
        for (const [team, scored, conceded] of sides) {
          team.played += 1;
          team.gf += scored;
          team.ga += conceded;
          if (scored > conceded) {
            team.won += 1;
            team.points += 3;
            team.form.push("win");
          } else if (scored === conceded) {
            team.drawn += 1;
            team.points += 1;
            team.form.push("draw");
          } else {
            team.lost += 1;
            team.form.push("loss");
          }
        }
      });

    return [...table.values()]
      .filter((team) => team.played > 0)
      .sort(
        (a, b) =>
          b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || a.id.localeCompare(b.id)
      );
  }

  const FORM_LABELS = { win: "victoire", draw: "nul", loss: "défaite" };

  function renderStandings() {
    const rows = computeStandings("football", "ie").map((team, index) => {
      const diff = team.gf - team.ga;
      const last5 = team.form.slice(-5);
      const cell = (value, className) => h("td", { class: className || false }, String(value));

      return h(
        "tr",
        {},
        cell(index + 1, "pos"),
        h(
          "td",
          { class: "team" },
          h("abbr", { class: "team-sigle", title: schoolName(team.id) }, team.id),
          h("span", { class: "team-full" }, schoolName(team.id))
        ),
        cell(team.played),
        cell(team.won),
        cell(team.drawn),
        cell(team.lost),
        cell(team.gf, "col-extra"),
        cell(team.ga, "col-extra"),
        cell(diff > 0 ? `+${diff}` : diff),
        h(
          "td",
          { class: "col-form" },
          h(
            "span",
            { class: "form", role: "img", "aria-label": `Derniers matchs : ${last5.map((r) => FORM_LABELS[r]).join(", ")}` },
            ...last5.map((result) => h("i", { class: result }))
          )
        ),
        cell(team.points, "col-pts")
      );
    });
    $("#standings-body").replaceChildren(...rows);
  }

  /* ---------- 4. Compétitions ---------- */

  function renderCompetitions() {
    $("#competition-list").replaceChildren(
      ...COMPETITIONS.map((competition) => {
        const matches = MATCHES.filter((match) => match.competition === competition.id);
        const count = (status) => String(matches.filter((match) => match.status === status).length);
        return h(
          "article",
          { class: "competition" },
          h("h3", {}, competition.short),
          competition.short !== competition.name ? h("p", { class: "competition-name" }, competition.name) : false,
          h("p", {}, competition.description),
          h(
            "dl",
            {},
            h("div", {}, h("dt", {}, "Joués"), h("dd", {}, count("finished"))),
            h("div", {}, h("dt", {}, "À venir"), h("dd", {}, count("upcoming")))
          )
        );
      })
    );
  }

  /* ---------- 5. Tableau d'affichage (hero) ---------- */

  let heroRefs = null; /* éléments du hero qu'on met à jour sans tout reconstruire */

  function renderHero() {
    const board = $("#scoreboard");
    const live = MATCHES.filter((match) => match.status === "live");
    const next = MATCHES.filter((match) => match.status === "upcoming").sort(byDate)[0];
    const featured = live[0] ?? next;

    if (!featured) {
      board.replaceChildren(h("p", { class: "board-empty" }, "Aucun match programmé pour le moment."));
      return;
    }

    const isLive = featured.status === "live";
    const date = new Date(featured.date);
    const homeDigit = h("span", { class: "digit" }, String(featured.homeScore ?? 0));
    const awayDigit = h("span", { class: "digit" }, String(featured.awayScore ?? 0));
    const clock = h("span", { class: "sb-clock" }, isLive ? featured.clock : countdownText(date));

    const team = (id) =>
      h("div", { class: "sb-team" }, h("span", { class: "sb-code" }, id), h("span", { class: "sb-name" }, schoolName(id)));

    board.replaceChildren(
      h(
        "div",
        { class: "sb-head" },
        isLive
          ? h("span", { class: "badge badge-live" }, h("span", { class: "live-dot" }), "En direct")
          : h("span", { class: "badge badge-next" }, "Prochain match"),
        h("span", { class: "sb-meta" }, `${sportLabel(featured.sport)}, ${competitionName(featured.competition)}`),
        clock
      ),
      h(
        "div",
        { class: "sb-body" },
        team(featured.home),
        isLive
          ? h("div", { class: "sb-score", "aria-label": "Score" }, homeDigit, h("span", { class: "sb-sep" }, ":"), awayDigit)
          : h("span", { class: "sb-vs" }, "VS"),
        team(featured.away)
      ),
      h(
        "p",
        { class: "sb-foot" },
        `${featured.venue}. Coup d'envoi ${relativeDay(date)} à ${fmt.time.format(date)}.`
      )
    );

    heroRefs = { match: featured, isLive, homeDigit, awayDigit, clock, date };

    /* Les autres matchs en direct, en dessous du tableau */
    $("#live-others").replaceChildren(
      ...live.slice(1).map((match) =>
        h(
          "li",
          {},
          h("span", { class: "live-dot" }),
          sportIcon(match.sport),
          h("span", {}, match.home),
          h("span", { "data-live-score": match.id }, `${match.homeScore} – ${match.awayScore}`),
          h("span", {}, match.away),
          h("span", { class: "others-clock", "data-live-clock": match.id }, match.clock)
        )
      )
    );
  }

  /**
   * Change un chiffre ET rejoue l'animation de retournement.
   * Retirer puis remettre la classe ne suffit pas : le navigateur fusionne les deux changements.
   * Lire offsetWidth le force à calculer le style entre les deux ("reflow").
   */
  function setDigit(node, value) {
    const text = String(value);
    if (node.textContent === text) return;
    node.textContent = text;
    node.classList.remove("is-changing");
    void node.offsetWidth;
    node.classList.add("is-changing");
  }

  function updateLive() {
    if (heroRefs?.isLive) {
      setDigit(heroRefs.homeDigit, heroRefs.match.homeScore);
      setDigit(heroRefs.awayDigit, heroRefs.match.awayScore);
      heroRefs.clock.textContent = heroRefs.match.clock;
    }
    document.querySelectorAll("[data-live-score]").forEach((node) => {
      const match = matchById(node.dataset.liveScore);
      node.textContent = `${match.homeScore} – ${match.awayScore}`;
    });
    document.querySelectorAll("[data-live-clock]").forEach((node) => {
      node.textContent = matchById(node.dataset.liveClock).clock;
    });
  }

  /* ---------- 6. Démo du direct ---------- */

  /**
   * Simule des buts et des paniers pour montrer l'effet "temps réel".
   * Quand le serveur existera, ce bloc sera remplacé par une connexion réelle (SSE ou WebSocket) :
   * à chaque message reçu, on modifiera le match concerné puis on appellera updateLive().
   */
  function startDemoLive() {
    const liveMatches = MATCHES.filter((match) => match.status === "live");
    if (!DEMO_LIVE || liveMatches.length === 0) return;

    setInterval(() => {
      for (const match of liveMatches) {
        const side = Math.random() < 0.5 ? "homeScore" : "awayScore";
        if (match.sport === "football") {
          const minute = parseInt(match.clock, 10);
          if (minute < 90) match.clock = `${minute + 1}'`;
          if (Math.random() < 0.1) match[side] += 1;
        } else if (Math.random() < 0.5) {
          match[side] += Math.random() < 0.6 ? 2 : 3;
        }
      }
      updateLive();
    }, 5000);
  }

  /* ---------- 7. Interface : thème, menu, lien actif ---------- */

  function initTheme() {
    const button = $("#theme-toggle");
    const root = document.documentElement;
    const isDark = () =>
      root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const sync = () => button.setAttribute("aria-label", isDark() ? "Passer en mode clair" : "Passer en mode sombre");

    button.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("polyscore-theme", next);
      } catch (error) {
        /* stockage indisponible : le choix vaut pour cette visite seulement */
      }
      sync();
    });
    sync();
  }

  function initNav() {
    const toggle = $("#nav-toggle");
    const nav = $("#site-nav");
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  /* IntersectionObserver : surveille quelle section traverse le milieu de l'écran. */
  function initActiveLink() {
    const links = [...document.querySelectorAll(".site-nav a")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          links.forEach((link) => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((link) => {
      const section = $(link.getAttribute("href"));
      if (section) observer.observe(section);
    });
  }

  /* ---------- 8. Démarrage ---------- */

  initTheme();
  initNav();
  buildFilters();
  renderHero();
  renderTabs();
  renderMatches();
  renderStandings();
  renderCompetitions();
  initActiveLink();
  startDemoLive();

  /* Le compte à rebours du "prochain match" se rafraîchit chaque 30 secondes */
  setInterval(() => {
    if (heroRefs && !heroRefs.isLive) heroRefs.clock.textContent = countdownText(heroRefs.date);
  }, 30_000);
})();
