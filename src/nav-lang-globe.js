const BASE_URL = import.meta.env.BASE_URL || "/";
const GREY_GLOBE_PATH = `${BASE_URL}img/Grey Globe.json`;
const GREEN_GLOBE_PATH = `${BASE_URL}img/Green Globe.json`;

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
    const script = document.createElement("script");
    script.src = `${BASE_URL}js/lottie.min.js`;
    script.async = true;
    script.dataset.lottieLoader = "true";
    script.addEventListener("load", () => resolve(window.lottie || null), { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.appendChild(script);
  });

const shouldUseGreenGlobe = () => {
  const headerEl = document.querySelector(".site-header");
  const bodyEl = document.body;
  if (!headerEl) return false;
  if (headerEl.classList.contains("is-solid")) return true;
  return bodyEl.classList.contains("gites-chambres-page") && !bodyEl.classList.contains("menu-open");
};

const initNavLangGlobe = async () => {
  const globeEls = document.querySelectorAll(".nav-lang-globe");
  if (!globeEls.length) return;

  const lottie = await loadLottie();
  if (!lottie) return;

  const instances = new Map();
  const renderGlobe = (el, path) => {
    const prev = instances.get(el);
    if (prev && prev.path === path) return;
    if (prev) prev.anim.destroy();
    const anim = lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
    });
    anim.setSpeed(1);
    instances.set(el, { anim, path });
  };

  const updateGlobes = () => {
    const path = shouldUseGreenGlobe() ? GREEN_GLOBE_PATH : GREY_GLOBE_PATH;
    globeEls.forEach((el) => renderGlobe(el, path));
  };

  updateGlobes();

  const headerEl = document.querySelector(".site-header");
  const bodyEl = document.body;
  if (headerEl) {
    new MutationObserver(updateGlobes).observe(headerEl, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }
  new MutationObserver(updateGlobes).observe(bodyEl, {
    attributes: true,
    attributeFilter: ["class"]
  });

  window.addEventListener("pageshow", updateGlobes);
};

initNavLangGlobe();
