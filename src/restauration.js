import "./style.css";
import "./nav.css";
import "./home.css";
import "./restauration.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";
import { client, urlFor } from "./sanity.js";

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

const renderMenuFeatured = (f) => `
  <article class="menu-featured-card">
    ${f.image ? `<div class="menu-featured-media"><img src="${urlFor(f.image).width(800).url()}" alt="${f.name}" /></div>` : ""}
    <div class="menu-featured-content">
      ${f.badge ? `<div class="menu-badge">${f.badge}</div>` : ""}
      <h2>${f.name}</h2>
      ${f.service ? `<p class="menu-meta">${f.service}</p>` : ""}
      ${f.plats?.length ? `<ul class="menu-lines">${f.plats.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
      <div class="menu-featured-footer">
        ${f.prix ? `<span class="menu-price">${f.prix}</span>` : ""}
        <a class="btn menu-btn" data-booking-request-trigger href="#">Réserver ce menu</a>
      </div>
    </div>
  </article>`;

const renderFormule = (f) => `
  <article class="menu-card">
    ${f.image ? `<img src="${urlFor(f.image).width(600).url()}" alt="${f.name}" loading="lazy" />` : ""}
    <div class="menu-card-body">
      <h3>${f.name}</h3>
      ${f.description ? `<p>${f.description}</p>` : ""}
      ${f.prix ? `<span class="menu-price">${f.prix}</span>` : ""}
    </div>
  </article>`;

async function initSanityContent() {
  const featuredWrap = document.querySelector(".restauration-featured .content-wrap");
  const grid = document.querySelector(".menu-grid");

  if (featuredWrap) featuredWrap.innerHTML = "";
  if (grid) grid.innerHTML = "";

  try {
    const formules = await client.fetch(`*[_type == "formule"] | order(order asc)`);

    const featured = formules.find((f) => f.type === "featured");
    const standards = formules.filter((f) => f.type === "standard");

    if (featuredWrap && featured) featuredWrap.innerHTML = renderMenuFeatured(featured);
    if (grid) grid.innerHTML = standards.map(renderFormule).join("");
  } catch (err) {
    console.error("Erreur Sanity:", err);
  }
}

initSanityContent();
