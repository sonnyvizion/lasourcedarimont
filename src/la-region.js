import "./style.css";
import "./nav.css";
import "./home.css";
import "./la-region.css";
import "./nav-lang-globe.js";
import { initBookingRequest } from "./booking-request.js";

const BASE_URL = import.meta.env.BASE_URL || "/";
const assetUrl = (path) => `${BASE_URL}${path.replace(/^\/+/, "")}`;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || window.MAPBOX_TOKEN || "";

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
const spots = [
  {
    name: "Circuit de Spa-Francorchamps",
    coords: [5.9695, 50.4357],
    activityType: "outdoor",
    cat: "Sport",
    img: assetUrl("/img/SPA_popin.webp"),
    badge: assetUrl("/img/SPA_pin.png"),
    location: "Francorchamps",
    desc: "Circuit mythique, paddocks, événements auto et sensations fortes au cœur des Ardennes.",
    address: "Route du Circuit 55, 4970 Stavelot, Belgique",
    site: "https://www.spa-francorchamps.be"
  },
  {
    name: "Musée de la Ville d’eaux (Spa)",
    coords: [5.85753, 50.49173],
    activityType: "indoor",
    cat: "Culture",
    img: assetUrl("/img/slider/domaine.jpg"),
    location: "Spa",
    desc: "Un parcours culturel autour de l’histoire thermale et du patrimoine de Spa.",
    address: "Avenue Reine Astrid 77B, 4900 Spa, Belgique",
    site: ""
  },
  {
    name: "Château de Reinhardstein",
    coords: [6.1024676, 50.4527748],
    activityType: "outdoor",
    cat: "Patrimoine",
    img: assetUrl("/img/slider/ponts.jpg"),
    location: "Ovifat",
    desc: "Château emblématique des Hautes-Fagnes, visites et panoramas naturels.",
    address: "Chemin du Cheneux 50, 4950 Waimes, Belgique",
    site: ""
  },
  {
    name: "Abbaye de Stavelot",
    coords: [5.9315672, 50.3934194],
    activityType: "indoor",
    cat: "Patrimoine",
    img: assetUrl("/img/slider/fox.jpg"),
    location: "Stavelot",
    desc: "Complexe historique avec musées, expositions et architecture remarquable.",
    address: "Cour de l'Abbaye 1, 4970 Stavelot, Belgique",
    site: "https://www.abbayedestavelot.be"
  },
  {
    name: "Stavelot (centre)",
    coords: [5.9304413, 50.3940981],
    activityType: "outdoor",
    cat: "Ville",
    img: assetUrl("/img/slider/domaine.jpg"),
    location: "Stavelot",
    desc: "Centre vivant avec commerces, terrasses et ambiance ardennaise conviviale.",
    address: "Place Saint-Remacle, 4970 Stavelot, Belgique",
    site: ""
  },
  {
    name: "Lac de Bütgenbach",
    coords: [6.228, 50.427],
    activityType: "outdoor",
    cat: "Nature",
    img: assetUrl("/img/slider/chevres.jpg"),
    location: "Bütgenbach",
    desc: "Balades, sports nautiques et détente en bord de lac dans un cadre ouvert.",
    address: "Seestraße, 4750 Bütgenbach, Belgique",
    site: ""
  },
  {
    name: "Thermes de Spa",
    coords: [5.8640616, 50.4942814],
    activityType: "indoor",
    cat: "Wellness",
    img: assetUrl("/img/slider/cheval_15_11zon.jpg"),
    location: "Spa",
    desc: "Bains, saunas et soins bien-être dans un établissement thermal de référence.",
    address: "Colline d'Annette et Lubin, 4900 Spa, Belgique",
    site: "https://www.thermesdespa.com"
  },
  {
    name: "Grottes de Remouchamps",
    coords: [5.712157, 50.4801118],
    activityType: "indoor",
    cat: "Nature",
    img: assetUrl("/img/slider/ponts.jpg"),
    location: "Remouchamps",
    desc: "Visite souterraine spectaculaire, avec parcours guidé et rivière intérieure.",
    address: "Rue de Louveigne 3, 4920 Aywaille, Belgique",
    site: ""
  },
  {
    name: "Monde Sauvage (Aywaille)",
    coords: [5.741914, 50.502887],
    activityType: "outdoor",
    cat: "Famille",
    img: assetUrl("/img/slider/fox.jpg"),
    location: "Aywaille",
    desc: "Parc animalier idéal en famille, entre safari, promenade et activités.",
    address: "Fange de Deigné 3, 4920 Aywaille, Belgique",
    site: "https://www.mondesauvage.be"
  },
  {
    name: "Parc Naturel des Hautes-Fagnes",
    coords: [6.0753965, 50.5111275],
    activityType: "outdoor",
    cat: "Nature",
    img: assetUrl("/img/slider/chevres.jpg"),
    location: "Hautes-Fagnes",
    desc: "Réserve naturelle unique pour randonnées, paysages de landes et points de vue.",
    address: "Route de Botrange 131, 4950 Waimes, Belgique",
    site: ""
  }
];

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

const renderSpotsList = (filter = "outdoor") => {
  const listRoot = document.querySelector("#region-spots-list");
  if (!listRoot) return;

  listRoot.innerHTML = spots
    .filter((spot) => spot.activityType === filter)
    .map((spot) => {
      const km = Math.round(distanceKmBetween(gite.coords, spot.coords));
      const drive = formatDrive(driveMinutesFromGite(spot.coords));
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.coords[1]},${spot.coords[0]}`;
      const wazeUrl = `https://waze.com/ul?ll=${spot.coords[1]},${spot.coords[0]}&navigate=yes`;
      return `
        <article class="region-activity-card" style="background-image:url('${spot.img}');">
          <div class="region-activity-overlay">
            <h3 class="region-activity-title">${spot.name}</h3>
            <div class="region-activity-meta">${km} km · ${drive}</div>
            <button class="region-activity-more" type="button" aria-expanded="false" aria-label="Afficher les détails de ${spot.name}">+</button>
            <div class="region-activity-details" hidden>
              <p>${spot.desc}</p>
              <div class="region-activity-links">
                <a class="region-spot-icon-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir ${spot.name} dans Google Maps">
                  <img src="${assetUrl("/img/maps_icon.png")}" alt="" aria-hidden="true" />
                </a>
                <a class="region-spot-icon-link" href="${wazeUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir ${spot.name} dans Waze">
                  <img src="${assetUrl("/img/waze_icon.png")}" alt="" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

let activeFilter = "outdoor";
renderSpotsList(activeFilter);

const activityFilterButtons = document.querySelectorAll("[data-activity-filter]");
const activitiesViewport = document.querySelector(".region-activities-viewport");
const activitiesPrev = document.querySelector(".region-activities-prev");
const activitiesNext = document.querySelector(".region-activities-next");
const listRoot = document.querySelector("#region-spots-list");

activityFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.getAttribute("data-activity-filter") || "outdoor";
    activityFilterButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    renderSpotsList(activeFilter);
    if (activitiesViewport) activitiesViewport.scrollTo({ left: 0, behavior: "smooth" });
  });
});

if (listRoot) {
  listRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const toggle = target.closest(".region-activity-more");
    if (!toggle) return;
    const card = toggle.closest(".region-activity-card");
    const details = card?.querySelector(".region-activity-details");
    if (!card || !details) return;
    const isOpen = card.classList.toggle("is-open");
    details.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "−" : "+";
  });
}

const slideActivities = (direction) => {
  if (!activitiesViewport) return;
  const step = activitiesViewport.clientWidth * 0.9;
  activitiesViewport.scrollBy({ left: step * direction, behavior: "smooth" });
};

activitiesPrev?.addEventListener("click", () => slideActivities(-1));
activitiesNext?.addEventListener("click", () => slideActivities(1));

const mapRoot = document.querySelector("#region-map");
if (mapRoot && window.mapboxgl) {
  const mapbox = window.mapboxgl;
  if (!MAPBOX_TOKEN) {
    mapRoot.innerHTML =
      '<p style="padding:16px;font-family:var(--font-body);">Carte indisponible: token Mapbox manquant.</p>';
  } else {
    mapbox.accessToken = MAPBOX_TOKEN;

    const makePinEl = (isGite = false, badge = "") => {
      const wrap = document.createElement("div");
      wrap.className = "map-pin-wrap";

      const pin = document.createElement("div");
      pin.style.width = isGite ? "16px" : "14px";
      pin.style.height = isGite ? "16px" : "14px";
      pin.style.borderRadius = "999px";
      pin.style.background = isGite ? "#2A5843" : "#F6B05F";
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
        const markerEl = makePinEl(false, spot.badge || "");
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
