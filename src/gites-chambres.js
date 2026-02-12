import "./style.css";
import "./nav.css";
import "./home.css";
import "./gites-chambres.css";

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

document.querySelectorAll("[data-carousel]").forEach(setupCardCarousel);

const testimonialsSlider = document.querySelector(".testimonials-slider");
const testimonialsTrack = document.querySelector(".testimonials-track");
const testimonialsPrev = document.querySelector(".testimonials-prev");
const testimonialsNext = document.querySelector(".testimonials-next");

if (testimonialsSlider && testimonialsTrack && testimonialsPrev && testimonialsNext) {
  const getStep = () => {
    const card = testimonialsTrack.querySelector(".testimonial-card");
    if (!card) return 320;
    const style = window.getComputedStyle(testimonialsTrack);
    const gap = Number.parseFloat(style.columnGap || style.gap || "0") || 0;
    return card.getBoundingClientRect().width + gap;
  };

  testimonialsPrev.addEventListener("click", () => {
    testimonialsSlider.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  testimonialsNext.addEventListener("click", () => {
    testimonialsSlider.scrollBy({ left: getStep(), behavior: "smooth" });
  });
}

setPanel("gites");
