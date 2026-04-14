import "./style.css";
import "./nav.css";
import "./home.css";
import "./gites-chambres.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";
import { applyPageSeo, fetchLocalizedCollection, fetchLocalizedSingleton, fetchPageConfig, urlFor } from "./sanity.js";
import { t } from "./static-translations.js";
import { initSmoothScroll } from "./smooth-scroll.js";

initSmoothScroll();

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

// ── Filtres sidebar ──────────────────────────────────────────────────────────
const staysFilters = { type: "all", cap: null, equip: null };

const renderStays = () => {
  const listEl = document.getElementById("stays-list");
  const countEl = document.querySelector(".stays-count");
  if (!listEl) return;

  let filtered = allLogements.filter((l) => {
    if (staysFilters.type !== "all" && l.type !== staysFilters.type) return false;
    if (staysFilters.cap) {
      const max = l.capaciteMax ?? 0;
      const min = l.capaciteMin ?? 0;
      if (staysFilters.cap === "1-2" && max > 2) return false;
      if (staysFilters.cap === "3-6" && (max < 3 || min > 6)) return false;
      if (staysFilters.cap === "7+" && max < 7) return false;
    }
    if (staysFilters.equip) {
      if (staysFilters.equip === "cuisine" && !l.equipements?.includes("cuisine")) return false;
      if (staysFilters.equip === "petitdej" && !l.petitDejeuner) return false;
      if (staysFilters.equip === "terrasse" && !l.terrasse) return false;
    }
    return true;
  });

  if (countEl) {
    countEl.textContent = filtered.length
      ? `${filtered.length} hébergement${filtered.length > 1 ? "s" : ""} correspondent`
      : "";
  }

  if (filtered.length === 0) {
    listEl.innerHTML = '<p class="stays-empty">Aucun hébergement ne correspond à ces filtres.</p>';
    return;
  }

  listEl.innerHTML = filtered.map((l, i) => renderLogement(l, i % 2 !== 0)).join("");
  listEl.querySelectorAll("[data-carousel]").forEach(setupCardCarousel);
};

document.querySelectorAll("[data-filter-type]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-filter-type]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    staysFilters.type = btn.dataset.filterType;
    renderStays();
  });
});

document.querySelectorAll("[data-filter-cap]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wasActive = btn.classList.contains("is-active");
    document.querySelectorAll("[data-filter-cap]").forEach((b) => b.classList.remove("is-active"));
    staysFilters.cap = wasActive ? null : btn.dataset.filterCap;
    if (!wasActive) btn.classList.add("is-active");
    renderStays();
  });
});

document.querySelectorAll("[data-filter-equip]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wasActive = btn.classList.contains("is-active");
    document.querySelectorAll("[data-filter-equip]").forEach((b) => b.classList.remove("is-active"));
    staysFilters.equip = wasActive ? null : btn.dataset.filterEquip;
    if (!wasActive) btn.classList.add("is-active");
    renderStays();
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
let allLogements = [];

const ICONS = {
  wifi:          { src: assetUrl("/img/WIFI_ICON.png"),    alt: "WiFi" },
  tv:            { src: assetUrl("/img/TV_ICON.png"),      alt: "Télévision" },
  wc:            { src: assetUrl("/img/WC_ICON.png"),      alt: "WC" },
  douche:        { src: assetUrl("/img/DOUCHE_ICON.png"),  alt: "Douche" },
  cuisine:       { src: assetUrl("/img/KITCHEN_ICON.png"), alt: "Cuisine équipée" },
  cuisineCommune:{ src: assetUrl("/img/KITCHEN_ICON.png"), alt: "Cuisine commune" },
};

const renderCapacite = (min, max) => {
  if (min === max) return t("common.ui.maxPeople", { max });
  return t("common.ui.fromToPeople", { min, max });
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
        <button class="stay-arrow stay-arrow-prev" type="button" aria-label="${t("common.ui.previousImage")}">‹</button>
        <div class="stay-track">${imagesHtml}</div>
        <button class="stay-arrow stay-arrow-next" type="button" aria-label="${t("common.ui.nextImage")}">›</button>
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
          ${iconsHtml ? `<div class="stay-meta-label">${t("common.ui.amenities")}</div><div class="stay-icons">${iconsHtml}</div>` : ""}
          ${extras ? `<p class="stay-meta-extra">${extras}</p>` : ""}
        </div>
        <a class="btn stay-cta" data-booking-request-trigger href="#">${t("common.nav.book")}</a>
      </div>
      ${mediaHtml}
    </article>`;
};

const renderTemoignage = (testimonial) => {
  const stars = "★".repeat(testimonial.rating) + "☆".repeat(5 - testimonial.rating);
  return `
    <article class="testimonial-card">
      <div class="testimonial-meta">${testimonial.stayType || ""}</div>
      <strong>${testimonial.author}</strong>
      <p>"${testimonial.quote}"</p>
      <div class="testimonial-stars" aria-label="${t("common.testimonials.rating", { rating: testimonial.rating })}">${stars}</div>
    </article>`;
};

async function initSanityContent() {
  const track = document.querySelector(".testimonials-track");
  if (track) track.innerHTML = "";

  try {
    const [logements, temoignages, pageConfig] = await Promise.all([
      fetchLocalizedCollection("logement", { orderBy: "order asc" }),
      fetchLocalizedCollection("temoignage", { orderBy: "order asc" }),
      fetchPageConfig("gites-chambres"),
    ]);
    applyPageSeo(pageConfig);

    allLogements = logements;
    renderStays();

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

// ─── Grille tarifaire ────────────────────────────────────────────
const tarifModal   = document.getElementById("tarif-modal");
const tarifOverlay = document.getElementById("tarif-modal-overlay");
const tarifClose   = document.getElementById("tarif-modal-close");
const tarifBtn     = document.getElementById("tarif-btn-sticky");

const openTarifModal  = () => { tarifModal?.classList.add("is-open");    tarifModal?.removeAttribute("aria-hidden"); document.body.style.overflow = "hidden"; };
const closeTarifModal = () => { tarifModal?.classList.remove("is-open"); tarifModal?.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };

tarifBtn?.addEventListener("click", openTarifModal);
tarifOverlay?.addEventListener("click", closeTarifModal);
tarifClose?.addEventListener("click", closeTarifModal);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeTarifModal(); });

// Cacher le bouton quand le footer est visible
if (tarifBtn) {
  const footer = document.querySelector(".site-footer");
  if (footer) {
    const observer = new IntersectionObserver(
      ([entry]) => { tarifBtn.style.opacity = entry.isIntersecting ? "0" : "1"; tarifBtn.style.pointerEvents = entry.isIntersecting ? "none" : ""; },
      { threshold: 0 }
    );
    observer.observe(footer);
  }
}

async function initGrilleTarifaire() {
  try {
    const data = await fetchLocalizedSingleton("grilleTarifaire");
    if (!data) return;

    const titreEl = document.querySelector("[data-tarif-titre]");
    const noteEl  = document.querySelector("[data-tarif-note]");
    const thead   = document.querySelector("[data-tarif-thead]");
    const tbody   = document.querySelector("[data-tarif-tbody]");

    if (titreEl) titreEl.textContent = data.titre || "";
    if (noteEl)  { noteEl.textContent = data.note || ""; noteEl.hidden = !data.note; }

    const colonnes = data.colonnes || [];
    const lignes   = data.lignes   || [];

    if (thead) {
      thead.innerHTML = `<tr>
        <th></th>
        ${colonnes.map((c) => `<th>${c}</th>`).join("")}
      </tr>`;
    }

    if (tbody) {
      tbody.innerHTML = lignes.map((ligne) => `<tr>
        <td>${ligne.nom || ""}</td>
        ${(ligne.prix || []).map((p) => `<td>${p}</td>`).join("")}
      </tr>`).join("");
    }
  } catch (err) {
    console.error("Erreur grille tarifaire:", err);
  }
}

initGrilleTarifaire();

// Hash deep-link: #chambres préfiltres le type
const applyHashFilter = () => {
  const hash = (window.location.hash || "").replace("#", "").toLowerCase();
  if (hash === "chambres" || hash === "gite" || hash === "gites") {
    const type = hash === "chambres" ? "chambre" : "gite";
    staysFilters.type = type;
    document.querySelectorAll("[data-filter-type]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.filterType === type);
    });
    renderStays();
  }
};

applyHashFilter();
window.addEventListener("hashchange", applyHashFilter);
