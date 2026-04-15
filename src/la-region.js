import "./style.css";
import "./nav.css";
import "./home.css";
import "./la-region.css";
import "./nav-lang-globe.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initBookingRequest } from "./booking-request.js";
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

const BASE_URL = import.meta.env.BASE_URL || "/";
const assetUrl = (path) => `${BASE_URL}${path.replace(/^\/+/, "")}`;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || window.MAPBOX_TOKEN || "";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger);
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

initBookingRequest({
  triggersSelector: "[data-booking-request-trigger]"
});

const desktopRegionVideo = document.querySelector(".region-video-desktop");
if (desktopRegionVideo instanceof HTMLVideoElement) {
  desktopRegionVideo.addEventListener("click", () => {
    if (desktopRegionVideo.paused) {
      desktopRegionVideo.play().catch(() => {
        // noop
      });
    } else {
      desktopRegionVideo.pause();
    }
  });
}

const headerEl = document.querySelector(".site-header");
const regionHero = document.querySelector(".region-intro");
const regionHeroMedia = document.querySelector(".region-intro-media");
const regionHeroContent = document.querySelector(".region-intro-content");
if (headerEl && regionHero) {
  const updateRegionHeaderTheme = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const trigger = Math.max(0, regionHero.offsetHeight - headerEl.offsetHeight - 20);
    headerEl.classList.toggle("is-solid", scrollY >= trigger);
  };

  updateRegionHeaderTheme();
  window.addEventListener("scroll", updateRegionHeaderTheme, { passive: true });
  window.addEventListener("resize", updateRegionHeaderTheme);
}

if (!prefersReducedMotion && regionHero && regionHeroMedia && regionHeroContent) {
  const isMobileViewport = window.matchMedia("(max-width: 980px)").matches;
  const mediaShift = isMobileViewport ? 88 : 180;
  const contentShift = isMobileViewport ? 64 : 128;

  const heroParallaxTl = gsap.timeline({ defaults: { ease: "none" } });
  heroParallaxTl
    .fromTo(regionHeroMedia, { y: 0 }, { y: mediaShift, duration: 1 }, 0)
    .fromTo(regionHeroContent, { y: 0 }, { y: contentShift, duration: 1 }, 0);

  ScrollTrigger.create({
    animation: heroParallaxTl,
    trigger: regionHero,
    start: "top top",
    end: "bottom top",
    scrub: true
  });

  gsap.fromTo(
    regionHeroContent,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: regionHero,
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

const gite = { name: "Le gîte", coords: [6.06545, 50.42131] };
let spots = [];

const toRad = (deg) => (deg * Math.PI) / 180;
const distanceKmBetween = (a, b) => {
  const R = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const driveMinutesFromGite = (coords) => {
  const km = distanceKmBetween(gite.coords, coords);
  const routedKm = km * 1.35;
  return Math.max(8, Math.round((routedKm / 62) * 60));
};

const formatDrive = (minutes) => {
  if (minutes < 60) return `${minutes} min en voiture`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m.toString().padStart(2, "0")} en voiture`;
};

const popupHtml = (spot) => {
  const km = Math.round(distanceKmBetween(gite.coords, spot.coords));
  const drive = formatDrive(driveMinutesFromGite(spot.coords));
  return `
    <div class="map-popup">
      <img class="map-popup-thumb" src="${spot.img}" alt="${spot.name}" />
      <div class="map-popup-body">
        <div class="map-popup-title">${spot.name}</div>
        <div class="map-popup-meta">${km} km · ${drive}</div>
        <div class="map-popup-cat">${spot.cat}</div>
      </div>
    </div>
  `;
};

const activeFilters = {
  type: "all",
  maxMinutes: null,
  kids: false,
};

const renderSpotsList = () => {
  const listRoot = document.querySelector("#region-spots-list");
  if (!listRoot) return;

  let filtered = [...spots];

  if (activeFilters.type !== "all") {
    filtered = filtered.filter((s) => s.activityType === activeFilters.type);
  }
  if (activeFilters.maxMinutes) {
    filtered = filtered.filter((s) => driveMinutesFromGite(s.coords) <= activeFilters.maxMinutes);
  }
  if (activeFilters.kids) {
    filtered = filtered.filter((s) => s.isKidsFriendly);
  }

  filtered.sort((a, b) => driveMinutesFromGite(a.coords) - driveMinutesFromGite(b.coords));

  if (filtered.length === 0) {
    listRoot.innerHTML = '<li class="spots-empty">Aucun lieu ne correspond à ces filtres.</li>';
    return;
  }

  listRoot.innerHTML = filtered
    .map((spot) => {
      const mins = driveMinutesFromGite(spot.coords);
      const drive = formatDrive(mins);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.coords[1]},${spot.coords[0]}`;
      const wazeUrl = `https://waze.com/ul?ll=${spot.coords[1]},${spot.coords[0]}&navigate=yes`;
      const typeLabel = spot.activityType === "outdoor" ? "🌿 Extérieur" : "🏛 Intérieur";
      const tags = [typeLabel, spot.cat, spot.isKidsFriendly ? "👶 Enfants" : null]
        .filter(Boolean)
        .join(" · ");
      const photoHtml = spot.img
        ? `<div class="spot-detail-photo"><img src="${spot.img}" alt="${spot.name}" loading="lazy" /></div>`
        : "";
      return `
        <li class="spot-item">
          <button class="spot-row" type="button" aria-expanded="false">
            <div>
              <div class="spot-name">${spot.name}</div>
              <div class="spot-cat">${tags}</div>
            </div>
            <div class="spot-dist">${drive}</div>
            <div class="spot-toggle" aria-hidden="true">+</div>
          </button>
          <div class="spot-detail">
            <div class="spot-detail-body">
            <div class="spot-detail-inner">
              <div class="spot-detail-text">
                <p>${spot.desc}</p>
                <div class="spot-detail-links">
                  <a class="spot-nav-pill" href="${wazeUrl}" target="_blank" rel="noopener noreferrer">🧭 Waze</a>
                  <a class="spot-nav-pill spot-nav-pill--maps" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">📍 Maps</a>
                </div>
              </div>
              ${photoHtml}
            </div>
            </div>
          </div>
        </li>
      `;
    })
    .join("");
};

// SEO + Contenu de page depuis Sanity
Promise.all([
  fetchPageConfig("la-region"),
  fetchLocalizedSingleton("regionPage", {
    projection: `heroMedia { mediaType, videoDesktop { asset->{ url } }, videoMobile { asset->{ url } }, fallbackDesktop, fallbackMobile, photoDesktop, photoMobile }`
  }),
]).then(([pageConfig, regionPage]) => {
  applyPageSeo(pageConfig);

  if (regionPage?.heroLabel) {
    const el = document.querySelector(".hero-banner-label");
    if (el) el.textContent = regionPage.heroLabel;
  }
  if (regionPage?.heroLead) {
    const el = document.querySelector(".hero-banner-lead");
    if (el) el.innerHTML = renderPortableText(regionPage.heroLead);
  }
  if (regionPage?.heroMedia) {
    applyHeroMedia(
      regionPage.heroMedia,
      {
        videoDesktop: document.querySelector(".region-video-desktop"),
        videoMobile:  document.querySelector(".region-video-mobile"),
        imgDesktop:   null,
        imgMobile:    null,
      },
      urlFor
    );
  }
  if (regionPage?.carteLabel) {
    const el = document.querySelector("[data-region-map-label]");
    if (el) el.textContent = regionPage.carteLabel;
  }
  if (regionPage?.carteTitre) {
    const el = document.querySelector("[data-region-map-title]");
    if (el) el.innerHTML = renderPortableText(regionPage.carteTitre);
  }
  if (regionPage?.carteLead) {
    const el = document.querySelector("[data-region-map-lead]");
    if (el) el.innerHTML = renderPortableText(regionPage.carteLead);
  }
  if (regionPage?.carteNote) {
    const el = document.querySelector("[data-region-map-note]");
    if (el) el.innerHTML = renderPortableText(regionPage.carteNote);
  }
}).catch((err) => console.error("Erreur Sanity region page:", err));

// Fetch des lieux depuis Sanity
fetchLocalizedCollection("lieuRegion", { orderBy: "order asc" }).then((data) => {
  spots = data.map((s) => ({
    name: s.name,
    activityType: s.activityType,
    cat: s.cat || "",
    location: s.location || "",
    desc: s.desc || "",
    address: s.address || "",
    site: s.site || "",
    coords: s.coords ? [s.coords.lng, s.coords.lat] : [0, 0],
    img: s.image ? urlFor(s.image).width(600).url() : "",
    isKidsFriendly: s.isKidsFriendly || false,
  }));
  renderSpotsList();
  initMap();
}).catch((err) => {
  console.error("Erreur Sanity lieux:", err);
  renderSpotsList();
});

// ── Filtres chips ──
document.querySelectorAll("[data-filter-type]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-filter-type]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilters.type = btn.dataset.filterType || "all";
    renderSpotsList();
  });
});

const timeFilterBtn = document.querySelector("[data-filter-time]");
timeFilterBtn?.addEventListener("click", () => {
  const isActive = timeFilterBtn.classList.toggle("is-active");
  activeFilters.maxMinutes = isActive ? parseInt(timeFilterBtn.dataset.filterTime, 10) : null;
  renderSpotsList();
});

const kidsFilterBtn = document.querySelector("[data-filter-kids]");
kidsFilterBtn?.addEventListener("click", () => {
  activeFilters.kids = kidsFilterBtn.classList.toggle("is-active");
  renderSpotsList();
});

// ── Accordion ──
const listRoot = document.querySelector("#region-spots-list");
if (listRoot) {
  listRoot.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const btn = event.target.closest(".spot-row");
    if (!btn) return;
    const item = btn.closest(".spot-item");
    const detail = item?.querySelector(".spot-detail");
    if (!item || !detail) return;
    // Ferme les autres
    listRoot.querySelectorAll(".spot-item.is-open").forEach((open) => {
      if (open === item) return;
      open.classList.remove("is-open");
      const b = open.querySelector(".spot-row");
      const tog = open.querySelector(".spot-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
      if (tog) tog.textContent = "+";
    });
    const isOpen = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
    const toggle = btn.querySelector(".spot-toggle");
    if (toggle) toggle.textContent = isOpen ? "−" : "+";
  });
}

const initMap = () => {
const mapRoot = document.querySelector("#region-map");
if (mapRoot && window.mapboxgl) {
  const mapbox = window.mapboxgl;
  if (!MAPBOX_TOKEN) {
    mapRoot.innerHTML =
      '<p style="padding:16px;font-family:var(--font-body);">Carte indisponible: token Mapbox manquant.</p>';
  } else {
    mapbox.accessToken = MAPBOX_TOKEN;

    const makePinEl = (isGite = false, badge = "", pinColor = "#F6B05F") => {
      const wrap = document.createElement("div");
      wrap.className = "map-pin-wrap";

      const pin = document.createElement("div");
      pin.style.width = isGite ? "16px" : "14px";
      pin.style.height = isGite ? "16px" : "14px";
      pin.style.borderRadius = "999px";
      pin.style.background = isGite ? "#2A5843" : pinColor;
      pin.style.border = "2px solid #fff";
      pin.style.boxShadow = "0 6px 18px rgba(0,0,0,.18)";
      wrap.appendChild(pin);

      if (badge) {
        const badgeEl = document.createElement("img");
        badgeEl.className = "map-pin-badge";
        badgeEl.src = badge;
        badgeEl.alt = "";
        badgeEl.setAttribute("aria-hidden", "true");
        wrap.appendChild(badgeEl);
      }

      return wrap;
    };

    const updateBadgeScale = (map) => {
      const zoom = map.getZoom();
      const scale = Math.max(0.8, Math.min(1.6, 0.95 + (zoom - 10.8) * 0.14));
      document.querySelectorAll(".map-pin-badge").forEach((badgeEl) => {
        badgeEl.style.setProperty("--badge-scale", String(scale));
      });
    };

    const map = new mapbox.Map({
      container: "region-map",
      style: "mapbox://styles/sonnyduhood/cmloxccwo001k01s48sq3b9um",
      center: gite.coords,
      zoom: 10.8,
      pitch: 60,
      bearing: -15
    });

    map.addControl(new mapbox.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      try {
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14
          });
        }
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.35 });
      } catch {
        // noop
      }

      const gitePopup = new mapbox.Popup({ offset: 14 }).setHTML(`
        <div class="map-popup">
          <img class="map-popup-thumb" src="${assetUrl("/img/GITE_popin.webp")}" alt="${gite.name}" />
          <div class="map-popup-body">
            <div class="map-popup-title">${gite.name}</div>
            <div class="map-popup-meta">Point de départ</div>
            <div class="map-popup-cat">Domaine d'Arimont</div>
          </div>
        </div>
      `);
      const giteMarker = new mapbox.Marker({
        element: makePinEl(true, assetUrl("/img/GITE_pin.png"))
      })
        .setLngLat(gite.coords)
        .setPopup(gitePopup)
        .addTo(map);

      const giteBadgeEl = giteMarker.getElement().querySelector(".map-pin-badge");
      if (giteBadgeEl) {
        gitePopup.on("open", () => giteBadgeEl.classList.add("is-hidden"));
        gitePopup.on("close", () => giteBadgeEl.classList.remove("is-hidden"));
        giteBadgeEl.addEventListener("click", (event) => {
          event.stopPropagation();
          if (gitePopup.isOpen()) gitePopup.remove();
          else giteMarker.togglePopup();
        });
      }

      spots.forEach((spot) => {
        const isOutdoor = spot.activityType === "outdoor";
        const markerEl = makePinEl(false, spot.badge || "", isOutdoor ? "#2A5843" : "#F6B05F");
        const popup = new mapbox.Popup({ offset: 14 }).setHTML(popupHtml(spot));
        const marker = new mapbox.Marker({ element: markerEl })
          .setLngLat(spot.coords)
          .setPopup(popup)
          .addTo(map);

        const badgeEl = marker.getElement().querySelector(".map-pin-badge");
        if (badgeEl) {
          popup.on("open", () => badgeEl.classList.add("is-hidden"));
          popup.on("close", () => badgeEl.classList.remove("is-hidden"));
          badgeEl.addEventListener("click", (event) => {
            event.stopPropagation();
            if (popup.isOpen()) popup.remove();
            else marker.togglePopup();
          });
        }
      });

      updateBadgeScale(map);
      map.on("zoom", () => updateBadgeScale(map));
    });

    if (window.innerWidth > 1024) {
      const initialBearing = -15;
      const initialPitch = 60;

      map.on("mousemove", (e) => {
        const { width, height } = map.getCanvas();
        const x = (e.point.x / width - 0.5) * 2;
        const y = (e.point.y / height - 0.5) * 2;
        map.easeTo({
          bearing: initialBearing + x * 8,
          pitch: initialPitch + y * 6,
          duration: 300,
          easing: (t) => t
        });
      });

      map.on("mouseleave", () => {
        map.easeTo({
          bearing: initialBearing,
          pitch: initialPitch,
          duration: 800
        });
      });
    }
  }
}
}; // fin initMap

const testimonialsSlider = document.querySelector(".testimonials-slider");
const testimonialsTrack = document.querySelector(".testimonials-track");
const testimonialsPrev = document.querySelector(".testimonials-prev");
const testimonialsNext = document.querySelector(".testimonials-next");

if (testimonialsSlider && testimonialsTrack && testimonialsPrev && testimonialsNext) {
  const getStep = () => {
    const card = testimonialsTrack.querySelector(".testimonial-card");
    if (!card) return testimonialsSlider.clientWidth * 0.9;
    const style = window.getComputedStyle(testimonialsTrack);
    const gap = parseFloat(style.columnGap || style.gap || "24") || 24;
    return card.getBoundingClientRect().width + gap;
  };

  testimonialsPrev.addEventListener("click", () => {
    testimonialsSlider.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  testimonialsNext.addEventListener("click", () => {
    testimonialsSlider.scrollBy({ left: getStep(), behavior: "smooth" });
  });
}
