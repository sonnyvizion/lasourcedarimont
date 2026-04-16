import "./style.css";
import "./nav.css";
import "./home.css";
import "./nos-partenaires.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";
import { initTestimonialsSlider } from "./testimonials.js";
import { applyPageSeo, fetchLocalizedCollection, fetchLocalizedSingleton, fetchPageConfig, urlFor } from "./sanity.js";
import { t } from "./static-translations.js";
import { initSmoothScroll } from "./smooth-scroll.js";

initSmoothScroll();

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

initBookingRequest({
  triggersSelector: "[data-booking-request-trigger]"
});

const splitRevealLines = (el) => {
  const raw = (el.innerHTML || "").trim();
  const parts = raw
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPortableText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks.map((block) => {
    if (block._type !== "block" || !block.children) return "";
    return block.children.map((span) => {
      let text = span.text || "";
      if (span.marks?.includes("strong")) text = `<strong>${text}</strong>`;
      if (span.marks?.includes("em")) text = `<span class="semi-italic">${text}</span>`;
      return text;
    }).join("");
  }).join("<br />");
}

// ─── Sanity content ───────────────────────────────────────────────────────────

const CATEGORIE_LABELS = {
  bienEtre:      t("partners.categoryWellness"),
  outdoor:       "Outdoor",
  restauration:  t("partners.categoryDining"),
  famille:       t("partners.categoryFamily"),
  culture:       t("partners.categoryCulture"),
  autre:         t("partners.categoryOther"),
};

const renderPartenaireVedette = (p) => `
  <article class="partner-featured-card">
    ${p.image ? `<div class="partner-featured-media"><img src="${urlFor(p.image).width(800).url()}" alt="${p.name}" /></div>` : ""}
    <div class="partner-featured-content">
      <div class="partner-badge">${t("partners.featuredBadge")}</div>
      <h2>${p.name}</h2>
      ${p.distance ? `<p class="partner-distance">${p.distance}</p>` : ""}
      <p>${p.description || ""}</p>
      <div class="partner-offer-row">
        ${p.offre ? `<span class="partner-offer">${p.offre}</span>` : ""}
        ${p.siteWeb ? `<a class="btn partner-btn" href="${p.siteWeb}" target="_blank" rel="noopener">${t("partners.viewOffer")}</a>` : `<a class="btn partner-btn" href="#">${t("partners.viewOffer")}</a>`}
      </div>
    </div>
  </article>`;

const renderPartenaire = (p) => {
  const meta = [CATEGORIE_LABELS[p.categorie], p.distance].filter(Boolean).join(" · ");
  return `
    <article class="partner-card">
      ${p.image ? `<img class="partner-card-media" src="${urlFor(p.image).width(600).url()}" alt="${p.name}" loading="lazy" />` : ""}
      <div class="partner-card-body">
        <h3>${p.name}</h3>
        ${meta ? `<p class="partner-card-meta">${meta}</p>` : ""}
        ${p.description ? `<p>${p.description}</p>` : ""}
        ${p.offre ? `<span class="partner-offer">${p.offre}</span>` : ""}
      </div>
    </article>`;
};

async function initSanityContent() {
  const highlightWrap = document.querySelector(".partners-highlight .content-wrap");
  const grid = document.querySelector(".partners-grid");

  if (highlightWrap) highlightWrap.innerHTML = "";
  if (grid) grid.innerHTML = "";

  try {
    const [partenaires, pageConfig, partenairesPage] = await Promise.all([
      fetchLocalizedCollection("partenaire", { orderBy: "order asc" }),
      fetchPageConfig("nos-partenaires"),
      fetchLocalizedSingleton("partenairesPage"),
    ]);
    applyPageSeo(pageConfig);

    if (partenairesPage?.introLabel) {
      const el = document.querySelector(".partners-intro .label");
      if (el) el.textContent = partenairesPage.introLabel;
    }
    if (partenairesPage?.introTitre) {
      const el = document.querySelector(".partners-title");
      if (el) el.innerHTML = renderPortableText(partenairesPage.introTitre);
    }
    if (partenairesPage?.introLead) {
      const el = document.querySelector(".partners-lead");
      if (el) el.innerHTML = renderPortableText(partenairesPage.introLead);
    }

    const featured = partenaires.find((p) => p.isFeatured);
    const others = partenaires.filter((p) => !p.isFeatured);

    if (highlightWrap && featured) highlightWrap.innerHTML = renderPartenaireVedette(featured);
    if (grid) grid.innerHTML = others.map(renderPartenaire).join("");
  } catch (err) {
    console.error("Erreur Sanity:", err);
  }
}

initSanityContent();
initTestimonialsSlider();
