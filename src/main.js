import "./style.css";
import "./nav.css";
import "./home.css";
import "./nav-lang-globe.js";
import { t } from "./static-translations.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { initBookingRequest } from "./booking-request.js";
import { applyHeroMedia, applyPageSeo, fetchLocalizedCollection, fetchLocalizedSingleton, urlFor } from "./sanity.js";

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
const HERO_INTRO_SESSION_KEY = "arimont_home_hero_intro_seen";
const BASE_URL = import.meta.env.BASE_URL || "/";
let shouldPlayHeroIntro = true;
try {
  shouldPlayHeroIntro = sessionStorage.getItem(HERO_INTRO_SESSION_KEY) !== "1";
} catch {
  shouldPlayHeroIntro = true;
}
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
const HERO_VIDEO_WAIT_TIMEOUT_MS = 5000;

const applyHeroImageFallback = (videoEl = null) => {
  if (videoEl) {
    videoEl.classList.add("is-hidden");
  }
  if (heroMedia) {
    heroMedia.classList.add("use-image-fallback");
  }
};

const waitForHeroMediaReady = () =>
  new Promise((resolve) => {
    if (!heroEl || !heroMedia) {
      resolve();
      return;
    }

    const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
    const activeHeroVideo = isMobileViewport ? heroVideoMobile : heroVideoDesktop;
    if (!activeHeroVideo) {
      resolve();
      return;
    }

    let settled = false;
    let timeoutId = null;

    const cleanup = () => {
      activeHeroVideo.removeEventListener("loadeddata", onReady);
      activeHeroVideo.removeEventListener("canplay", onReady);
      activeHeroVideo.removeEventListener("error", onError);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };

    const finish = (useFallback = false) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (useFallback) {
        applyHeroImageFallback(activeHeroVideo);
      }
      resolve();
    };

    const onReady = () => finish(false);
    const onError = () => finish(true);

    if (activeHeroVideo.readyState >= 2) {
      finish(false);
      return;
    }

    activeHeroVideo.addEventListener("loadeddata", onReady, { once: true });
    activeHeroVideo.addEventListener("canplay", onReady, { once: true });
    activeHeroVideo.addEventListener("error", onError, { once: true });
    timeoutId = window.setTimeout(() => finish(true), HERO_VIDEO_WAIT_TIMEOUT_MS);
    activeHeroVideo.load();
  });

const heroMediaGate = shouldPlayHeroIntro ? waitForHeroMediaReady() : Promise.resolve();

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
          if (marks.includes("strong") && marks.includes("em")) return `<strong><span class="semi-italic">${text}</span></strong>`;
          if (marks.includes("strong")) return `<strong>${text}</strong>`;
          if (marks.includes("em")) return `<span class="semi-italic">${text}</span>`;
          return text;
        })
        .join("");
    })
    .join("<br />");
};

const renderTemoignage = (testimonial) => {
  const stars = "★".repeat(testimonial.rating) + "☆".repeat(5 - testimonial.rating);
  return `<article class="testimonial-card">
    <div class="testimonial-meta">${testimonial.stayType || ""}</div>
    <strong>${testimonial.author}</strong>
    <p>"${testimonial.quote}"</p>
    <div class="testimonial-stars" aria-label="${t("common.testimonials.rating", { rating: testimonial.rating })}">${stars}</div>
  </article>`;
};

async function fetchHomeContent() {
  try {
    const [home, temoignages] = await Promise.all([
      fetchLocalizedSingleton("homePage", {
        projection: `heroMedia { mediaType, videoDesktop { asset->{ url } }, videoMobile { asset->{ url } }, fallbackDesktop, fallbackMobile, photoDesktop, photoMobile }, bannerMedia { mediaType, videoDesktop { asset->{ url } }, videoMobile { asset->{ url } }, fallbackDesktop, fallbackMobile, photoDesktop, photoMobile }, lodgingsGitesVideoFile { asset->{ url } }, lodgingsRoomsVideoFile { asset->{ url } }, lodgingsInfraVideoFile { asset->{ url } }`
      }),
      fetchLocalizedCollection("temoignage", { orderBy: "order asc" }),
    ]);

    applyPageSeo(home);

    if (home?.heroLines?.length) {
      const split = document.querySelector(".hero-split");
      if (split) split.innerHTML = home.heroLines.map((l) => `<span class="hero-line">${l}</span>`).join("");
    }
    if (home?.heroNote) {
      const note = document.querySelector(".hero-note");
      if (note) note.textContent = home.heroNote;
    }
    if (home?.heroImage) {
      const img = document.querySelector(".hero-image img");
      if (img) img.src = urlFor(home.heroImage).width(1920).url();
    }
    if (home?.heroImageMobile) {
      const src = document.querySelector(".hero-image source");
      if (src) src.srcset = urlFor(home.heroImageMobile).width(980).url();
    }
    if (home?.heroMedia) {
      applyHeroMedia(
        home.heroMedia,
        {
          videoDesktop: document.querySelector(".hero-video-desktop"),
          videoMobile:  document.querySelector(".hero-video-mobile"),
          imgDesktop:   document.querySelector(".hero-image img"),
          imgMobile:    document.querySelector(".hero-image source"),
        },
        urlFor
      );
    }
    if (home?.introLabel) {
      const el = document.querySelector("[data-home-intro-label]");
      if (el) el.textContent = home.introLabel;
    }
    if (home?.introText) {
      const el = document.querySelector("[data-home-intro-text]");
      if (el) el.innerHTML = renderPortableText(home.introText);
    }
    if (home?.galleryImages?.length) {
      const track = document.querySelector("[data-home-gallery]");
      if (track) {
        track.innerHTML = home.galleryImages
          .map((img) => `<div class="card-photo" style="background-image: url('${urlFor(img).width(1200).url()}')"></div>`)
          .join("");
      }
    }
    if (home?.featuresLabel) {
      const el = document.querySelector("[data-home-features-label]");
      if (el) el.textContent = home.featuresLabel;
    }
    if (home?.featuresIntro) {
      document.querySelectorAll("[data-home-features-intro]").forEach((el) => {
        el.innerHTML = renderPortableText(home.featuresIntro);
      });
    }
    if (home?.featureCards?.length) {
      document.querySelectorAll("[data-home-feature]").forEach((card) => {
        const i = Number(card.dataset.homeFeature);
        const f = home.featureCards[i];
        if (!f) return;
        const h3 = card.querySelector("h3");
        const p = card.querySelector("p");
        if (h3 && f.title) h3.textContent = f.title;
        if (p && f.description) p.textContent = f.description;
      });
    }

    // Hero CTA & scroll
    if (home?.heroCta) {
      const el = document.querySelector("[data-home-hero-cta]");
      if (el) el.textContent = home.heroCta;
    }
    if (home?.scrollLabel) {
      const el = document.querySelector("[data-home-scroll]");
      if (el) el.textContent = home.scrollLabel;
    }

    // Lodgings section
    if (home?.lodgingsLabel) {
      const el = document.querySelector("[data-home-lodgings-label]");
      if (el) el.textContent = home.lodgingsLabel;
    }
    if (home?.lodgingsIntro) {
      const el = document.querySelector("[data-home-lodgings-intro]");
      if (el) el.innerHTML = renderPortableText(home.lodgingsIntro);
    }
    if (home?.lodgingsGitesLabel) {
      const el = document.querySelector("[data-home-lodgings-gites-label]");
      if (el) el.textContent = home.lodgingsGitesLabel;
    }
    if (home?.lodgingsGitesTitle) {
      const el = document.querySelector("[data-home-lodgings-gites-title]");
      if (el) el.innerHTML = renderPortableText(home.lodgingsGitesTitle);
    }
    if (home?.lodgingsGitesCta) {
      const el = document.querySelector("[data-home-lodgings-gites-cta]");
      if (el) el.textContent = home.lodgingsGitesCta;
    }
    if (home?.lodgingsRoomsLabel) {
      const el = document.querySelector("[data-home-lodgings-rooms-label]");
      if (el) el.textContent = home.lodgingsRoomsLabel;
    }
    if (home?.lodgingsRoomsTitle) {
      const el = document.querySelector("[data-home-lodgings-rooms-title]");
      if (el) el.innerHTML = renderPortableText(home.lodgingsRoomsTitle);
    }
    if (home?.lodgingsRoomsCta) {
      const el = document.querySelector("[data-home-lodgings-rooms-cta]");
      if (el) el.textContent = home.lodgingsRoomsCta;
    }
    if (home?.lodgingsInfraLabel) {
      const el = document.querySelector("[data-home-lodgings-infra-label]");
      if (el) el.textContent = home.lodgingsInfraLabel;
    }
    if (home?.lodgingsInfraTitle) {
      const el = document.querySelector("[data-home-lodgings-infra-title]");
      if (el) el.innerHTML = renderPortableText(home.lodgingsInfraTitle);
    }
    if (home?.lodgingsInfraCta) {
      const el = document.querySelector("[data-home-lodgings-infra-cta]");
      if (el) el.textContent = home.lodgingsInfraCta;
    }
    if (home?.lodgingsInfraImage) {
      const el = document.querySelector("[data-home-lodgings-infra-image]");
      if (el instanceof HTMLVideoElement) {
        el.poster = urlFor(home.lodgingsInfraImage).width(1800).url();
      } else if (el) {
        el.src = urlFor(home.lodgingsInfraImage).width(1800).url();
      }
    }
    if (home?.lodgingsInfraImageAlt) {
      const el = document.querySelector("[data-home-lodgings-infra-image]");
      if (el instanceof HTMLVideoElement) {
        el.setAttribute("title", home.lodgingsInfraImageAlt);
      } else if (el) {
        el.alt = home.lodgingsInfraImageAlt;
      }
    }

    // Carte domaine — vidéo
    if (home?.lodgingsInfraVideoFile?.asset?.url) {
      const video = document.querySelector('[data-home-lodgings-infra-image]');
      if (video instanceof HTMLVideoElement) {
        const src = video.querySelector("source");
        if (src) { src.src = home.lodgingsInfraVideoFile.asset.url; video.load(); }
      }
    }

    // Carte gîtes
    if (home?.lodgingsGitesImage) {
      const img = document.querySelector('[data-lodging-slide="gites"] .lodging-card-img');
      if (img) img.src = urlFor(home.lodgingsGitesImage).width(900).url();
    }
    if (home?.lodgingsGitesVideoFile?.asset?.url) {
      const video = document.querySelector('[data-lodging-slide="gites"] .lodging-card-video');
      if (video instanceof HTMLVideoElement) {
        const src = video.querySelector("source");
        if (src) { src.src = home.lodgingsGitesVideoFile.asset.url; video.load(); }
      }
    }
    // Carte chambres
    if (home?.lodgingsRoomsImage) {
      const img = document.querySelector('[data-lodging-slide="chambres"] .lodging-card-img');
      if (img) img.src = urlFor(home.lodgingsRoomsImage).width(900).url();
    }
    if (home?.lodgingsRoomsVideoFile?.asset?.url) {
      const video = document.querySelector('[data-lodging-slide="chambres"] .lodging-card-video');
      if (video instanceof HTMLVideoElement) {
        const src = video.querySelector("source");
        if (src) { src.src = home.lodgingsRoomsVideoFile.asset.url; video.load(); }
      }
    }

    // Groups images
    if (home?.groupsImageMain) {
      const el = document.querySelector('[data-home-groups-img="main"]');
      if (el) el.src = urlFor(home.groupsImageMain).width(900).url();
    }
    if (home?.groupsImageSecondary) {
      const el = document.querySelector('[data-home-groups-img="secondary"]');
      if (el) el.src = urlFor(home.groupsImageSecondary).width(900).url();
    }

    // Groups section
    if (home?.groupsLabel) {
      const el = document.querySelector("[data-home-groups-label]");
      if (el) el.textContent = home.groupsLabel;
    }
    if (home?.groupsTitle) {
      const el = document.querySelector("[data-home-groups-title]");
      if (el) el.innerHTML = renderPortableText(home.groupsTitle);
    }
    if (home?.groupsLead) {
      const el = document.querySelector("[data-home-groups-lead]");
      if (el) el.innerHTML = renderPortableText(home.groupsLead);
    }
    if (home?.groupsStats) {
      ["personnes", "hebergements", "nature"].forEach((key) => {
        const stat = home.groupsStats[key];
        if (!stat) return;
        const numEl = document.querySelector(`[data-home-groups-stat-number="${key}"]`);
        const labelEl = document.querySelector(`[data-home-groups-stat-label="${key}"]`);
        if (numEl && stat.number) numEl.textContent = stat.number;
        if (labelEl && stat.label) labelEl.textContent = stat.label;
      });
    }
    if (home?.groupsCta) {
      const el = document.querySelector("[data-home-groups-cta]");
      if (el) el.textContent = home.groupsCta;
    }

    // Banner section
    if (home?.bannerLabel) {
      const el = document.querySelector("[data-home-banner-label]");
      if (el) el.textContent = home.bannerLabel;
    }
    if (home?.bannerTitle) {
      const el = document.querySelector("[data-home-banner-title]");
      if (el) el.innerHTML = renderPortableText(home.bannerTitle);
    }
    if (home?.bannerCta) {
      const el = document.querySelector("[data-home-banner-cta]");
      if (el) el.textContent = home.bannerCta;
    }
    if (home?.bannerMedia) {
      applyHeroMedia(
        home.bannerMedia,
        {
          videoDesktop: document.querySelector(".banner-video-desktop"),
          videoMobile:  document.querySelector(".banner-video-mobile"),
          imgDesktop:   null,
          imgMobile:    null,
        },
        urlFor
      );
    }

    // Reviews section header
    if (home?.reviewsLabel) {
      const el = document.querySelector("[data-home-reviews-label]");
      if (el) el.textContent = home.reviewsLabel;
    }
    if (home?.reviewsHeading) {
      const el = document.querySelector("[data-home-reviews-heading]");
      if (el) el.innerHTML = renderPortableText(home.reviewsHeading);
    }
    if (home?.reviewsCta) {
      const el = document.querySelector("[data-home-reviews-cta]");
      if (el) el.textContent = home.reviewsCta;
    }

    if (temoignages?.length) {
      const track = document.querySelector(".testimonials-track");
      if (track) track.innerHTML = temoignages.map(renderTemoignage).join("");
    }
  } catch (err) {
    console.error("Erreur Sanity home:", err);
  }
}

const homeContentGate = fetchHomeContent();

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
      ? `${t("common.booking.checkin")} ${formatDateFr(bookingCheckinInput.value)}`
      : t("common.booking.checkin");
    bookingCheckoutLabel.textContent = bookingCheckoutInput.value
      ? `${t("common.booking.checkout")} ${formatDateFr(bookingCheckoutInput.value)}`
      : t("common.booking.checkout");
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
    let animationCompleted = false;
    let mediaReady = false;
    const tryCloseLoader = () => {
      if (!animationCompleted || !mediaReady) return;
      closeLoader();
    };
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
    Promise.all([heroMediaGate, homeContentGate]).then(() => {
      mediaReady = true;
      tryCloseLoader();
    });

    loadLottie().then((lottie) => {
      if (closed) return;
      if (!lottie || !loaderAnimationEl) {
        animationCompleted = true;
        tryCloseLoader();
        return;
      }
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
        animationCompleted = true;
        tryCloseLoader();
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
    Promise.all([heroMediaGate, homeContentGate]).then(resolveIntroGate);
  }
} else {
  heroMediaGate.then(resolveIntroGate);
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

const featureSectionEl = document.querySelector(".section-feature");
const featureGridEl = document.querySelector(".section-feature .feature-grid");
const syncFeatureBackgroundSplit = () => {
  if (!featureSectionEl || !featureGridEl) return;
  const sectionRect = featureSectionEl.getBoundingClientRect();
  const gridRect = featureGridEl.getBoundingClientRect();
  const splitOffset = Math.max(0, gridRect.top - sectionRect.top + 100);
  featureSectionEl.style.setProperty("--feature-beige-start", `${Math.round(splitOffset)}px`);
};

syncFeatureBackgroundSplit();
window.addEventListener("resize", syncFeatureBackgroundSplit);
window.addEventListener("load", syncFeatureBackgroundSplit, { once: true });
homeContentGate.then(() => {
  requestAnimationFrame(syncFeatureBackgroundSplit);
});
if (document.fonts?.ready && typeof document.fonts.ready.then === "function") {
  document.fonts.ready.then(() => {
    requestAnimationFrame(syncFeatureBackgroundSplit);
  });
}
ScrollTrigger.addEventListener("refreshInit", syncFeatureBackgroundSplit);

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

  if (shouldPlayHeroIntro) {
    try {
      sessionStorage.setItem(HERO_INTRO_SESSION_KEY, "1");
    } catch {
      // noop
    }
  }

  if (shouldPlayHeroIntro) {
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
  } else {
    bodyEl.classList.remove("nav-hidden");
    gsap.set(".booking-panel", { y: 0, opacity: 1 });
    gsap.set(".hero-tree-left", { x: 0, opacity: 1, scale: 1 });
    gsap.set(".hero-tree-right", { x: 0, opacity: 1, scale: 1 });
    gsap.set(".site-header", { y: 0, opacity: 1 });
    gsap.set(".hero-headline", { opacity: 1 });
    gsap.set(".hero-note", { opacity: 1 });
    if (heroBookingInline && !window.matchMedia("(max-width: 980px)").matches) {
      gsap.set(heroBookingInline, { y: 0, opacity: 1 });
    }
  }

  const heroTl = gsap.timeline({
    defaults: { duration: 0.9, ease: "power3.out" },
    paused: true
  });
  const titleLines = gsap.utils.toArray(".hero-title .hero-line");
  let heroParallaxInitialized = false;

  const initHeroParallax = () => {
    if (heroParallaxInitialized) return;
    heroParallaxInitialized = true;

    const isDesktopViewport = !window.matchMedia("(max-width: 980px)").matches;
    if (isDesktopViewport && heroEl) {
      const smoothHeroParallax = gsap.timeline();
      smoothHeroParallax
        .fromTo(".hero-media", { y: 0 }, { y: 70, ease: "none" }, 0)
        .fromTo(".hero-content", { y: 0 }, { y: 34, ease: "none", duration: 1 }, 0)
        .fromTo(".hero-content", { opacity: 1 }, { opacity: 0, ease: "none", duration: 0.35 }, 0);

      ScrollTrigger.create({
        animation: smoothHeroParallax,
        trigger: heroEl,
        start: "top top",
        end: "bottom top",
        scrub: 1.25
      });
    }

    const parallaxTl = gsap.timeline();
    if (!heroVideoDesktop) {
      parallaxTl
        .fromTo(".hero-image", { scale: 1.12 }, { scale: 1.02, ease: "none" }, 0)
        .fromTo(".hero-tree-left", { x: -240 }, { x: 0, ease: "none" }, 0)
        .fromTo(".hero-tree-right", { x: 240 }, { x: 0, ease: "none" }, 0);
    }
    parallaxTl.fromTo(".hero-headline", { y: 0 }, { y: -24, ease: "none" }, 0);
    parallaxTl.fromTo(".hero-note", { y: 0 }, { y: -24, ease: "none" }, 0);
    ScrollTrigger.create({
      animation: parallaxTl,
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    });
  };

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

  heroTl.eventCallback("onComplete", initHeroParallax);
  introGate.then(() => {
    const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
    const activeHeroVideo = isMobileViewport ? heroVideoMobile : heroVideoDesktop;

    const playTimeline = () => {
      if (heroTl.isActive() || heroTl.progress() > 0) return;
      heroTl.play(0);
    };

    if (!shouldPlayHeroIntro) {
      if (activeHeroVideo) {
        activeHeroVideo.pause();
        activeHeroVideo.loop = false;
        activeHeroVideo.autoplay = false;
        activeHeroVideo.removeAttribute("autoplay");
        activeHeroVideo.classList.remove("is-fading");

        const freezeFrame = () => {
          try {
            activeHeroVideo.currentTime = 0.001;
          } catch {
            // noop
          }
        };
        if (activeHeroVideo.readyState >= 1) {
          freezeFrame();
        } else {
          activeHeroVideo.addEventListener("loadedmetadata", freezeFrame, { once: true });
        }
      }
      initHeroParallax();
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }

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
          applyHeroImageFallback(activeHeroVideo);
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
        if (!isMobileViewport && activeHeroVideo.currentTime >= activeHeroVideo.duration - 0.6) {
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
      // Keep mobile hero media static (no zoom-in effect).
    }
    playTimeline();
  });

  if (headerEl && heroEl) {
    let heroHeight = heroEl.getBoundingClientRect().height || 0;
    const lodgingsShowcaseEl = document.querySelector(".js-lodgings-duo");
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
      if (
        el.classList.contains("groups-title") ||
        el.classList.contains("groupes-title")
      ) {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%"
            }
          }
        );
        return;
      }

      if (isMobileViewport && el.classList.contains("intro-text")) {
        gsap.fromTo(
          el,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%"
            }
          }
        );
        return;
      }

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

    forceFeaturesIntroBeige();

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

  // Gallery slider: boucle infinie + flèches + drag (desktop) / touch (mobile)
  const gallerySlider = document.querySelector(".gallery-slider");
  const galleryTrack = document.querySelector(".gallery-track");
  const galleryPrev = document.querySelector(".gallery-prev");
  const galleryNext = document.querySelector(".gallery-next");

  if (gallerySlider && galleryTrack && galleryTrack.children.length) {
    // Clonage des cartes pour la boucle infinie
    Array.from(galleryTrack.children).forEach((card) => {
      galleryTrack.appendChild(card.cloneNode(true));
    });

    const getHalfWidth = () => galleryTrack.scrollWidth / 2;
    const isMobile = window.matchMedia("(max-width: 980px)").matches;

    gsap.set(galleryTrack, { x: 0 });

    const getRawX = () => Number(gsap.getProperty(galleryTrack, "x")) || 0;

    const normalize = () => {
      const half = getHalfWidth();
      const x = getRawX();
      if (x <= -half) gsap.set(galleryTrack, { x: x + half });
      else if (x > 0) gsap.set(galleryTrack, { x: x - half });
    };

    const slideBy = (direction) => {
      const step = gallerySlider.clientWidth * (isMobile ? 0.75 : 0.6);
      const half = getHalfWidth();
      let currentX = getRawX();
      let targetX = currentX - step * direction;

      if (targetX > 0) {
        currentX -= half;
        targetX -= half;
        gsap.set(galleryTrack, { x: currentX });
      } else if (targetX <= -half) {
        currentX += half;
        targetX += half;
        gsap.set(galleryTrack, { x: currentX });
      }

      gsap.to(galleryTrack, { x: targetX, duration: 0.85, ease: "power2.out", onComplete: normalize });
    };

    if (galleryPrev) galleryPrev.addEventListener("click", () => slideBy(-1));
    if (galleryNext) galleryNext.addEventListener("click", () => slideBy(1));

    // --- Momentum drag (mobile + desktop) ---
    let isDragging = false;
    let didDrag = false;
    let startX = 0;
    let startTrackX = 0;
    let lastX = 0;
    let lastTime = 0;

    const applyMomentum = () => {
      const now = performance.now();
      const dt = now - lastTime;
      const dx = getRawX() - lastX;
      const velocity = dt > 0 ? (dx / dt) * 1000 : 0; // px/s

      if (Math.abs(velocity) > 60) {
        const projected = getRawX() + velocity * 0.35;
        const half = getHalfWidth();
        let targetX = projected;

        const maxLeap = gallerySlider.clientWidth * 0.9;
        if (targetX > getRawX() + maxLeap) targetX = getRawX() + maxLeap;
        if (targetX < getRawX() - maxLeap) targetX = getRawX() - maxLeap;

        if (targetX > 0) {
          gsap.set(galleryTrack, { x: getRawX() - half });
          targetX -= half;
        } else if (targetX <= -half) {
          gsap.set(galleryTrack, { x: getRawX() + half });
          targetX += half;
        }

        gsap.to(galleryTrack, {
          x: targetX,
          duration: 1.1,
          ease: "expo.out",
          onComplete: normalize
        });
      } else {
        normalize();
      }
    };

    const stopDragging = () => {
      if (!isDragging) return;
      isDragging = false;
      gallerySlider.classList.remove("is-dragging");
      applyMomentum();
    };

    const onMove = (pageX) => {
      if (!isDragging) return;
      const deltaX = pageX - startX;
      if (Math.abs(deltaX) > 4) didDrag = true;
      gsap.set(galleryTrack, { x: startTrackX + deltaX });
      lastX = getRawX();
      lastTime = performance.now();
    };

    if (isMobile) {
      gallerySlider.addEventListener("touchstart", (event) => {
        didDrag = false;
        isDragging = true;
        startX = event.touches[0].pageX;
        startTrackX = getRawX();
        lastX = startTrackX;
        lastTime = performance.now();
        gsap.killTweensOf(galleryTrack);
      }, { passive: true });

      gallerySlider.addEventListener("touchmove", (event) => {
        onMove(event.touches[0].pageX);
      }, { passive: true });

      gallerySlider.addEventListener("touchend", stopDragging);
    } else {
      const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (desktopPointer.matches) {
        gallerySlider.classList.add("is-draggable");

        gallerySlider.addEventListener("mousedown", (event) => {
          didDrag = false;
          if (event.button !== 0) return;
          const target = event.target;
          if (target instanceof Element && target.closest("a, button, input, textarea, select, label, [role='button']")) return;
          isDragging = true;
          startX = event.pageX;
          startTrackX = getRawX();
          lastX = startTrackX;
          lastTime = performance.now();
          gallerySlider.classList.add("is-dragging");
          gsap.killTweensOf(galleryTrack);
          event.preventDefault();
        });

        window.addEventListener("mousemove", (event) => {
          onMove(event.pageX);
        });

        window.addEventListener("mouseup", stopDragging);
        gallerySlider.addEventListener("click", (event) => {
          if (!didDrag) return;
          event.preventDefault();
          event.stopPropagation();
        }, true);
      }
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
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

  // Lodgings duo : affiche le 1er frame + hover → lance/arrête la vidéo
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  document.querySelectorAll(".js-lodging-card").forEach((card) => {
    const video = card.querySelector(".lodging-card-video");
    const img = card.querySelector(".lodging-card-img");
    if (!video) return;
    let stopTimer = null;

    if (!isTouchDevice) {
      // Sur desktop : force l'affichage du premier frame dès que possible
      const showFirstFrame = () => { video.currentTime = 0.001; };
      if (video.readyState >= 1) showFirstFrame();
      else video.addEventListener("loadedmetadata", showFirstFrame, { once: true });
    } else if (img) {
      // Sur mobile : si la vidéo ne peut pas afficher le poster rapidement,
      // on montre l'image fallback au cas où
      const ensureVisible = () => {
        if (video.videoWidth === 0 && img) {
          video.style.display = "none";
          img.style.display = "block";
        }
      };
      video.addEventListener("error", () => {
        video.style.display = "none";
        img.style.display = "block";
      }, { once: true });
      window.setTimeout(ensureVisible, 1200);
    }

    card.addEventListener("mouseenter", () => {
      if (stopTimer) {
        window.clearTimeout(stopTimer);
        stopTimer = null;
      }
      if (isTouchDevice) return;
      video.playbackRate = 1;
      video.currentTime = 0;
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    });
    card.addEventListener("mouseleave", () => {
      if (isTouchDevice) return;
      video.playbackRate = 0.75;
      stopTimer = window.setTimeout(() => {
        video.pause();
        video.playbackRate = 1;
      }, 180);
    });
  });

  // Feature cards: mobile horizontal auto-scroll only
  if (window.matchMedia("(max-width: 980px)").matches) {
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



  // Parallax sur toutes les photos de la home (desktop uniquement)
  if (!window.matchMedia("(max-width: 980px)").matches) {
    // Gallery : parallax via div interne translateY (background-position ne fonctionne pas sur images paysage avec cover)
    if (gallerySlider) {
      const allGalleryCards = Array.from(gallerySlider.querySelectorAll(".card-photo"));
      allGalleryCards.forEach((card) => {
        const bgImage = card.style.backgroundImage;
        if (!bgImage) return;
        // Crée un div interne avec l'image, 60px plus haut que le container
        const inner = document.createElement("div");
        inner.style.cssText = `position:absolute;inset:-30px 0;background-image:${bgImage};background-size:cover;background-position:center;`;
        card.style.backgroundImage = "none";
        card.style.position = "relative";
        card.style.overflow = "hidden";
        card.insertBefore(inner, card.firstChild);
        gsap.fromTo(inner,
          { y: -30 },
          {
            y: 30,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      });
    }

    // Lodging duo
    gsap.utils.toArray(".js-lodgings-duo .lodging-card-video, .js-lodgings-duo .lodging-card-img").forEach((el) => {
      gsap.fromTo(el,
        { y: -30 },
        {
          y: 30,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest(".lodging-card"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    });

    // Section groupes
    gsap.utils.toArray(".groups-img img").forEach((img) => {
      gsap.fromTo(img,
        { y: -30 },
        {
          y: 30,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".groups-img"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    });

    // Banner home
    gsap.utils.toArray(".banner .banner-video-desktop").forEach((video) => {
      gsap.fromTo(
        video,
        { y: -24, scale: 1.08 },
        {
          y: 24,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: video.closest(".banner"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    });
  }

  // Pas d'animation de fade sur les sections.
} else if (headerEl) {
  resolveIntroGate();
  bodyEl.classList.remove("nav-hidden");
  headerEl.style.opacity = "1";
  headerEl.style.transform = "none";
}
