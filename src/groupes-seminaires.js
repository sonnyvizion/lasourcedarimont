import "./style.css";
import "./nav.css";
import "./home.css";
import "./groupes-seminaires.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";
import { applyHeroMedia, applyPageSeo, fetchLocalizedSingleton, urlFor } from "./sanity.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = initSmoothScroll();
lenis?.on("scroll", ScrollTrigger.update);

// ─── Année dans le footer ──────────────────────────────────────────────────────
const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Navigation mobile ────────────────────────────────────────────────────────
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

initBookingRequest({ triggersSelector: "[data-booking-request-trigger]" });

const headerEl = document.querySelector(".site-header");
const groupesHero = document.querySelector(".groupes-hero");
const groupesHeroMedia = document.querySelector(".groupes-hero-media");
const groupesHeroContent = document.querySelector(".groupes-hero-wrap");
const groupesVideoDesktop = document.querySelector(".groupes-hero-video-desktop");
const groupesVideoMobile = document.querySelector(".groupes-hero-video-mobile");

if (headerEl && groupesHero) {
  const updateHeaderTheme = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const trigger = Math.max(0, groupesHero.offsetHeight - headerEl.offsetHeight - 20);
    headerEl.classList.toggle("is-solid", scrollY >= trigger);
  };

  updateHeaderTheme();
  window.addEventListener("scroll", updateHeaderTheme, { passive: true });
  window.addEventListener("resize", updateHeaderTheme);
}

if (groupesHero) {
  const mobileQuery = window.matchMedia("(max-width: 980px)");
  const videos = [groupesVideoDesktop, groupesVideoMobile].filter(
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
    if (groupesHero.classList.contains("is-video-fallback")) return;
    groupesHero.classList.add("is-video-fallback");
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

  const getActiveVideo = () => (mobileQuery.matches ? groupesVideoMobile : groupesVideoDesktop);

  const playActiveVideo = () => {
    if (groupesHero.classList.contains("is-video-fallback")) return;
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

if (!prefersReducedMotion && groupesHero && groupesHeroMedia && groupesHeroContent) {
  const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
  const mediaShift = isMobileViewport ? 84 : 170;
  const contentShift = isMobileViewport ? 58 : 118;

  const heroParallaxTl = gsap.timeline({ defaults: { ease: "none" } });
  heroParallaxTl
    .fromTo(groupesHeroMedia, { y: 0 }, { y: mediaShift, duration: 1 }, 0)
    .fromTo(groupesHeroContent, { y: 0 }, { y: contentShift, duration: 1 }, 0);

  ScrollTrigger.create({
    animation: heroParallaxTl,
    trigger: groupesHero,
    start: "top top",
    end: "bottom top",
    scrub: true
  });

  gsap.fromTo(
    groupesHeroContent,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: groupesHero,
        start: "top+=12% top",
        end: "top+=64% top",
        scrub: 0.55
      }
    }
  );
}

// ─── Reveal animations ────────────────────────────────────────────────────────
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

const initReveal = () => {
  const revealEls = document.querySelectorAll(".reveal-text");
  if (!revealEls.length) return;
  revealEls.forEach(splitRevealLines);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.2 }
  );
  revealEls.forEach((el) => observer.observe(el));
};

// ─── Portable text renderer ───────────────────────────────────────────────────
const renderPortableText = (blocks) => {
  if (!blocks?.length) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block") return "";
      return (block.children || [])
        .map((span) => {
          if (span._type === "break") return "<br />";
          let text = (span.text || "").replace(/\n/g, "<br />");
          const marks = span.marks || [];
          if (marks.includes("strong") && marks.includes("em"))
            return `<strong><span class="semi-italic">${text}</span></strong>`;
          if (marks.includes("strong")) return `<strong>${text}</strong>`;
          if (marks.includes("em")) return `<span class="semi-italic">${text}</span>`;
          return text;
        })
        .join("");
    })
    .join("<br />");
};

const nl2br = (str) => (str || "").replace(/\n/g, "<br>");

// ─── Sanity content wiring ────────────────────────────────────────────────────
async function initSanityContent() {
  try {
    const page = await fetchLocalizedSingleton("groupesSeminaires", {
      projection: `heroMedia { mediaType, videoDesktop { asset->{ url } }, videoMobile { asset->{ url } }, fallbackDesktop, fallbackMobile, photoDesktop, photoMobile }`
    });
    if (!page) return; // fallback: static HTML content stays as-is

    applyPageSeo(page);

    // Hero textes
    if (page.heroLabel) {
      const el = document.querySelector("[data-groupes-intro-label]");
      if (el) el.textContent = page.heroLabel;
    }
    if (page.heroLead) {
      const el = document.querySelector(".hero-banner-lead");
      if (el) el.innerHTML = renderPortableText(page.heroLead);
    }
    // Hero média
    if (page.heroMedia) {
      applyHeroMedia(
        page.heroMedia,
        {
          videoDesktop: document.querySelector(".groupes-hero-video-desktop"),
          videoMobile:  document.querySelector(".groupes-hero-video-mobile"),
          imgDesktop:   document.querySelector(".groupes-hero-image img"),
          imgMobile:    document.querySelector(".groupes-hero-image source"),
        },
        urlFor
      );
    }

    // ── Intro ──────────────────────────────────────────────────────────────────
    if (page.introLabel) {
      const el = document.querySelector("[data-groupes-intro-label]");
      if (el) el.textContent = page.introLabel;
    }
    if (page.introTitle) {
      const el = document.querySelector("[data-groupes-intro-title]");
      if (el) el.innerHTML = renderPortableText(page.introTitle);
    }
    if (page.introLead) {
      const el = document.querySelector("[data-groupes-intro-lead]");
      if (el) el.innerHTML = renderPortableText(page.introLead);
    }
    if (page.introCta) {
      const el = document.querySelector("[data-groupes-intro-cta]");
      if (el) el.textContent = page.introCta;
    }
    if (page.introCtaDiscover) {
      const el = document.querySelector("[data-groupes-intro-cta-discover]");
      if (el) el.textContent = page.introCtaDiscover;
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    if (page.stats) {
      ["personnes", "hebergements", "couverts", "privatisable"].forEach((key) => {
        const stat = page.stats[key];
        if (!stat) return;
        const numEl = document.querySelector(`[data-groupes-stat-number="${key}"]`);
        const labelEl = document.querySelector(`[data-groupes-stat-label="${key}"]`);
        if (numEl && stat.number) numEl.textContent = stat.number;
        if (labelEl && stat.label) labelEl.textContent = stat.label;
      });
    }

    // ── Hébergements ───────────────────────────────────────────────────────────
    if (page.hebergLabel) {
      const el = document.querySelector("[data-groupes-heberg-label]");
      if (el) el.textContent = page.hebergLabel;
    }
    if (page.hebergTitle) {
      const el = document.querySelector("[data-groupes-heberg-title]");
      if (el) el.innerHTML = renderPortableText(page.hebergTitle);
    }
    if (page.hebergDesc) {
      const el = document.querySelector("[data-groupes-heberg-desc]");
      if (el) el.innerHTML = nl2br(page.hebergDesc);
    }
    if (page.hebergItems?.length) {
      page.hebergItems.forEach((item, i) => {
        const titleEl = document.querySelector(`[data-groupes-heberg-item-title="${i}"]`);
        const descEl = document.querySelector(`[data-groupes-heberg-item-desc="${i}"]`);
        if (titleEl && item.title) titleEl.textContent = item.title;
        if (descEl && item.description) descEl.innerHTML = nl2br(item.description);
      });
    }
    if (page.hebergImageA) {
      const img = document.querySelector('[data-groupes-heberg-img="a"]');
      if (img) img.src = urlFor(page.hebergImageA).width(900).url();
    }
    if (page.hebergImageB) {
      const img = document.querySelector('[data-groupes-heberg-img="b"]');
      if (img) img.src = urlFor(page.hebergImageB).width(900).url();
    }

    // ── Grande salle ───────────────────────────────────────────────────────────
    if (page.salleLabel) {
      const el = document.querySelector("[data-groupes-salle-label]");
      if (el) el.textContent = page.salleLabel;
    }
    if (page.salleTitle) {
      const el = document.querySelector("[data-groupes-salle-title]");
      if (el) el.innerHTML = renderPortableText(page.salleTitle);
    }
    if (page.salleText1) {
      const el = document.querySelector("[data-groupes-salle-text-1]");
      if (el) el.innerHTML = renderPortableText(page.salleText1);
    }
    if (page.salleText2) {
      const el = document.querySelector("[data-groupes-salle-text-2]");
      if (el) el.innerHTML = nl2br(page.salleText2);
    }
    if (page.salleImage) {
      const img = document.querySelector("[data-groupes-salle-img]");
      if (img) img.src = urlFor(page.salleImage).width(900).url();
    }
    if (page.salleHighlightNumber) {
      const el = document.querySelector("[data-groupes-salle-highlight-number]");
      if (el) el.textContent = page.salleHighlightNumber;
    }
    if (page.salleHighlightLabel) {
      const el = document.querySelector("[data-groupes-salle-highlight-label]");
      if (el) el.innerHTML = page.salleHighlightLabel.replace(/\n/g, "<br>");
    }

    // ── Combo ──────────────────────────────────────────────────────────────────
    if (page.comboLabel) {
      const el = document.querySelector("[data-groupes-combo-label]");
      if (el) el.textContent = page.comboLabel;
    }
    if (page.comboTitle) {
      const el = document.querySelector("[data-groupes-combo-title]");
      if (el) el.innerHTML = renderPortableText(page.comboTitle);
    }
    if (page.comboLead) {
      const el = document.querySelector("[data-groupes-combo-lead]");
      if (el) el.innerHTML = nl2br(page.comboLead);
    }
    if (page.comboCards?.length) {
      page.comboCards.forEach((card, i) => {
        const titleEl = document.querySelector(`[data-groupes-combo-card-title="${i}"]`);
        const descEl = document.querySelector(`[data-groupes-combo-card-desc="${i}"]`);
        if (titleEl && card.title) titleEl.innerHTML = card.title.replace(/\n/g, "<br />");
        if (descEl && card.description) descEl.innerHTML = nl2br(card.description);
      });
    }

    // ── Infrastructures ────────────────────────────────────────────────────────
    if (page.infraLabel) {
      const el = document.querySelector("[data-groupes-infra-label]");
      if (el) el.textContent = page.infraLabel;
    }
    if (page.infraTitle) {
      const el = document.querySelector("[data-groupes-infra-title]");
      if (el) el.innerHTML = renderPortableText(page.infraTitle);
    }
    if (page.infraCards?.length) {
      page.infraCards.forEach((card, i) => {
        const titleEl = document.querySelector(`[data-groupes-infra-card-title="${i}"]`);
        const descEl = document.querySelector(`[data-groupes-infra-card-desc="${i}"]`);
        if (titleEl && card.title) titleEl.textContent = card.title;
        if (descEl && card.description) descEl.innerHTML = nl2br(card.description);
      });
    }

    // ── Idéal pour ─────────────────────────────────────────────────────────────
    if (page.idealLabel) {
      const el = document.querySelector("[data-groupes-ideal-label]");
      if (el) el.textContent = page.idealLabel;
    }
    if (page.idealTitle) {
      const el = document.querySelector("[data-groupes-ideal-title]");
      if (el) el.innerHTML = renderPortableText(page.idealTitle);
    }
    if (page.idealTags?.length) {
      const container = document.querySelector("[data-groupes-ideal-tags]");
      if (container) {
        container.innerHTML = page.idealTags
          .map((tag) => `<span class="groupes-ideal-tag">${tag}</span>`)
          .join("");
      }
    }

    // ── CTA final ──────────────────────────────────────────────────────────────
    if (page.ctaLabel) {
      const el = document.querySelector("[data-groupes-cta-label]");
      if (el) el.innerHTML = page.ctaLabel;
    }
    if (page.ctaTitle) {
      const el = document.querySelector("[data-groupes-cta-title]");
      if (el) el.innerHTML = renderPortableText(page.ctaTitle);
    }
    if (page.ctaLead) {
      const el = document.querySelector("[data-groupes-cta-lead]");
      if (el) el.innerHTML = nl2br(page.ctaLead);
    }
    if (page.ctaDevis) {
      const el = document.querySelector("[data-groupes-cta-devis]");
      if (el) el.textContent = page.ctaDevis;
    }
    if (page.ctaHebergements) {
      const el = document.querySelector("[data-groupes-cta-hebergements]");
      if (el) el.textContent = page.ctaHebergements;
    }
  } catch (err) {
    console.error("Erreur Sanity groupes-seminaires:", err);
  } finally {
    animateHeroBannerLabel(true);
    // Toujours lancer les animations après injection du contenu Sanity
    initReveal();
  }
}

initSanityContent();
