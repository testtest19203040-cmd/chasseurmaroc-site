// Landing page behaviour: appearance (Système / Clair / Sombre, as in the app's Settings), the
// phone menu, the Avant / Pendant / Après tabs and fade-ins. Measurement lives in analytics.js.
(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  const arabic = root.lang === "ar";

  // Appearance. A script in <head> applies the stored choice before the first paint.
  const themes = ["system", "light", "dark"];
  const names = arabic
    ? { system: "تلقائي", light: "فاتح", dark: "داكن" }
    : { system: "Système", light: "Clair", dark: "Sombre" };
  const icons = { system: "contrast", light: "sun", dark: "moon" };
  const stored = () => {
    try {
      const value = localStorage.getItem("theme");
      return themes.includes(value) ? value : "system";
    } catch {
      return "system";
    }
  };
  let theme = stored();
  const show = () => {
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-cycle]").forEach((button) => {
      const label = `${arabic ? "المظهر" : "Apparence"} : ${names[theme]}`;
      button.setAttribute("aria-label", label);
      button.title = label;
      button.innerHTML = `<i class="icon" style="--i:url(/assets/icons/${icons[theme]}.svg)" aria-hidden="true"></i>`;
    });
  };
  show();
  document.querySelectorAll("[data-theme-cycle]").forEach((button) =>
    button.addEventListener("click", () => {
      theme = themes[(themes.indexOf(theme) + 1) % themes.length];
      try {
        if (theme === "system") localStorage.removeItem("theme");
        else localStorage.setItem("theme", theme);
      } catch {
        // Private browsing: the choice holds for this page only.
      }
      show();
    }),
  );

  // A language picked by hand wins over the browser's: Vercel sends "/" to "/ar/" from this cookie
  // (vercel.json), and otherwise from Accept-Language.
  document.querySelectorAll("[data-language]").forEach((link) =>
    link.addEventListener("click", () => {
      document.cookie = `lang=${link.dataset.language}; path=/; max-age=31536000; samesite=lax`;
    }),
  );

  // Phone menu.
  const menu = document.querySelector(".menu");
  const links = document.getElementById("nav-links");
  if (menu && links) {
    const close = () => {
      links.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    };
    menu.addEventListener("click", () => {
      const open = !links.classList.contains("open");
      links.classList.toggle("open", open);
      menu.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (event) => event.target.closest("a") && close());
    addEventListener("keydown", (event) => event.key === "Escape" && close());
  }

  // Avant / Pendant / Après: one phone, three screens. Arrow keys move between tabs.
  const tabs = [...document.querySelectorAll("[data-step]")];
  const shot = document.querySelectorAll("[data-step-shot]");
  const select = (tab, focus) => {
    tabs.forEach((other) => {
      const on = other === tab;
      other.setAttribute("aria-selected", String(on));
      other.tabIndex = on ? 0 : -1;
    });
    shot.forEach((img) => {
      const dark = img.classList.contains("only-dark") ? "-dark" : "";
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = `/assets/img/screen-${tab.dataset.step}${dark}.webp`;
        img.alt = tab.dataset.alt;
        img.style.opacity = "1";
      }, 160);
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      select(tabs[(index + step + tabs.length) % tabs.length], true);
    });
  });

  // Phone download bar: shown once the hero's buttons are off screen, hidden again over the
  // closing download section so the two never sit on top of each other.
  const bars = document.querySelectorAll(".mobile-cta");
  const hero = document.querySelector(".hero-ctas");
  const closing = document.getElementById("telecharger");
  if (bars.length && hero && closing && "IntersectionObserver" in window) {
    const visible = new Map();
    const update = () => {
      const show = visible.size === 2 && !visible.get(hero) && !visible.get(closing);
      bars.forEach((bar) => bar.classList.toggle("show", show));
    };
    const watch = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting));
      update();
    });
    watch.observe(hero);
    watch.observe(closing);
  }

  // Fade-ins.
  const blocks = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return blocks.forEach((block) => block.classList.add("in"));
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }),
    { rootMargin: "0px 0px -8% 0px" },
  );
  blocks.forEach((block) => observer.observe(block));
})();
