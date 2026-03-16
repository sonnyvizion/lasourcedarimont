import "./style.css";
import "./nav.css";
import "./home.css";
import "./restauration.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";
import { initTestimonialsSlider } from "./testimonials.js";
import { fetchLocalizedCollection, urlFor } from "./sanity.js";

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

// ─── Sanity content ───────────────────────────────────────────────────────────

const renderMenuFeatured = (f) => {
  const mediaHtml = f.image
    ? `<div class="menu-featured-media"><img src="${urlFor(f.image).width(900).url()}" alt="${f.name}" /></div>`
    : `<div class="menu-featured-media menu-featured-media--illu"><img src="${assetUrl("/img/illustrations/lapin_BEIGE.png")}" alt="" aria-hidden="true" /></div>`;

  return `
  <article class="menu-featured-card">
    ${mediaHtml}
    <div class="menu-featured-content">
      ${f.badge ? `<div class="menu-badge">${f.badge}</div>` : ""}
      <h2>${f.name}</h2>
      ${f.service ? `<p class="menu-meta">${f.service}</p>` : ""}
      ${f.plats?.length ? `<ul class="menu-lines">${f.plats.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
      <div class="menu-featured-footer">
        ${f.prix ? `<span class="menu-price">${f.prix}</span>` : ""}
        <a class="btn menu-btn" data-booking-request-trigger href="#">Réserver</a>
      </div>
    </div>
  </article>`;
};

const renderFormule = (f) => `
  <article class="menu-card">
    <div class="menu-card-body">
      ${f.badge ? `<div class="menu-badge">${f.badge}</div>` : ""}
      <h3>${f.name}</h3>
      ${f.service ? `<p class="menu-service">${f.service}</p>` : ""}
      ${f.plats?.length ? `<ul class="menu-items-list">${f.plats.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
      ${f.prix ? `<div class="menu-card-footer"><span class="menu-price">${f.prix}</span></div>` : ""}
    </div>
  </article>`;

async function initSanityContent() {
  const dejeunerFeaturedWrap = document.querySelector(".dejeuners-featured-wrap");
  const dejeunerGrid = document.querySelector(".dejeuners-grid");
  const repasGrid = document.querySelector(".repas-grid");

  if (dejeunerFeaturedWrap) dejeunerFeaturedWrap.innerHTML = "";
  if (dejeunerGrid) dejeunerGrid.innerHTML = "";
  if (repasGrid) repasGrid.innerHTML = "";

  try {
    const formules = await fetchLocalizedCollection("formule", { orderBy: "order asc" });

    const dejeuners = formules.filter((f) => f.categorie === "petitDejeuner");
    const repas = formules.filter((f) => f.categorie === "repas");

    const dejeunerFeatured = dejeuners.find((f) => f.type === "featured");
    const dejeunerStandards = dejeuners.filter((f) => f.type !== "featured");

    if (dejeunerGrid) dejeunerGrid.innerHTML = dejeunerStandards.map(renderFormule).join("");
    if (dejeunerFeaturedWrap && dejeunerFeatured) {
      dejeunerFeaturedWrap.innerHTML = renderMenuFeatured(dejeunerFeatured);
    }
    if (repasGrid) repasGrid.innerHTML = repas.map(renderFormule).join("");
  } catch (err) {
    console.error("Erreur Sanity:", err);
  }
}

initSanityContent();
initTestimonialsSlider();
