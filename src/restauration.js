import "./style.css";
import "./nav.css";
import "./home.css";
import "./restauration.css";
import "./nav-lang-globe.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initBookingRequest } from "./booking-request.js";
import { initTestimonialsSlider } from "./testimonials.js";
import { applyHeroMedia, applyPageSeo, fetchLocalizedCollection, fetchLocalizedSingleton, fetchPageConfig, urlFor } from "./sanity.js";
import { initSmoothScroll } from "./smooth-scroll.js";

// Convertir PortableText en HTML
const renderPortableText = (blocks) => {
  if (!blocks?.length) return "";
  return blocks.map((block) => {
    if (block._type !== "block") return "";
    return (block.children || []).map((span) => {
      if (span._type === "break") return "<br />";
      let text = (span.text || "").replace(/\n/g, "<br />");
      const marks = span.marks || [];
      if (marks.includes("strong") && marks.includes("em")) return `<strong><span class="semi-italic">${text}</span></strong>`;
      if (marks.includes("strong")) return `<strong>${text}</strong>`;
      if (marks.includes("em")) return `<span class="semi-italic">${text}</span>`;
      return text;
    }).join("");
  }).join("<br />");
};

gsap.registerPlugin(ScrollTrigger);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = initSmoothScroll();
lenis?.on("scroll", ScrollTrigger.update);

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

const animateHeroBannerLabel = (force = false) => {
  const labels = Array.from(document.querySelectorAll(".hero-banner-label"));
  if (!labels.length) return;

  labels.forEach((label) => {
    const text = (label.textContent || "").replace(/\u00a0/g, " ").trim();
    if (!text.length) return;
    const alreadySplit = label.querySelector(".char");
    if (alreadySplit && label.dataset.splitText === text && !force) return;

    label.setAttribute("aria-label", text);
    label.setAttribute("role", "text");
    label.innerHTML = text
      .split(/(\s+)/)
      .map((token) => {
        if (token.trim() === "") return token;
        const chars = token
          .split("")
          .map((char) => `<span class="char" aria-hidden="true">${char}</span>`)
          .join("");
        return `<span style="display:inline-block;white-space:nowrap">${chars}</span>`;
      })
      .join("");
    label.dataset.splitText = text;
  });

  if (prefersReducedMotion) return;

  labels.forEach((label) => {
    const chars = label.querySelectorAll(".char");
    if (!chars.length) return;
    gsap.fromTo(
      chars,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: { each: 0.02, from: "start" }
      }
    );
  });
};

animateHeroBannerLabel();

if (!prefersReducedMotion) {
  const heroLead = document.querySelector(".hero-banner-lead");
  if (heroLead) {
    gsap.fromTo(
      heroLead,
      { opacity: 0, y: 14 },
      { opacity: 0.72, y: 0, duration: 0.9, ease: "power3.out", delay: 0.8 }
    );
  }
}

const headerEl = document.querySelector(".site-header");
const restaurationHero = document.querySelector(".restauration-hero");
const restaurationHeroMedia = document.querySelector(".restauration-hero-media");
const restaurationHeroContent = document.querySelector(".restauration-hero-wrap");
const restaurationVideoDesktop = document.querySelector(".restauration-hero-video-desktop");
const restaurationVideoMobile = document.querySelector(".restauration-hero-video-mobile");

if (headerEl && restaurationHero) {
  const updateHeaderTheme = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const trigger = Math.max(0, restaurationHero.offsetHeight - headerEl.offsetHeight - 20);
    headerEl.classList.toggle("is-solid", scrollY >= trigger);
  };

  updateHeaderTheme();
  window.addEventListener("scroll", updateHeaderTheme, { passive: true });
  window.addEventListener("resize", updateHeaderTheme);
}

if (restaurationHero) {
  const mobileQuery = window.matchMedia("(max-width: 980px)");
  const videos = [restaurationVideoDesktop, restaurationVideoMobile].filter(
    (video) => video instanceof HTMLVideoElement
  );
  let videoHasFinished = false;

  const freezeOnLastFrame = (video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    const applyFreeze = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        try {
          video.currentTime = Math.max(0, video.duration - 0.03);
        } catch {
          // noop
        }
      }
      video.pause();
    };

    if (video.readyState >= 1) {
      applyFreeze();
    } else {
      video.addEventListener("loadedmetadata", applyFreeze, { once: true });
      video.load();
    }
  };

  const showHeroImageFallback = () => {
    if (restaurationHero.classList.contains("is-video-fallback")) return;
    restaurationHero.classList.add("is-video-fallback");
    videos.forEach((video) => {
      video.pause();
    });
  };

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = false;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.addEventListener("ended", () => {
      videoHasFinished = true;
      freezeOnLastFrame(video);
    });
    video.addEventListener("error", showHeroImageFallback, { once: true });
  });

  const getActiveVideo = () => (mobileQuery.matches ? restaurationVideoMobile : restaurationVideoDesktop);

  const playActiveVideo = () => {
    if (restaurationHero.classList.contains("is-video-fallback")) return;
    const activeVideo = getActiveVideo();
    if (!(activeVideo instanceof HTMLVideoElement)) {
      showHeroImageFallback();
      return;
    }

    videos.forEach((video) => {
      if (video !== activeVideo) {
        video.pause();
      }
    });

    if (videoHasFinished) {
      freezeOnLastFrame(activeVideo);
      return;
    }

    const tryPlay = () => {
      activeVideo.play().catch(() => {
        // noop: retry on first interaction if autoplay is blocked.
      });
    };

    if (activeVideo.readyState >= 2) {
      tryPlay();
    } else {
      activeVideo.addEventListener("loadeddata", tryPlay, { once: true });
      activeVideo.load();
    }
  };

  playActiveVideo();
  mobileQuery.addEventListener("change", playActiveVideo);
  document.addEventListener("pointerdown", playActiveVideo, { once: true, passive: true });
}

if (!prefersReducedMotion && restaurationHero && restaurationHeroMedia && restaurationHeroContent) {
  const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
  const mediaShift = isMobileViewport ? 82 : 168;
  const contentShift = isMobileViewport ? 56 : 118;

  const heroParallaxTl = gsap.timeline({ defaults: { ease: "none" } });
  heroParallaxTl
    .fromTo(restaurationHeroMedia, { y: 0 }, { y: mediaShift, duration: 1 }, 0)
    .fromTo(restaurationHeroContent, { y: 0 }, { y: contentShift, duration: 1 }, 0);

  ScrollTrigger.create({
    animation: heroParallaxTl,
    trigger: restaurationHero,
    start: "top top",
    end: "bottom top",
    scrub: true
  });

  gsap.fromTo(
    restaurationHeroContent,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: restaurationHero,
        start: "top+=12% top",
        end: "top+=64% top",
        scrub: 0.55
      }
    }
  );
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

const renderFormule = (f) => {
  const imgUrl = f.image ? urlFor(f.image).width(1120).url() : "";
  const peekBtn = imgUrl
    ? `<button class="menu-card-peek" type="button" aria-label="Voir la photo de ${f.name}" data-lightbox-img="${imgUrl}" data-lightbox-name="${f.name}" data-lightbox-service="${f.service || ""}">+</button>`
    : "";
  return `
  <article class="menu-card">
    ${peekBtn}
    <div class="menu-card-body">
      ${f.badge ? `<div class="menu-badge">${f.badge}</div>` : ""}
      <h3>${f.name}</h3>
      ${f.service ? `<p class="menu-service">${f.service}</p>` : ""}
      ${f.plats?.length ? `<ul class="menu-items-list">${f.plats.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
      ${f.prix ? `<div class="menu-card-footer"><span class="menu-price">${f.prix}</span></div>` : ""}
    </div>
  </article>`;
};

async function initSanityContent() {
  const dejeunerFeaturedWrap = document.querySelector(".dejeuners-featured-wrap");
  const dejeunerGrid = document.querySelector(".dejeuners-grid");
  const repasGrid = document.querySelector(".repas-grid");

  if (dejeunerFeaturedWrap) dejeunerFeaturedWrap.innerHTML = "";
  if (dejeunerGrid) dejeunerGrid.innerHTML = "";
  if (repasGrid) repasGrid.innerHTML = "";

  try {
    const [formules, pageConfig, restaurationPage] = await Promise.all([
      fetchLocalizedCollection("formule", { orderBy: "order asc" }),
      fetchPageConfig("restauration"),
      fetchLocalizedSingleton("restaurationPage", {
        projection: `heroMedia { mediaType, videoDesktop { asset->{ url } }, videoMobile { asset->{ url } }, fallbackDesktop, fallbackMobile, photoDesktop, photoMobile }`
      }),
    ]);
    applyPageSeo(pageConfig);

    // Appliquer le contenu du hero depuis Sanity
    if (restaurationPage?.heroLabel) {
      const el = document.querySelector(".hero-banner-label");
      if (el) el.textContent = restaurationPage.heroLabel;
    }
    if (restaurationPage?.heroLead) {
      const el = document.querySelector(".hero-banner-lead");
      if (el) el.innerHTML = renderPortableText(restaurationPage.heroLead);
    }
    if (restaurationPage?.heroMedia) {
      applyHeroMedia(
        restaurationPage.heroMedia,
        {
          videoDesktop: document.querySelector(".restauration-hero-video-desktop"),
          videoMobile:  document.querySelector(".restauration-hero-video-mobile"),
          imgDesktop:   document.querySelector(".restauration-hero-image img"),
          imgMobile:    document.querySelector(".restauration-hero-image source"),
        },
        urlFor
      );
    }
    const sectionBindings = [
      ["dejeunersLabel", ".restauration-dejeuners .label"],
      ["dejeunersTitre", ".restauration-dejeuners .intro-text"],
      ["dejeunersNote",  ".restauration-dejeuners .section-note"],
      ["repasLabel",     ".restauration-repas .label"],
      ["repasTitre",     ".restauration-repas .intro-text"],
      ["repasNote",      ".restauration-repas .section-note"],
    ];
    sectionBindings.forEach(([field, selector]) => {
      if (restaurationPage?.[field]) {
        const el = document.querySelector(selector);
        if (el) el.textContent = restaurationPage[field];
      }
    });

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

// ── Lightbox photo repas ───────────────────────────────────────────────────

const lightbox = document.getElementById("meal-lightbox");
const lightboxImg = lightbox?.querySelector(".meal-lightbox-img");
const lightboxName = lightbox?.querySelector(".meal-lightbox-name");
const lightboxService = lightbox?.querySelector(".meal-lightbox-service");

const openLightbox = (img, name, service) => {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = img;
  lightboxImg.alt = name;
  if (lightboxName) lightboxName.textContent = name;
  if (lightboxService) lightboxService.textContent = service;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  document.body.style.overflow = "";
  lightbox.addEventListener("transitionend", () => { lightbox.hidden = true; }, { once: true });
};

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".menu-card-peek");
  if (btn) {
    openLightbox(btn.dataset.lightboxImg, btn.dataset.lightboxName, btn.dataset.lightboxService);
    return;
  }
  if (e.target.closest(".meal-lightbox-close") || e.target.classList.contains("meal-lightbox-backdrop")) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});
