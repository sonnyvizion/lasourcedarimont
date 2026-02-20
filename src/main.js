import "./style.css";
import "./nav.css";
import "./home.css";
import "./nav-lang-globe.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { initBookingRequest } from "./booking-request.js";

gsap.registerPlugin(ScrollTrigger);

const yearEl = document.querySelector("[data-year]");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isIOSDevice =
  /iP(ad|hone|od)/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const headerEl = document.querySelector(".site-header");
const bodyEl = document.body;
const loaderEl = document.querySelector(".site-loader");
const loaderAnimationEl = document.querySelector("#site-loader-animation");
const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu-inner .menu-link");
const LOADER_SESSION_KEY = "arimont_loader_seen";
const BASE_URL = import.meta.env.BASE_URL || "/";
let releaseIntroGate = () => {};
const introGate = new Promise((resolve) => {
  releaseIntroGate = resolve;
});
let introGateReleased = false;
const resolveIntroGate = () => {
  if (introGateReleased) return;
  introGateReleased = true;
  releaseIntroGate();
};

const bookingCheckinInput = document.querySelector('[data-date-input="checkin"]');
const bookingCheckoutInput = document.querySelector('[data-date-input="checkout"]');
const bookingCheckinLabel = document.querySelector('[data-date-label="checkin"]');
const bookingCheckoutLabel = document.querySelector('[data-date-label="checkout"]');
const bookingDateTriggers = document.querySelectorAll("[data-date-trigger]");
const bookingDatePopovers = document.querySelectorAll("[data-date-popover]");
const bookingGuestsToggle = document.querySelector("[data-guests-toggle]");
const bookingGuestsPopover = document.querySelector("[data-guests-popover]");
const bookingGuestsLabel = document.querySelector("[data-guests-label]");
const bookingGuestsCounts = document.querySelectorAll("[data-guests-count]");
const bookingGuestsSteps = document.querySelectorAll("[data-guests-step]");
const heroEl = document.querySelector(".hero");
const heroMedia = document.querySelector(".hero-media");
const heroVideoDesktop = document.querySelector(".hero-video-desktop");
const heroVideoMobile = document.querySelector(".hero-video-mobile");
const heroBookingForm = document.querySelector("[data-hero-booking-form]");
const heroBookingCta = document.querySelector(".hero-cta[data-booking-request-trigger]");
const heroBookingInline = document.querySelector(".hero-booking-inline");

const formatDateFr = (raw) => {
  if (!raw) return "";
  const [year, month, day] = raw.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

if (bookingCheckinInput && bookingCheckoutInput && bookingCheckinLabel && bookingCheckoutLabel) {
  const todayIso = new Date().toISOString().split("T")[0];
  bookingCheckinInput.min = todayIso;
  bookingCheckoutInput.min = todayIso;

  const closeDatePopovers = () => {
    bookingDatePopovers.forEach((popover) => {
      popover.hidden = true;
    });
    bookingDateTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });
  };

  const refreshDateLabels = () => {
    bookingCheckinLabel.textContent = bookingCheckinInput.value
      ? `Arrivée ${formatDateFr(bookingCheckinInput.value)}`
      : "Date d’arrivée";
    bookingCheckoutLabel.textContent = bookingCheckoutInput.value
      ? `Départ ${formatDateFr(bookingCheckoutInput.value)}`
      : "Date de départ";
  };

  bookingCheckinInput.addEventListener("change", () => {
    if (bookingCheckinInput.value) {
      bookingCheckoutInput.min = bookingCheckinInput.value;
      if (bookingCheckoutInput.value && bookingCheckoutInput.value < bookingCheckinInput.value) {
        bookingCheckoutInput.value = "";
      }
    } else {
      bookingCheckoutInput.min = todayIso;
    }
    refreshDateLabels();
    closeDatePopovers();
  });

  bookingCheckoutInput.addEventListener("change", () => {
    refreshDateLabels();
    closeDatePopovers();
  });

  bookingDateTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const target = trigger.getAttribute("data-date-trigger");
      const input = document.querySelector(`[data-date-input="${target}"]`);
      const popover = document.querySelector(`[data-date-popover="${target}"]`);
      if (!input || !popover) return;

      const isOpen = !popover.hidden;
      closeDatePopovers();
      if (isOpen) return;

      popover.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => {
        const isMobilePicker = window.matchMedia("(max-width: 980px)").matches;
        input.focus({ preventScroll: true });
        if (isMobilePicker) {
          input.click();
          return;
        }
        if (typeof input.showPicker === "function") {
          input.showPicker();
        } else {
          input.click();
        }
      });
    });
  });

  bookingDatePopovers.forEach((popover) => {
    popover.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const clickedInDateField = Array.from(document.querySelectorAll(".booking-date-field")).some((field) =>
      field.contains(target)
    );
    if (clickedInDateField) return;
    closeDatePopovers();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDatePopovers();
    }
  });

  refreshDateLabels();
}

if (bookingGuestsToggle && bookingGuestsPopover && bookingGuestsLabel && bookingGuestsSteps.length) {
  const state = { adults: 2, children: 0 };

  const renderGuests = () => {
    bookingGuestsCounts.forEach((el) => {
      const key = el.getAttribute("data-guests-count");
      if (!key) return;
      el.textContent = String(state[key]);
    });
    const adultsLabel = state.adults > 1 ? "adultes" : "adulte";
    const childrenLabel = state.children > 1 ? "enfants" : "enfant";
    bookingGuestsLabel.textContent = `${state.adults} ${adultsLabel}, ${state.children} ${childrenLabel}`;
  };

  const openGuests = () => {
    bookingGuestsPopover.hidden = false;
    bookingGuestsToggle.setAttribute("aria-expanded", "true");
  };

  const closeGuests = () => {
    bookingGuestsPopover.hidden = true;
    bookingGuestsToggle.setAttribute("aria-expanded", "false");
  };

  bookingGuestsToggle.addEventListener("click", () => {
    const isOpen = !bookingGuestsPopover.hidden;
    if (isOpen) {
      closeGuests();
    } else {
      openGuests();
    }
  });

  bookingGuestsSteps.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const key = btn.getAttribute("data-guests-step");
      const step = Number(btn.getAttribute("data-step") || "0");
      if (!key || !Number.isFinite(step)) return;
      const min = key === "adults" ? 1 : 0;
      state[key] = Math.max(min, state[key] + step);
      renderGuests();
    });
  });

  document.addEventListener("click", (event) => {
    if (bookingGuestsPopover.hidden) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (bookingGuestsPopover.contains(target) || bookingGuestsToggle.contains(target)) return;
    closeGuests();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGuests();
    }
  });

  renderGuests();
}

if (heroBookingForm && heroBookingCta) {
  const checkinInput = heroBookingForm.querySelector('[data-booking-input="checkin"]');
  const checkoutInput = heroBookingForm.querySelector('[data-booking-input="checkout"]');
  const adultsInput = heroBookingForm.querySelector('[data-booking-input="adults"]');
  const childrenInput = heroBookingForm.querySelector('[data-booking-input="children"]');
  const roomsInput = heroBookingForm.querySelector('[data-booking-input="rooms"]');
  const closeButton = heroBookingForm.querySelector(".hero-booking-close");
  const heroHeadline = document.querySelector(".hero-headline");
  const heroTitle = document.querySelector(".hero-title");
  const heroNote = document.querySelector(".hero-note");
  const mobileMedia = window.matchMedia("(max-width: 980px)");
  let bookingOpen = false;
  let bookingAnimating = false;

  const setDefaultDates = () => {
    if (!checkinInput || !checkoutInput) return;
    const today = new Date();
    const checkin = new Date(today);
    checkin.setDate(today.getDate() + 2);
    const checkout = new Date(checkin);
    checkout.setDate(checkin.getDate() + 1);
    const toIso = (d) => d.toISOString().slice(0, 10);

    checkinInput.min = toIso(today);
    checkoutInput.min = toIso(today);
    if (!checkinInput.value) checkinInput.value = toIso(checkin);
    if (!checkoutInput.value) checkoutInput.value = toIso(checkout);
  };

  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener("change", () => {
      if (checkinInput.value) {
        checkoutInput.min = checkinInput.value;
        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          const nextDay = new Date(checkinInput.value);
          nextDay.setDate(nextDay.getDate() + 1);
          checkoutInput.value = nextDay.toISOString().slice(0, 10);
        }
      }
    });
  }

  setDefaultDates();

  const setClosedMobileState = (immediate = false) => {
    if (!mobileMedia.matches) return;
    bookingOpen = false;
    bookingAnimating = false;
    const vars = { height: 0, opacity: 0, y: 0, pointerEvents: "none" };
    if (immediate) gsap.set(heroBookingForm, vars);
    else gsap.to(heroBookingForm, { ...vars, duration: 0.35, ease: "power3.inOut" });
    if (closeButton) {
      if (immediate) gsap.set(closeButton, { opacity: 0, pointerEvents: "none" });
      else gsap.to(closeButton, { opacity: 0, duration: 0.2, ease: "power2.out", onComplete: () => {
        closeButton.style.pointerEvents = "none";
      } });
    }
    if (heroNote) gsap.to(heroNote, { opacity: 1, y: 0, duration: immediate ? 0 : 0.35, ease: "power3.out" });
    if (heroTitle) gsap.to(heroTitle, { y: 0, duration: immediate ? 0 : 0.45, ease: "power4.inOut" });
  };

  const openMobileBooking = () => {
    if (!mobileMedia.matches || bookingOpen || bookingAnimating) return;
    bookingAnimating = true;
    heroBookingForm.style.pointerEvents = "auto";

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        bookingOpen = true;
        bookingAnimating = false;
        if (closeButton) closeButton.style.pointerEvents = "auto";
      }
    });

    if (heroNote) tl.to(heroNote, { opacity: 0, y: -8, duration: 0.35 }, 0);
    if (heroTitle) tl.to(heroTitle, { y: -385, duration: 0.45, ease: "power4.inOut" }, 0);
    tl.to(heroBookingForm, { height: "auto", opacity: 1, y: 0, duration: 0.48, ease: "power3.out" }, 0.04);
    if (closeButton) tl.to(closeButton, { opacity: 1, duration: 0.24, ease: "power2.out" }, 0.16);
  };

  const closeMobileBooking = () => {
    if (!mobileMedia.matches || !bookingOpen || bookingAnimating) return;
    bookingAnimating = true;
    if (closeButton) closeButton.style.pointerEvents = "none";

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        bookingOpen = false;
        bookingAnimating = false;
        heroBookingForm.style.pointerEvents = "none";
      }
    });

    if (closeButton) tl.to(closeButton, { opacity: 0, duration: 0.2, ease: "power2.out" }, 0);
    tl.to(heroBookingForm, { height: 0, opacity: 0, y: 8, duration: 0.42, ease: "power3.inOut" }, 0);
    if (heroNote) tl.to(heroNote, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }, 0.08);
    if (heroTitle) tl.to(heroTitle, { y: 0, duration: 0.45, ease: "power4.inOut" }, 0);
  };

  closeButton?.addEventListener("click", (event) => {
    event.preventDefault();
    closeMobileBooking();
  });

  initBookingRequest({
    triggersSelector: "[data-booking-request-trigger]",
    getBookingValues: () => ({
      checkin: checkinInput?.value || "",
      checkout: checkoutInput?.value || "",
      adults: adultsInput?.value || "0",
      children: childrenInput?.value || "0",
      rooms: roomsInput?.value || "0"
    }),
    beforeOpen: ({ trigger }) => {
      if (trigger === heroBookingCta && mobileMedia.matches && !bookingOpen) {
        openMobileBooking();
        return false;
      }
      return true;
    }
  });

  mobileMedia.addEventListener("change", () => {
    if (mobileMedia.matches) {
      setClosedMobileState(true);
    } else {
      bookingOpen = false;
      bookingAnimating = false;
      gsap.set(heroBookingForm, { height: "auto", opacity: 1, y: 0, pointerEvents: "auto" });
      if (closeButton) gsap.set(closeButton, { opacity: 0, pointerEvents: "none" });
      if (heroNote) gsap.set(heroNote, { opacity: 1, y: 0 });
      if (heroTitle) gsap.set(heroTitle, { y: 0 });
      if (heroHeadline) gsap.set(heroHeadline, { bottom: "15%" });
    }
  });

  if (mobileMedia.matches) {
    setClosedMobileState(true);
  }
}

document.querySelectorAll(".feature-illustration-video").forEach((videoEl) => {
  const startLoop = () => {
    const playback = videoEl.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {});
    }
  };

  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.loop = true;
  videoEl.autoplay = true;
  if (videoEl.readyState >= 1) {
    startLoop();
  } else {
    videoEl.addEventListener("loadedmetadata", startLoop, { once: true });
  }
  document.addEventListener("touchstart", startLoop, { once: true, passive: true });
  document.addEventListener("pointerdown", startLoop, { once: true, passive: true });
});

const loadLottie = () =>
  new Promise((resolve) => {
    if (window.lottie) {
      resolve(window.lottie);
      return;
    }
    const existing = document.querySelector('script[data-lottie-loader="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.lottie || null), { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }
    const loadScript = (src) =>
      new Promise((resolveScript) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.dataset.lottieLoader = "true";
        script.addEventListener("load", () => resolveScript(window.lottie || null), { once: true });
        script.addEventListener("error", () => resolveScript(null), { once: true });
        document.head.appendChild(script);
      });

    const candidates = [
      `${BASE_URL}js/lottie.min.js`,
      "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js",
      "https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js",
      "https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js"
    ];

    const tryNext = (index) => {
      if (index >= candidates.length) {
        resolve(null);
        return;
      }
      loadScript(candidates[index]).then((lib) => {
        if (lib) {
          resolve(lib);
        } else {
          tryNext(index + 1);
        }
      });
    };

    tryNext(0);
  });

if (loaderEl) {
  let showLoader = true;
  try {
    showLoader = sessionStorage.getItem(LOADER_SESSION_KEY) !== "1";
  } catch {
    showLoader = true;
  }

  if (showLoader) {
    bodyEl.classList.add("is-loading");
    loaderEl.classList.add("is-active");
    const startedAt = Date.now();
    const minVisibleMs = 0;
    const holdLastFrameMs = 0;
    const maxVisibleMs = 7000;

    let closed = false;
    const closeLoader = () => {
      if (closed) return;
      closed = true;
      loaderEl.classList.add("is-hidden");
      bodyEl.classList.remove("is-loading");
      resolveIntroGate();
      try {
        sessionStorage.setItem(LOADER_SESSION_KEY, "1");
      } catch {
        // noop
      }
      window.setTimeout(() => loaderEl.remove(), 700);
    };

    let lottieInstance = null;
    loadLottie().then((lottie) => {
      if (!lottie || !loaderAnimationEl || closed) return;
      lottieInstance = lottie.loadAnimation({
        container: loaderAnimationEl,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: `${BASE_URL}img/anim_logo_domaine_arimont.json`
      });

      lottieInstance.addEventListener("complete", () => {
        if (lottieInstance) {
          lottieInstance.destroy();
        }
        closeLoader();
      });
    });

    window.setTimeout(() => {
      if (lottieInstance) {
        lottieInstance.destroy();
      }
      closeLoader();
    }, maxVisibleMs);
  } else {
    loaderEl.remove();
    resolveIntroGate();
  }
} else {
  resolveIntroGate();
}

if (navToggle && mobileMenu) {
  const splitMenuLink = (link) => {
    if (link.dataset.split === "true") return;
    const text = link.textContent || "";
    link.setAttribute("aria-label", text.trim());
    link.setAttribute("role", "text");
    const chars = text.split("");
    link.innerHTML = chars
      .map((char) => {
        const safeChar = char === " " ? "&nbsp;" : char;
        return `<span class="char" aria-hidden="true">${safeChar}</span>`;
      })
      .join("");
    link.dataset.split = "true";
  };

  mobileLinks.forEach(splitMenuLink);

  const menuTimeline = gsap.timeline({ paused: true });
  menuTimeline.fromTo(
    ".mobile-menu-inner a .char",
    { y: 22, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: { each: 0.02, from: "start" }
    }
  );
  menuTimeline.fromTo(
    ".mobile-menu-social img",
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1 },
    ">-0.1"
  );

  const toggleMenu = () => {
    const isOpen = bodyEl.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) {
      menuTimeline.restart();
    }
  };

  navToggle.addEventListener("click", toggleMenu);
  mobileMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      toggleMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && bodyEl.classList.contains("menu-open")) {
      toggleMenu();
    }
  });
}

if (!prefersReducedMotion) {
  if (!isIOSDevice) {
    const lenis = new Lenis({
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.08
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  const splitToChars = (el) => {
    const text = el.textContent || "";
    const chars = text.split("");
    el.innerHTML = chars
      .map((char) => {
        const safeChar = char === " " ? "&nbsp;" : char;
        return `<span class="char" aria-hidden="true">${safeChar}</span>`;
      })
      .join("");
    el.classList.add("is-split");
  };

  const titleEl = document.querySelector(".hero-title");
  if (titleEl) {
    const fullTitle = titleEl.textContent || "";
    titleEl.setAttribute("aria-label", fullTitle.trim());
    titleEl.setAttribute("role", "text");
    titleEl.querySelectorAll(".hero-line").forEach((line) => {
      line.setAttribute("aria-hidden", "true");
      splitToChars(line);
    });
  }

  const subtitleEl = document.querySelector(".hero-subtitle");
  if (subtitleEl) {
    const text = subtitleEl.textContent || "";
    subtitleEl.setAttribute("aria-label", text.trim());
    subtitleEl.setAttribute("role", "text");
    splitToChars(subtitleEl);
  }

  const noteEl = document.querySelector(".hero-note");
  if (noteEl) {
    const text = noteEl.textContent || "";
    noteEl.setAttribute("aria-label", text.trim());
    noteEl.setAttribute("role", "text");
    const parts = noteEl.innerHTML.split(/<br\b[^>]*>/i);
    noteEl.innerHTML = parts
      .map((part) => `<span class="hero-note-line">${part}</span>`)
      .join("<br>");
    noteEl.querySelectorAll(".hero-note-line").forEach((line) => splitToChars(line));
  }

  // Les valeurs "from" sont appliquées directement dans les animations
  gsap.set(".booking-panel", { y: 32, opacity: 0 });
  gsap.set(".hero-tree-left", { x: 0, opacity: 1, scale: 1 });
  gsap.set(".hero-tree-right", { x: 0, opacity: 1, scale: 1 });
  gsap.set(".site-header", { y: -24, opacity: 0 });
  gsap.set(".hero-headline", { opacity: 0 });
  gsap.set(".hero-note", { opacity: 0 });
  if (heroBookingInline && !window.matchMedia("(max-width: 980px)").matches) {
    gsap.set(heroBookingInline, { y: 20, opacity: 0 });
  }

  const heroTl = gsap.timeline({
    defaults: { duration: 0.9, ease: "power3.out" },
    paused: true
  });
  const titleLines = gsap.utils.toArray(".hero-title .hero-line");

  heroTl.addLabel("parallaxStart", 0);
  if (!heroVideoDesktop) {
    heroTl
      // Parallax: zoom + sapins
      .to(".hero-image", { scale: 1.12, duration: 5, ease: "power2.out" }, "parallaxStart")
      .to(
        ".hero-tree-left",
        { x: -240, opacity: 1, duration: 5, ease: "power2.out" },
        "parallaxStart"
      )
      .to(
        ".hero-tree-right",
        { x: 240, opacity: 1, duration: 5, ease: "power2.out" },
        "parallaxStart"
      );
  }

  heroTl.to(".hero-headline", { opacity: 1, duration: 0 }, 1);
  titleLines.forEach((line, index) => {
    if (!line.classList.contains("is-split")) {
      splitToChars(line);
    }
  });
  heroTl.fromTo(
    ".hero-title .char",
    { y: 28, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
      stagger: { each: 0.02, from: "start" }
    },
    1
  );
  if (heroBookingInline && !window.matchMedia("(max-width: 980px)").matches) {
    heroTl.to(heroBookingInline, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 1.05);
  }
  if (noteEl) {
    heroTl.to(".hero-note", { opacity: 1, duration: 0 }, 1);
    heroTl.fromTo(
      ".hero-note .char",
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        stagger: { each: 0.015, from: "start" }
      },
      ">-0.2"
    );
  }
  heroTl.add(() => bodyEl.classList.remove("nav-hidden"), 2);
  heroTl.to(".site-header", { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, 2);
  heroTl.to(".booking-panel", { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, 2);

  heroTl.eventCallback("onComplete", () => {
    const parallaxTl = gsap.timeline();
    if (!heroVideoDesktop) {
      parallaxTl
        .fromTo(".hero-image", { scale: 1.12 }, { scale: 1.02, ease: "none" }, 0)
        .fromTo(".hero-tree-left", { x: -240 }, { x: 0, ease: "none" }, 0)
        .fromTo(".hero-tree-right", { x: 240 }, { x: 0, ease: "none" }, 0);
    }
    parallaxTl.fromTo(".hero-headline", { y: 0 }, { y: -60, ease: "none" }, 0);
    parallaxTl.fromTo(".hero-note", { y: 0 }, { y: -60, ease: "none" }, 0);
    ScrollTrigger.create({
      animation: parallaxTl,
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    });
  });
  introGate.then(() => {
    const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
    const activeHeroVideo = isMobileViewport ? heroVideoMobile : heroVideoDesktop;

    const playTimeline = () => {
      if (heroTl.isActive() || heroTl.progress() > 0) return;
      heroTl.play(0);
    };

    if (activeHeroVideo) {
      activeHeroVideo.muted = true;
      activeHeroVideo.defaultMuted = true;
      activeHeroVideo.volume = 0;
      activeHeroVideo.autoplay = true;
      activeHeroVideo.playsInline = true;
      activeHeroVideo.setAttribute("muted", "");
      activeHeroVideo.setAttribute("autoplay", "");
      activeHeroVideo.setAttribute("playsinline", "");
      activeHeroVideo.setAttribute("webkit-playsinline", "");
      activeHeroVideo.loop = false;
      activeHeroVideo.addEventListener("ended", playTimeline, { once: true });
      activeHeroVideo.addEventListener(
        "error",
        () => {
          activeHeroVideo.classList.add("is-hidden");
          if (isMobileViewport && heroMedia) {
            heroMedia.classList.add("use-image-fallback");
          }
          if (isMobileViewport) {
            const heroImg = document.querySelector(".hero-image img");
            if (heroImg) heroImg.classList.add("is-zooming");
          }
          playTimeline();
        },
        { once: true }
      );

      const startHeadline = () => {
        if (!activeHeroVideo.duration || Number.isNaN(activeHeroVideo.duration)) return;
        const remaining = activeHeroVideo.duration - activeHeroVideo.currentTime;
        if (remaining <= 2.7) {
          playTimeline();
          activeHeroVideo.removeEventListener("timeupdate", startHeadline);
        }
      };

      const fadeAt = () => {
        if (!activeHeroVideo.duration || Number.isNaN(activeHeroVideo.duration)) return;
        if (activeHeroVideo.currentTime >= activeHeroVideo.duration - 0.6) {
          activeHeroVideo.classList.add("is-fading");
        }
      };

      activeHeroVideo.addEventListener("timeupdate", fadeAt);
      activeHeroVideo.addEventListener("timeupdate", startHeadline);

      const tryPlay = () => {
        activeHeroVideo.play().catch(() => {
          // On some mobile browsers autoplay can be blocked temporarily.
          // Retry on first user interaction instead of switching immediately to image fallback.
          const retryOnInteraction = () => {
            activeHeroVideo.play().catch(() => {});
          };
          document.addEventListener("touchstart", retryOnInteraction, { once: true, passive: true });
          document.addEventListener("pointerdown", retryOnInteraction, { once: true, passive: true });
        });
      };

      // Extra retry window for iOS/Safari autoplay quirks on first load.
      let autoplayRetries = 0;
      const autoplayInterval = window.setInterval(() => {
        if (!activeHeroVideo.paused || autoplayRetries >= 10) {
          window.clearInterval(autoplayInterval);
          return;
        }
        autoplayRetries += 1;
        activeHeroVideo.play().catch(() => {});
      }, 300);

      if (activeHeroVideo.readyState >= 2) {
        tryPlay();
      } else {
        activeHeroVideo.load();
        activeHeroVideo.addEventListener("loadeddata", tryPlay, { once: true });
        activeHeroVideo.addEventListener("canplay", tryPlay, { once: true });
      }
      return;
    }

    if (isMobileViewport) {
      const heroImg = document.querySelector(".hero-image img");
      if (heroImg) heroImg.classList.add("is-zooming");
    }
    playTimeline();
  });

  if (headerEl && heroEl) {
    let heroHeight = heroEl.getBoundingClientRect().height || 0;
    const lodgingsShowcaseEl = document.querySelector(".js-lodgings-showcase");
    const updateHeroHeight = () => {
      heroHeight = heroEl.getBoundingClientRect().height || 0;
      updateHeaderTheme();
    };
    const updateHeaderTheme = () => {
      if (!heroHeight) return;
      const trigger = heroHeight * 0.5;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      let isOverLodgings = false;
      if (lodgingsShowcaseEl && bodyEl.classList.contains("home-page")) {
        const lodgingsTop =
          lodgingsShowcaseEl.getBoundingClientRect().top + scrollY;
        const lodgingsBottom = lodgingsTop + lodgingsShowcaseEl.offsetHeight;
        isOverLodgings = scrollY >= lodgingsTop && scrollY < lodgingsBottom;
      }
      headerEl.classList.toggle("is-over-lodgings", isOverLodgings);
      headerEl.classList.toggle("is-solid", scrollY >= trigger && !isOverLodgings);
    };

    updateHeroHeight();
    window.addEventListener("scroll", updateHeaderTheme, { passive: true });
    window.addEventListener("resize", updateHeroHeight);
  }

  // Reveal text effect (line by line) for intro text
  const initRevealText = () => {
    document.querySelectorAll("h2, .label").forEach((el) => el.classList.add("reveal-text"));
    const revealTexts = document.querySelectorAll(".reveal-text");
    const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
    const splitLines = (el) => {
      const raw = (el.innerHTML || "").trim();
      const parts = raw
        .split(/<br\b[^>]*>/gi)
        .map((p) => p.trim())
        .filter(Boolean);
      el.innerHTML = parts
        .map((part) => `<span class="line"><span class="line-inner">${part}</span></span>`)
        .join("");
    };

    const splitH2ByVisualLines = (el) => {
      if (el.dataset.wordSplit !== "true") {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let currentNode = walker.nextNode();
        while (currentNode) {
          if ((currentNode.nodeValue || "").trim()) {
            textNodes.push(currentNode);
          }
          currentNode = walker.nextNode();
        }

        textNodes.forEach((textNode) => {
          const text = textNode.nodeValue || "";
          const tokens = text.split(/(\s+)/).filter(Boolean);
          const frag = document.createDocumentFragment();
          tokens.forEach((token) => {
            if (/^\s+$/.test(token)) {
              frag.appendChild(document.createTextNode(token));
              return;
            }
            const span = document.createElement("span");
            span.className = "reveal-word";
            span.textContent = token;
            frag.appendChild(span);
          });
          textNode.parentNode?.replaceChild(frag, textNode);
        });

        el.dataset.wordSplit = "true";
      }

      const words = Array.from(el.querySelectorAll(".reveal-word"));
      const lines = [];
      let currentLine = [];
      let currentTop = null;

      words.forEach((word) => {
        const top = Math.round(word.offsetTop);
        if (currentTop === null || Math.abs(top - currentTop) <= 2) {
          currentLine.push(word);
        } else {
          if (currentLine.length) lines.push(currentLine);
          currentLine = [word];
        }
        currentTop = top;
      });

      if (currentLine.length) {
        lines.push(currentLine);
      }

      return lines;
    };

    revealTexts.forEach((el) => {
      if (isMobileViewport && el.tagName === "H2") {
        const lines = splitH2ByVisualLines(el);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 80%"
          }
        });

        lines.forEach((lineWords, index) => {
          tl.fromTo(
            lineWords,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.4,
              ease: "power3.out",
              stagger: 0.02
            },
            index * 0.14
          );
        });
        return;
      }

      splitLines(el);
      gsap.fromTo(
        el.querySelectorAll(".line-inner"),
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: el,
            start: "top 80%"
          }
        }
      );
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  introGate.then(() => {
    const fontsReady = document.fonts?.ready;
    if (fontsReady && typeof fontsReady.then === "function") {
      fontsReady.then(() => {
        requestAnimationFrame(initRevealText);
      });
      return;
    }
    requestAnimationFrame(initRevealText);
  });

  // Gallery slider: scroll-driven + arrow controls
  const gallerySlider = document.querySelector(".gallery-slider");
  const galleryTrack = document.querySelector(".gallery-track");
  const galleryPrev = document.querySelector(".gallery-prev");
  const galleryNext = document.querySelector(".gallery-next");

  if (gallerySlider && galleryTrack) {
    const isMobile = window.matchMedia("(max-width: 980px)").matches;
    if (isMobile) {
      gsap.set(galleryTrack, { x: 0 });
      gallerySlider.style.scrollBehavior = "auto";
      const getMaxScroll = () => Math.max(0, galleryTrack.scrollWidth - gallerySlider.clientWidth);
      const getStep = () => gallerySlider.clientWidth * 0.75;
      let isTouchingSlider = false;
      gallerySlider.addEventListener("touchstart", () => {
        isTouchingSlider = true;
      }, { passive: true });
      const releaseTouch = () => {
        isTouchingSlider = false;
      };
      gallerySlider.addEventListener("touchend", releaseTouch, { passive: true });
      gallerySlider.addEventListener("touchcancel", releaseTouch, { passive: true });

      ScrollTrigger.create({
        trigger: gallerySlider,
        start: "top 80%",
        end: "top+=220% top",
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (isTouchingSlider) return;
          gsap.to(gallerySlider, {
            scrollLeft: self.progress * getMaxScroll(),
            duration: 0.2,
            ease: "power1.out",
            overwrite: true
          });
        }
      });

      const slideByMobile = (direction) => {
        const max = getMaxScroll();
        const step = getStep();
        const current = gallerySlider.scrollLeft || 0;
        let next = current + step * direction;
        if (direction > 0 && next > max - 1) {
          next = 0;
        } else if (direction < 0 && next < 1) {
          next = max;
        } else {
          next = Math.min(max, Math.max(0, next));
        }
        gallerySlider.scrollTo({ left: next, behavior: "smooth" });
      };

      if (galleryPrev) {
        galleryPrev.addEventListener("click", () => slideByMobile(-1));
      }
      if (galleryNext) {
        galleryNext.addEventListener("click", () => slideByMobile(1));
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
      const getMaxX = () => Math.max(0, galleryTrack.scrollWidth - gallerySlider.clientWidth);
      const getX = () => Math.abs(gsap.getProperty(galleryTrack, "x")) || 0;

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: gallerySlider,
          start: "top 80%",
          end: "top+=100% top",
          scrub: 1.2,
          invalidateOnRefresh: true
        }
      });

      scrollTl.to(galleryTrack, {
        x: () => -getMaxX(),
        ease: "none",
        invalidateOnRefresh: true
      });

      const slideBy = (direction) => {
        const step = gallerySlider.clientWidth * 0.6;
        const maxX = getMaxX();
        const current = getX();
        let next = current + step * direction;
        if (direction > 0 && next > maxX) {
          next = 0;
        } else if (direction < 0 && next < 0) {
          next = maxX;
        } else {
          next = Math.min(maxX, Math.max(0, next));
        }
        gsap.to(galleryTrack, { x: -next, duration: 0.6, ease: "power3.out" });
      };

      if (galleryPrev) {
        galleryPrev.addEventListener("click", () => slideBy(-1));
      }
      if (galleryNext) {
        galleryNext.addEventListener("click", () => slideBy(1));
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  // Testimonials slider: arrows on desktop, horizontal touch on mobile
  const testimonialsSlider = document.querySelector(".testimonials-slider");
  const testimonialsPrev = document.querySelector(".testimonials-prev");
  const testimonialsNext = document.querySelector(".testimonials-next");

  if (testimonialsSlider && testimonialsPrev && testimonialsNext) {
    const slideTestimonials = (direction) => {
      const step = testimonialsSlider.clientWidth * 0.7;
      testimonialsSlider.scrollBy({ left: step * direction, behavior: "smooth" });
    };

    testimonialsPrev.addEventListener("click", () => slideTestimonials(-1));
    testimonialsNext.addEventListener("click", () => slideTestimonials(1));
  }

  const lodgingsShowcase = document.querySelector(".js-lodgings-showcase");
  const lodgingsStage = document.querySelector(".lodgings-stage");
  const lodgingsBgRise = document.querySelector(".lodgings-bg-rise");
  const lodgingsSlideGites = document.querySelector('[data-lodging-slide="gites"]');
  const lodgingsSlideChambres = document.querySelector('[data-lodging-slide="chambres"]');
  const lodgingsProgressFills = document.querySelectorAll(".lodgings-progress-fill");
  const lodgingsGitesVideo = document.querySelector(".lodgings-slide-gites .lodgings-slide-video");
  const lodgingsChambresVideo = document.querySelector(".lodgings-slide-chambres .lodgings-slide-video");
  const lodgingsIsMobile = window.matchMedia("(max-width: 980px)").matches;

  if (
    lodgingsShowcase &&
    lodgingsStage &&
    lodgingsBgRise &&
    lodgingsSlideGites &&
    lodgingsSlideChambres &&
    lodgingsProgressFills.length >= 2
  ) {
    const gitesTitle = lodgingsSlideGites.querySelector(".lodgings-slide-title");
    const gitesBody = lodgingsSlideGites.querySelectorAll(".lodgings-slide-label, p, .btn");
    const chambresTitle = lodgingsSlideChambres.querySelector(".lodgings-slide-title");
    const chambresBody = lodgingsSlideChambres.querySelectorAll(".lodgings-slide-label, p, .btn");
    const firstFill = lodgingsProgressFills[0];
    const secondFill = lodgingsProgressFills[1];
    const gitesPhaseEnd = 0.5;
    const holdBeforeCross = 0.06;
    const crossDuration = 0.08;
    const chambresPhaseEnd = 0.88;
    const chambresStart = gitesPhaseEnd + holdBeforeCross;
    const gitesFullscreenAt = 0.72;
    const bgStartY = 16;
    const bgPinStartY = 8;

    gsap.set(lodgingsSlideGites, { opacity: 1 });
    gsap.set(lodgingsSlideChambres, { opacity: 0 });
    gsap.set(firstFill, { scaleY: 0 });
    gsap.set(secondFill, { scaleY: 0 });
    gsap.set(chambresTitle, { opacity: 0 });
    gsap.set(chambresBody, { opacity: 0 });
    gsap.set(gitesTitle, { opacity: 1 });
    gsap.set(gitesBody, { opacity: 1 });
    gsap.set(lodgingsBgRise, { yPercent: bgStartY });
    if (lodgingsGitesVideo) {
      gsap.set(lodgingsGitesVideo, {
        scale: 0.72,
        y: () => window.innerHeight * 0.18
      });
    }
    const primeScrubVideo = (videoEl) => {
      if (!videoEl) return;
      videoEl.pause();
      videoEl.currentTime = 0;
      const prime = () => {
        const playback = videoEl.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
        window.setTimeout(() => videoEl.pause(), 120);
      };
      if (videoEl.readyState >= 1) prime();
      else videoEl.addEventListener("loadedmetadata", prime, { once: true });
    };

    primeScrubVideo(lodgingsGitesVideo);
    primeScrubVideo(lodgingsChambresVideo);

    ScrollTrigger.create({
      trigger: lodgingsShowcase,
      start: "top bottom",
      end: "top top",
      scrub: 1,
      onUpdate: (self) => {
        const y = bgStartY - (bgStartY - bgPinStartY) * self.progress;
        gsap.set(lodgingsBgRise, { yPercent: y });
      }
    });

    const lodgingsTriggerStart = "top top";
    const lodgingsTriggerEnd = lodgingsIsMobile
      ? "bottom bottom"
      : () => `+=${Math.round(window.innerHeight * 2.2)}`;
    const lodgingsPinTarget = lodgingsIsMobile ? false : lodgingsStage;
    const lodgingsAnticipatePin = lodgingsIsMobile ? 0 : 1;

    ScrollTrigger.create({
      trigger: lodgingsShowcase,
      start: lodgingsTriggerStart,
      end: lodgingsTriggerEnd,
      scrub: 1,
      pin: lodgingsPinTarget,
      pinSpacing: true,
      anticipatePin: lodgingsAnticipatePin,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const gitesProgress = Math.max(0, Math.min(1, p / gitesPhaseEnd));
        const gitesScaleProgress = Math.max(0, Math.min(1, gitesProgress / gitesFullscreenAt));
        const gitesVideoProgress = gitesScaleProgress;
        const chambresProgress = Math.max(
          0,
          Math.min(1, (p - chambresStart) / (chambresPhaseEnd - chambresStart))
        );
        const cross = Math.max(0, Math.min(1, (p - chambresStart) / crossDuration));

        gsap.set(firstFill, { scaleY: gitesProgress });
        gsap.set(secondFill, { scaleY: chambresProgress });
        gsap.set(lodgingsBgRise, { yPercent: bgPinStartY * (1 - gitesProgress) });

        if (lodgingsGitesVideo) {
          gsap.set(lodgingsGitesVideo, {
            scale: 0.72 + 0.28 * gitesScaleProgress,
            y: (1 - gitesScaleProgress) * window.innerHeight * 0.18
          });
        }

        if (lodgingsGitesVideo && lodgingsGitesVideo.duration && Number.isFinite(lodgingsGitesVideo.duration)) {
          const targetTime = Math.min(
            Math.max(0, lodgingsGitesVideo.duration - 0.05),
            lodgingsGitesVideo.duration * gitesVideoProgress
          );
          if (Math.abs(lodgingsGitesVideo.currentTime - targetTime) > 0.033) {
            lodgingsGitesVideo.currentTime = targetTime;
          }
        }

        if (lodgingsChambresVideo && lodgingsChambresVideo.duration && Number.isFinite(lodgingsChambresVideo.duration)) {
          const targetTime = Math.min(
            Math.max(0, lodgingsChambresVideo.duration - 0.05),
            lodgingsChambresVideo.duration * chambresProgress
          );
          if (Math.abs(lodgingsChambresVideo.currentTime - targetTime) > 0.033) {
            lodgingsChambresVideo.currentTime = targetTime;
          }
        }

        gsap.set([lodgingsSlideGites, gitesTitle, ...gitesBody], { opacity: 1 - cross });
        gsap.set(lodgingsSlideChambres, { opacity: cross });
        gsap.set([chambresTitle, ...chambresBody], { opacity: cross });
      }
    });
  }

  // Group parallax: all cards move together (desktop only)
  if (!window.matchMedia("(max-width: 980px)").matches) {
    gsap.fromTo(
      ".feature-card",
      { y: 35 },
      {
        y: -35,
        ease: "none",
        scrollTrigger: {
          trigger: ".section-feature",
          start: "top 85%",
          end: ".section-dark bottom top",
          scrub: 1
        }
      }
    );
  } else {
    const featureGrid = document.querySelector(".feature-grid");
    if (featureGrid) {
      const getFeatureMaxScroll = () =>
        Math.max(0, featureGrid.scrollWidth - featureGrid.clientWidth);
      const smoothFeatureScroll = gsap.quickTo(featureGrid, "scrollLeft", {
        duration: 0.55,
        ease: "power2.out"
      });
      let isTouchingFeatureGrid = false;

      featureGrid.addEventListener(
        "touchstart",
        () => {
          isTouchingFeatureGrid = true;
        },
        { passive: true }
      );

      const releaseFeatureTouch = () => {
        isTouchingFeatureGrid = false;
      };
      featureGrid.addEventListener("touchend", releaseFeatureTouch, { passive: true });
      featureGrid.addEventListener("touchcancel", releaseFeatureTouch, { passive: true });

      ScrollTrigger.create({
        trigger: featureGrid,
        start: "top 65%",
        end: "top+=280% top",
        scrub: 1.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (isTouchingFeatureGrid) return;
          smoothFeatureScroll(self.progress * getFeatureMaxScroll());
        }
      });
    }
  }



  // Pas d'animation de fade sur les sections.
} else if (headerEl) {
  resolveIntroGate();
  bodyEl.classList.remove("nav-hidden");
  headerEl.style.opacity = "1";
  headerEl.style.transform = "none";
}
