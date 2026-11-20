// The bar's behaviour, after the app's GlassTabBar: the thumb springs to the active item, the active
// item follows the scroll, and on phones scrolling down folds the labels away.
(() => {
  const root = document.documentElement;
  root.classList.add("js");

  // Apparence, as in the app's Settings: Système follows the device, Clair and Sombre override it.
  // The choice lives in localStorage and on <html data-theme>; a script in the head applies it
  // before the first paint.
  const themes = ["system", "light", "dark"];
  const themeNames = { system: "Système", light: "Clair", dark: "Sombre" };
  const themeIcons = { system: "i-contrast", light: "i-sun", dark: "i-moon" };
  const themeColors = { light: "#f6f3eb", dark: "#0e1311" };
  const themeMetas = [...document.querySelectorAll('meta[name="theme-color"]')];
  themeMetas.forEach((meta) => (meta.dataset.system = meta.content));

  const storedTheme = () => {
    try {
      const value = localStorage.getItem("theme");
      return themes.includes(value) ? value : "system";
    } catch {
      return "system";
    }
  };

  const showTheme = (theme) => {
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    themeMetas.forEach((meta) => (meta.content = themeColors[theme] ?? meta.dataset.system));
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
    document.querySelectorAll(".segmented").forEach((group) => group.style.setProperty("--at", themes.indexOf(theme)));
    document.querySelectorAll("[data-theme-cycle]").forEach((button) => {
      const label = `Apparence : ${themeNames[theme]}`;
      button.setAttribute("aria-label", label);
      button.title = label;
      button.querySelector(".icon").className = `icon ${themeIcons[theme]}`;
    });
  };

  const chooseTheme = (theme) => {
    try {
      if (theme === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", theme);
    } catch {
      // Private browsing: the choice holds for this page only.
    }
    showTheme(theme);
  };

  let theme = storedTheme();
  showTheme(theme);
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => chooseTheme((theme = button.dataset.themeChoice)));
  });
  document.querySelectorAll("[data-theme-cycle]").forEach((button) => {
    button.addEventListener("click", () => chooseTheme((theme = themes[(themes.indexOf(theme) + 1) % themes.length])));
  });
  // Another tab changed it: follow.
  addEventListener("storage", (event) => {
    if (event.key === "theme" || event.key === null) showTheme((theme = storedTheme()));
  });

  const tabs = document.querySelector(".tabs");
  if (tabs) {
    const links = [...tabs.querySelectorAll("a")];
    const thumb = tabs.querySelector(".tabs__thumb");
    tabs.style.setProperty("--n", links.length);

    const placeThumb = () => {
      const index = links.findIndex((link) => link.hasAttribute("aria-current"));
      if (!thumb || index < 0) return tabs.classList.remove("is-ready");
      const active = links[index];
      // Phones place the thumb from the index (items share the row evenly, so it tracks the fold
      // frame by frame); wider screens use the measured item.
      tabs.style.setProperty("--at", index);
      tabs.style.setProperty("--x", `${active.offsetLeft}px`);
      tabs.style.setProperty("--w", `${active.offsetWidth}px`);
      tabs.classList.add("is-ready");
    };

    const select = (link) => {
      if (link.hasAttribute("aria-current")) return;
      links.forEach((other) => other.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "true");
      placeThumb();
    };

    placeThumb();
    addEventListener("resize", placeThumb);
    document.fonts?.ready.then(placeThumb);

    // The active item follows the section under the top third of the screen.
    if (tabs.hasAttribute("data-spy")) {
      const sections = links
        .map((link) => ({ link, target: document.querySelector(link.getAttribute("href")) }))
        .filter((entry) => entry.target);
      const spy = () => {
        const line = innerHeight * 0.35;
        let current = sections[0];
        for (const entry of sections) {
          if (entry.target.getBoundingClientRect().top <= line) current = entry;
        }
        if (scrollY < 80) current = sections[0];
        select(current.link);
      };
      addEventListener("scroll", spy, { passive: true });
      spy();
    }

    // Inside this distance from the top the labels always show; travel in one direction before the
    // bar changes, so a jittery thumb doesn't flicker it.
    const topZone = 24;
    const deadZone = 8;
    let anchor = scrollY;
    addEventListener("scroll", () => {
      const y = Math.max(0, scrollY);
      if (y <= topZone) {
        anchor = y;
        tabs.classList.remove("is-compact");
      } else if (y - anchor > deadZone) {
        anchor = y;
        tabs.classList.add("is-compact");
      } else if (y - anchor < -deadZone) {
        anchor = y;
        tabs.classList.remove("is-compact");
      }
    }, { passive: true });
  }

  // appear(): fade and lift in as each block reaches the screen.
  const blocks = document.querySelectorAll(".appear");
  if (!("IntersectionObserver" in window)) {
    blocks.forEach((block) => block.classList.add("is-in"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    blocks.forEach((block) => observer.observe(block));
  }
})();
