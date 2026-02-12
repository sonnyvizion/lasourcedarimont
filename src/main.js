import "./style.css";
import "./nav.css";
import "./home.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

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
    const minVisibleMs = 2600;
    const holdLastFrameMs = 1500;
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
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(holdLastFrameMs, minVisibleMs - elapsed);
        window.setTimeout(() => {
          if (lottieInstance) {
            lottieInstance.destroy();
          }
          closeLoader();
        }, wait);
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

if (!prefersReducedMotion && !isIOSDevice) {
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

  // Les valeurs "from" sont appliquées directement dans les animations
  gsap.set(".booking-panel", { y: 32, opacity: 0 });
  gsap.set(".hero-tree-left", { x: 0, opacity: 1, scale: 1 });
  gsap.set(".hero-tree-right", { x: 0, opacity: 1, scale: 1 });
  gsap.set(".site-header", { y: -24, opacity: 0 });
  gsap.set(".hero-headline", { opacity: 0 });

  const heroTl = gsap.timeline({
    defaults: { duration: 0.9, ease: "power3.out" },
    paused: true
  });
  const titleLines = gsap.utils.toArray(".hero-title .hero-line");

  heroTl.addLabel("parallaxStart", 0);
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
  heroTl.fromTo(
    ".hero-subtitle .char",
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
  heroTl.add(() => bodyEl.classList.remove("nav-hidden"), 2);
  heroTl.to(".site-header", { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, 2);
  heroTl.to(".booking-panel", { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, 2);

  heroTl.eventCallback("onComplete", () => {
    const parallaxTl = gsap.timeline();
    parallaxTl
      .fromTo(".hero-image", { scale: 1.12 }, { scale: 1.02, ease: "none" }, 0)
      .fromTo(".hero-tree-left", { x: -240 }, { x: 0, ease: "none" }, 0)
      .fromTo(".hero-tree-right", { x: 240 }, { x: 0, ease: "none" }, 0);

    ScrollTrigger.create({
      animation: parallaxTl,
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    });
  });
  introGate.then(() => {
    heroTl.play(0);
  });

  // Reveal text effect (line by line) for intro text
  document.querySelectorAll("h2, .label").forEach((el) => el.classList.add("reveal-text"));
  const revealTexts = document.querySelectorAll(".reveal-text");
  const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
  const splitLines = (el) => {
    const raw = (el.innerHTML || "").trim();
    const parts = raw.split(/<br\s*\/?\s*>/i).map((p) => p.trim()).filter(Boolean);
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
            duration: 0.7,
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
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: el,
          start: "top 80%"
        }
      }
    );
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
      const getMaxScroll = () => Math.max(0, galleryTrack.scrollWidth - gallerySlider.clientWidth);
      gallerySlider.style.scrollBehavior = "auto";
      ScrollTrigger.create({
        trigger: gallerySlider,
        start: "top 80%",
        end: "top+=220% top",
        scrub: 1.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gallerySlider.scrollLeft = self.progress * getMaxScroll();
        }
      });
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
  }



  // Pas d'animation de fade sur les sections.
} else if (headerEl) {
  resolveIntroGate();
  bodyEl.classList.remove("nav-hidden");
  headerEl.style.opacity = "1";
  headerEl.style.transform = "none";
}
