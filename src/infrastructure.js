import "./style.css";
import "./nav.css";
import "./home.css";
import "./infrastructure.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = initSmoothScroll();
lenis?.on("scroll", ScrollTrigger.update);

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

const headerEl = document.querySelector(".site-header");
const infrastructureHero = document.querySelector(".infrastructure-hero");
const infrastructureHeroMedia = document.querySelector(".infrastructure-hero-media");
const infrastructureHeroContent = document.querySelector(".infrastructure-hero-wrap");
const infrastructureVideoDesktop = document.querySelector(".infrastructure-hero-video-desktop");
const infrastructureVideoMobile = document.querySelector(".infrastructure-hero-video-mobile");

if (headerEl && infrastructureHero) {
  const updateHeaderTheme = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const trigger = Math.max(0, infrastructureHero.offsetHeight - headerEl.offsetHeight - 20);
    headerEl.classList.toggle("is-solid", scrollY >= trigger);
  };

  updateHeaderTheme();
  window.addEventListener("scroll", updateHeaderTheme, { passive: true });
  window.addEventListener("resize", updateHeaderTheme);
}

if (infrastructureHero) {
  const mobileQuery = window.matchMedia("(max-width: 980px)");
  const videos = [infrastructureVideoDesktop, infrastructureVideoMobile].filter(
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
    if (infrastructureHero.classList.contains("is-video-fallback")) return;
    infrastructureHero.classList.add("is-video-fallback");
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

  const getActiveVideo = () => (mobileQuery.matches ? infrastructureVideoMobile : infrastructureVideoDesktop);

  const playActiveVideo = () => {
    if (infrastructureHero.classList.contains("is-video-fallback")) return;
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

if (!prefersReducedMotion && infrastructureHero && infrastructureHeroMedia && infrastructureHeroContent) {
  const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
  const mediaShift = isMobileViewport ? 82 : 168;
  const contentShift = isMobileViewport ? 56 : 118;

  const heroParallaxTl = gsap.timeline({ defaults: { ease: "none" } });
  heroParallaxTl
    .fromTo(infrastructureHeroMedia, { y: 0 }, { y: mediaShift, duration: 1 }, 0)
    .fromTo(infrastructureHeroContent, { y: 0 }, { y: contentShift, duration: 1 }, 0);

  ScrollTrigger.create({
    animation: heroParallaxTl,
    trigger: infrastructureHero,
    start: "top top",
    end: "bottom top",
    scrub: true
  });

  gsap.fromTo(
    infrastructureHeroContent,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: infrastructureHero,
        start: "top+=12% top",
        end: "top+=64% top",
        scrub: 0.55
      }
    }
  );
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

const infraSlides = [
  {
    title: "Espaces extérieurs et détente",
    description:
      "Grandes zones vertes, coins repos et circulation facile dans le domaine: idéal pour alterner activités et moments calmes.",
    points: [
      "Espaces ouverts pour respirer et se retrouver",
      "Ambiance nature à deux pas des hébergements",
      "Cadre adapté aux séjours en couple, famille ou groupe"
    ],
    image: "/img/slider/domaine.jpg",
    alt: "Vue extérieure du Domaine de la Source d'Arimont"
  },
  {
    title: "Aires de jeux et moments en famille",
    description:
      "Les enfants profitent d'espaces adaptés pendant que les adultes gardent un vrai confort de séjour, sans devoir quitter le domaine.",
    points: [
      "Zones de jeux sécurisées pour varier les activités",
      "Organisation simple pour les familles avec enfants",
      "Bonne répartition entre animation et tranquillité"
    ],
    image: "/img/region/lac_card.webp",
    alt: "Famille profitant des activités autour du domaine"
  },
  {
    title: "Infrastructure pensée pour les groupes",
    description:
      "Le site facilite les séjours collectifs: circulation fluide, lieux de rassemblement et espaces compatibles avec les événements privés ou pros.",
    points: [
      "Configuration pratique pour séminaires et réunions",
      "Atmosphère chaleureuse pour les week-ends entre amis",
      "Accès rapide aux autres pôles du domaine"
    ],
    image: "/img/hero_v3.webp",
    alt: "Infrastructures du Domaine pour accueillir des groupes"
  }
];

const farmPhotos = [
  {
    src: "/img/slider/chevres.jpg",
    alt: "Chèvres dans la ferme du Domaine",
    caption: "Les chèvres du domaine, une rencontre incontournable pour les enfants."
  },
  {
    src: "/img/slider/cheval_15_11zon.jpg",
    alt: "Cheval dans la prairie du Domaine",
    caption: "Un environnement vivant qui valorise la nature et la proximité avec les animaux."
  },
  {
    src: "/img/slider/cheval2_16_11zon.jpg",
    alt: "Animaux de la ferme du Domaine",
    caption: "La ferme complète l'expérience du séjour avec une activité simple et authentique."
  },
  {
    src: "/img/slider/fox.jpg",
    alt: "Vie sauvage observée autour du Domaine",
    caption: "Un cadre ardennais riche, à observer tout au long de l'année."
  }
];

const infraTrack = document.querySelector("[data-infra-track]");
const infraDots = document.querySelector("[data-infra-dots]");
const infraPrev = document.querySelector("[data-infra-prev]");
const infraNext = document.querySelector("[data-infra-next]");
let infraIndex = 0;

const farmTrack = document.querySelector("[data-farm-track]");
const farmCaption = document.querySelector("[data-farm-caption]");
const farmPrev = document.querySelector("[data-farm-prev]");
const farmNext = document.querySelector("[data-farm-next]");
let farmIndex = 0;

const modulo = (value, size) => ((value % size) + size) % size;

if (infraTrack && infraDots) {
  infraTrack.innerHTML = infraSlides
    .map(
      (slide) => `
      <article class="infra-slide">
        <div class="infra-slide-card">
          <figure class="infra-slide-media">
            <img src="${slide.image}" alt="${slide.alt}" loading="lazy" />
          </figure>
          <div class="infra-slide-copy">
            <h3>${slide.title}</h3>
            <p>${slide.description}</p>
            <ul class="infra-slide-points">
              ${slide.points.map((point) => `<li>${point}</li>`).join("")}
            </ul>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  infraDots.innerHTML = infraSlides
    .map(
      (_, idx) =>
        `<button class="infra-dot${idx === 0 ? " is-active" : ""}" type="button" aria-label="Aller à la slide ${
          idx + 1
        }" data-infra-dot="${idx}"></button>`
    )
    .join("");

  const dotButtons = Array.from(document.querySelectorAll("[data-infra-dot]"));

  const updateInfra = (nextIndex) => {
    infraIndex = modulo(nextIndex, infraSlides.length);
    infraTrack.style.transform = `translateX(-${infraIndex * 100}%)`;
    dotButtons.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === infraIndex);
      dot.setAttribute("aria-current", idx === infraIndex ? "true" : "false");
    });
  };

  infraPrev?.addEventListener("click", () => updateInfra(infraIndex - 1));
  infraNext?.addEventListener("click", () => updateInfra(infraIndex + 1));
  dotButtons.forEach((dot) => {
    dot.addEventListener("click", () => updateInfra(Number(dot.dataset.infraDot || "0")));
  });

  const infraCarousel = document.querySelector("[data-infra-carousel]");
  infraCarousel?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") updateInfra(infraIndex - 1);
    if (event.key === "ArrowRight") updateInfra(infraIndex + 1);
  });
}

if (farmTrack && farmCaption) {
  farmTrack.innerHTML = farmPhotos
    .map((photo) => `<img class="farm-photo" src="${photo.src}" alt="${photo.alt}" loading="lazy" />`)
    .join("");

  const updateFarm = (nextIndex) => {
    farmIndex = modulo(nextIndex, farmPhotos.length);
    farmTrack.style.transform = `translateX(-${farmIndex * 100}%)`;
    farmCaption.textContent = farmPhotos[farmIndex].caption;
  };

  farmPrev?.addEventListener("click", () => updateFarm(farmIndex - 1));
  farmNext?.addEventListener("click", () => updateFarm(farmIndex + 1));

  const farmGallery = document.querySelector("[data-farm-gallery]");
  farmGallery?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") updateFarm(farmIndex - 1);
    if (event.key === "ArrowRight") updateFarm(farmIndex + 1);
  });

  updateFarm(0);
}
