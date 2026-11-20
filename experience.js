/* Local demonstrations only: no location requests, tracking, account calls, or automatic sending. */
(() => {
  const menu = document.querySelector(".pc-menu");
  const nav = document.querySelector(".pc-nav");
  const closeMenu = () => {
    menu?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-label", "Ouvrir le menu");
    nav?.classList.remove("is-open");
  };
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("is-open", open);
  });
  nav
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  matchMedia("(min-width: 801px)").addEventListener("change", closeMenu);
  if (!document.querySelector(".pc-hero")) return;

  const setText = (id, text) => {
    document.getElementById(id).textContent = text;
  };
  const journeys = {
    before: {
      label: "LE DÉPART SE PRÉPARE",
      title: "L’esprit tranquille, avant le premier pas.",
      description:
        "Consultez la saison, vérifiez vos documents et préparez votre équipement. La météo et votre heure de retour complètent le programme.",
      features: [
        "Calendrier par espèce et heures du soleil",
        "Permis, assurance et rappels d’expiration",
        "Liste de préparation et heure de retour",
      ],
      image: "season",
      alt: "Écran Saison de Chasseur : calendrier des espèces et heures du soleil.",
      caption: "La saison, lisible en un coup d’œil.",
      visual: "AVANT LE DÉPART",
    },
    during: {
      label: "AU CŒUR DU TERRAIN",
      title: "Savoir où vous êtes. Garder vos repères.",
      description:
        "Lisez le statut du territoire, activez sa surveillance et enregistrez votre parcours. Retrouvez votre voiture et gardez votre contact d’urgence à portée de main.",
      features: [
        "Territoires, lots et réserves sur la carte",
        "Surveillance et alertes de sortie confirmée",
        "Trace du jour, repères et position de la voiture",
      ],
      image: "map",
      alt: "Écran Carte de Chasseur : zones colorées, position et statut du territoire.",
      caption: "Votre position, replacée dans son territoire.",
      visual: "PENDANT LA SORTIE",
    },
    after: {
      label: "LA SORTIE DEVIENT UN SOUVENIR",
      title: "Votre journée s’achève. Votre carnet s’enrichit.",
      description:
        "Notez vos prises avec une photo, une position et quelques mots. Retrouvez les statistiques de votre saison et exportez votre carnet en PDF.",
      features: [
        "Prises, notes et photos dans le carnet",
        "Bilan de la saison et historique des sorties",
        "Export PDF à conserver ou à partager",
      ],
      image: "logbook",
      alt: "Écran Carnet de Chasseur : prises et statistiques de la saison.",
      caption: "Un carnet personnel, conservé sur votre iPhone.",
      visual: "APRÈS LA SORTIE",
    },
  };
  let selectedJourney = "before";
  const isDark = () =>
    document.documentElement.dataset.theme === "dark" ||
    (!document.documentElement.dataset.theme &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  function updateImage() {
    const data = journeys[selectedJourney];
    document.getElementById("journey-image").src =
      `assets/img/screen-${data.image}${isDark() ? "-dark" : ""}.webp`;
  }
  function chooseJourney(key) {
    const data = journeys[key];
    if (!data) return;
    selectedJourney = key;
    document.querySelectorAll("[data-journey]").forEach((button) => {
      const active = button.dataset.journey === key;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document
      .getElementById("journey-panel")
      .setAttribute("aria-labelledby", `tab-${key}`);
    setText("journey-label", data.label);
    setText("journey-title", data.title);
    setText("journey-description", data.description);
    setText("journey-caption", data.caption);
    setText("journey-visual-label", data.visual);
    const list = document.getElementById("journey-features");
    list.replaceChildren(
      ...data.features.map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      }),
    );
    document.getElementById("journey-image").alt = data.alt;
    document.getElementById("prep-demo").hidden = key !== "before";
    updateImage();
  }
  const tabs = [...document.querySelectorAll("[data-journey]")];
  tabs.forEach((button, index) => {
    button.addEventListener("click", () =>
      chooseJourney(button.dataset.journey),
    );
    button.addEventListener("keydown", (e) => {
      let next;
      if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (e.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[next].focus();
      chooseJourney(tabs[next].dataset.journey);
    });
  });
  new MutationObserver(updateImage).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    updateImage,
  );
  updateImage();
  document.querySelectorAll("#prep-demo input").forEach((input) =>
    input.addEventListener("change", () => {
      const count = document.querySelectorAll(
        "#prep-demo input:checked",
      ).length;
      setText(
        "check-progress",
        count === 3 ? "3 / 3 · Prêt à préparer la suite" : `${count} / 3`,
      );
    }),
  );
  const zones = {
    association: {
      kicker: "LOT D’ASSOCIATION",
      title: "Un terrain réservé aux adhérents.",
      description:
        "Le lot est loué à une association. L’accès suppose l’adhésion et les autorisations nécessaires, en respectant la saison.",
      count: "1 550",
      label: "lots d’association dans le plan",
    },
    reserve: {
      kicker: "RÉSERVES PERMANENTES ET TRIENNALES",
      title: "Une zone à respecter.",
      description:
        "Les réserves permanentes sont fermées à la chasse. Les réserves triennales suivent leur période de rotation. L’application distingue les deux catégories.",
      count: "353",
      label: "223 permanentes et 130 triennales",
    },
    company: {
      kicker: "LOT DE SOCIÉTÉ",
      title: "Un accès encadré par le gestionnaire.",
      description:
        "Le lot est loué à une société. L’adhésion et les autorisations nécessaires restent à vérifier auprès de son gestionnaire, avec les règles de saison.",
      count: "266",
      label: "lots de société dans le plan",
    },
    other: {
      kicker: "LES AUTRES CATÉGORIES",
      title: "Un statut à vérifier sur place.",
      description:
        "Lots provinciaux, immeubles ruraux et lots didactiques ont leurs propres conditions. Consultez le gestionnaire et les dispositions applicables avant votre sortie.",
      count: "77",
      label: "48 provinciaux · 17 ruraux · 12 didactiques",
    },
  };
  document.querySelectorAll("[data-map-zone]").forEach((button) =>
    button.addEventListener("click", () => {
      const key = button.dataset.mapZone,
        data = zones[key];
      document
        .querySelectorAll("[data-map-zone]")
        .forEach((b) =>
          b.setAttribute("aria-pressed", String(b.dataset.mapZone === key)),
        );
      document.querySelector(".pc-map-canvas").dataset.zone = key;
      setText("zone-kicker", data.kicker);
      setText("zone-title", data.title);
      setText("zone-description", data.description);
      setText("zone-count", data.count);
      setText("zone-count-label", data.label);
    }),
  );
  const species = {
    partridge: [
      "La perdrix",
      "Illustration d’une perdrix",
      "Retrouvez sa période de chasse, les jours autorisés et la limite quotidienne, puis notez vos prises dans le carnet.",
    ],
    hare: [
      "Le lièvre",
      "Illustration d’un lièvre",
      "Consultez les dates de sa saison et sa limite quotidienne. Le carnet vous aide à suivre les prises de votre journée.",
    ],
    boar: [
      "Le sanglier",
      "Illustration d’un sanglier",
      "Le calendrier présente ses conditions particulières, notamment la chasse en battue organisée. Préparez participants et consignes dans les outils de sortie.",
    ],
    quail: [
      "La caille",
      "Illustration d’une caille",
      "La saison peut varier selon la région. L’application distingue les zones concernées pour présenter le calendrier correspondant.",
    ],
    dove: [
      "La tourterelle",
      "Illustration d’une tourterelle",
      "Retrouvez sa saison estivale et ses jours spécifiques dans le calendrier, avec les heures de lever et de coucher du soleil.",
    ],
    duck: [
      "Le gibier d’eau",
      "Illustration d’un canard",
      "Consultez la période et les limites du groupe dans la saison. Votre carnet conserve les prises que vous choisissez d’enregistrer.",
    ],
  };
  Object.assign(species, {
    rabbit: ["Le lapin", "Illustration d’un lapin", "Retrouvez les informations de saison du lapin et consignez vos prises dans votre carnet personnel."],
    pigeon: ["Le pigeon", "Illustration d’un pigeon", "Consultez le calendrier du pigeon dans l’application et gardez une trace de vos sorties dans le carnet."],
    thrush: ["La grive", "Illustration d’une grive", "Retrouvez la période de chasse et les limites applicables à la grive dans le calendrier de saison."]
  });
  document.querySelectorAll("[data-species]").forEach((button, index) =>
    button.addEventListener("click", () => {
      const key = button.dataset.species,
        data = species[key];
      document
        .querySelectorAll("[data-species]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      const img = document.getElementById("species-image");
      img.src = `assets/img/wildlife-${key}.webp`;
      img.alt = data[1];
      setText("species-name", data[0]);
      setText("species-description", data[2]);
      setText("species-index", `0${index + 1} / 09`);
    }),
  );
  document.querySelectorAll("[data-plan]").forEach((button) =>
    button.addEventListener("click", () => {
      const annual = button.dataset.plan === "annual";
      document
        .querySelectorAll("[data-plan]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      setText(
        "plan-label",
        annual
          ? "POUR SUIVRE TOUTE VOTRE SAISON"
          : "POUR AVANCER MOIS APRÈS MOIS",
      );
      setText(
        "plan-title",
        annual ? "Un an de terrain." : "Votre prochain mois.",
      );
      setText(
        "plan-description",
        annual
          ? "Un accès annuel à l’ensemble des fonctionnalités de Chasseur."
          : "Un accès mensuel aux mêmes fonctionnalités, renouvelé chaque mois.",
      );
    }),
  );
})();
