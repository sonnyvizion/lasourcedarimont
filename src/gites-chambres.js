import "./style.css";
import "./nav.css";
import "./home.css";
import "./gites-chambres.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";
import { client, urlFor } from "./sanity.js";

const BASE_URL = import.meta.env.BASE_URL || "/";
const assetUrl = (path) => `${BASE_URL}${path.replace(/^\/+/, "")}`;

const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const bodyEl = document.body;
const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu-inner .menu-link");

if (navToggle && mobileMenu) {
  mobileLinks.forEach((link) => {
    if (link.dataset.split === "true") return;
    const text = link.textContent || "";
    link.setAttribute("aria-label", text.trim());
    link.setAttribute("role", "text");
    link.innerHTML = text
      .split("")
      .map((char, index) => {
        const safe = char === " " ? "&nbsp;" : char;
        return `<span class="char" style="--char-i:${index}" aria-hidden="true">${safe}</span>`;
      })
      .join("");
    link.dataset.split = "true";
  });

  const closeMenu = () => {
    bodyEl.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  };

  const toggleMenu = () => {
    const isOpen = bodyEl.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  };

  navToggle.addEventListener("click", toggleMenu);
  mobileMenu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const bookingApi = initBookingRequest({
  triggersSelector: "[data-booking-request-trigger]",
});

// Handles booking triggers added dynamically by Sanity content
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-booking-request-trigger]")) {
    e.preventDefault();
    bookingApi?.openModal();
  }
});

const splitRevealLines = (el) => {
  const raw = (el.innerHTML || "").trim();
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  const parts = isMobile && el.tagName === "H2"
    ? [raw.replace(/<br\b[^>]*>/gi, " ").replace(/\s+/g, " ").trim()]
    : raw
        .split(/<br\b[^>]*>/gi)
        .map((p) => p.trim())
        .filter(Boolean);
  el.innerHTML = parts
    .map((part) => `<span class="line"><span class="line-inner">${part}</span></span>`)
    .join("");
};

const revealEls = document.querySelectorAll(".reveal-text");
if (revealEls.length) {
  revealEls.forEach(splitRevealLines);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.25 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

const switchButtons = document.querySelectorAll("[data-switch]");
const switchPanels = document.querySelectorAll("[data-panel]");

const setPanel = (target) => {
  switchButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-switch") === target;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  switchPanels.forEach((panel) => {
    panel.hidden = panel.getAttribute("data-panel") !== target;
  });
};

switchButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setPanel(btn.getAttribute("data-switch") || "gites");
  });
});

const setupCardCarousel = (root) => {
  const track = root.querySelector(".stay-track");
  const slides = root.querySelectorAll("img");
  const prev = root.querySelector(".stay-arrow-prev");
  const next = root.querySelector(".stay-arrow-next");
  if (!track || !slides.length || !prev || !next) return;

  let index = 0;
  const max = slides.length - 1;
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  prev.addEventListener("click", () => {
    index = index <= 0 ? max : index - 1;
    update();
  });

  next.addEventListener("click", () => {
    index = index >= max ? 0 : index + 1;
    update();
  });
};

// ─── Sanity content ───────────────────────────────────────────────────────────

const ICONS = {
  wifi:          { src: assetUrl("/img/WIFI_ICON.png"),    alt: "WiFi" },
  tv:            { src: assetUrl("/img/TV_ICON.png"),      alt: "Télévision" },
  wc:            { src: assetUrl("/img/WC_ICON.png"),      alt: "WC" },
  douche:        { src: assetUrl("/img/DOUCHE_ICON.png"),  alt: "Douche" },
  cuisine:       { src: assetUrl("/img/KITCHEN_ICON.png"), alt: "Cuisine équipée" },
  cuisineCommune:{ src: assetUrl("/img/KITCHEN_ICON.png"), alt: "Cuisine commune" },
};

const renderCapacite = (min, max) => {
  if (min === max) return `<strong>${max}</strong> personnes`;
  return `De <strong>${min} à ${max}</strong> personnes`;
};

const renderLogement = (logement, isReverse) => {
  const { name, subtitle, description, capaciteMin, capaciteMax, equipements = [], extras, images = [] } = logement;

  const iconsHtml = equipements
    .filter((e) => ICONS[e])
    .map((e) => `<img src="${ICONS[e].src}" alt="${ICONS[e].alt}" />`)
    .join("");

  const imagesHtml = images
    .map((img) => `<img src="${urlFor(img).width(900).url()}" alt="${img.alt || name}" loading="lazy" />`)
    .join("");

  const mediaHtml = images.length > 0
    ? `<div class="stay-media" data-carousel>
        <button class="stay-arrow stay-arrow-prev" type="button" aria-label="Image précédente">‹</button>
        <div class="stay-track">${imagesHtml}</div>
        <button class="stay-arrow stay-arrow-next" type="button" aria-label="Image suivante">›</button>
      </div>`
    : "";

  return `
    <article class="stay-card${isReverse ? " is-reverse" : ""}">
      <div class="stay-content">
        <h3 class="stay-title"><span>${name}</span></h3>
        ${subtitle ? `<p class="stay-subtitle">${subtitle}</p>` : ""}
        ${description ? `<p class="stay-description">${description}</p>` : ""}
        <div class="stay-meta">
          <div class="stay-meta-title">${renderCapacite(capaciteMin, capaciteMax)}</div>
          ${iconsHtml ? `<div class="stay-meta-label">Équipements</div><div class="stay-icons">${iconsHtml}</div>` : ""}
          ${extras ? `<p class="stay-meta-extra">${extras}</p>` : ""}
        </div>
        <a class="btn stay-cta" data-booking-request-trigger href="#">Je réserve</a>
      </div>
      ${mediaHtml}
    </article>`;
};

const renderTemoignage = (t) => {
  const stars = "★".repeat(t.rating) + "☆".repeat(5 - t.rating);
  return `
    <article class="testimonial-card">
      <div class="testimonial-meta">${t.stayType || ""}</div>
      <strong>${t.author}</strong>
      <p>"${t.quote}"</p>
      <div class="testimonial-stars" aria-label="${t.rating} sur 5">${stars}</div>
    </article>`;
};

async function initSanityContent() {
  const gitesPanel = document.querySelector('[data-panel="gites"]');
  const chambresPanel = document.querySelector('[data-panel="chambres"]');
  const track = document.querySelector(".testimonials-track");

  if (gitesPanel) gitesPanel.innerHTML = "";
  if (chambresPanel) chambresPanel.innerHTML = "";
  if (track) track.innerHTML = "";

  try {
    const [logements, temoignages] = await Promise.all([
      client.fetch(`*[_type == "logement"] | order(order asc)`),
      client.fetch(`*[_type == "temoignage"]`),
    ]);

    const gites = logements.filter((l) => l.type === "gite");
    const chambres = logements.filter((l) => l.type === "chambre");

    if (gitesPanel) gitesPanel.innerHTML = gites.map((l, i) => renderLogement(l, i % 2 !== 0)).join("");
    if (chambresPanel) chambresPanel.innerHTML = chambres.map((l, i) => renderLogement(l, i % 2 !== 0)).join("");

    document.querySelectorAll("[data-carousel]").forEach(setupCardCarousel);

    if (track) track.innerHTML = temoignages.map(renderTemoignage).join("");

    const slider = document.querySelector(".testimonials-slider");
    const prev = document.querySelector(".testimonials-prev");
    const next = document.querySelector(".testimonials-next");

    if (slider && track && prev && next) {
      const getStep = () => {
        const card = track.querySelector(".testimonial-card");
        if (!card) return 320;
        const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0") || 0;
        return card.getBoundingClientRect().width + gap;
      };
      prev.addEventListener("click", () => slider.scrollBy({ left: -getStep(), behavior: "smooth" }));
      next.addEventListener("click", () => slider.scrollBy({ left: getStep(), behavior: "smooth" }));
    }
  } catch (err) {
    console.error("Erreur Sanity:", err);
  }
}

initSanityContent();

const getPanelFromHash = () => {
  const hash = (window.location.hash || "").replace("#", "").toLowerCase();
  return hash === "chambres" ? "chambres" : "gites";
};

setPanel(getPanelFromHash());

window.addEventListener("hashchange", () => {
  setPanel(getPanelFromHash());
});
