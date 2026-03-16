import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  buildLanguageUrl,
  getCurrentLanguage,
  initLanguageDocumentState,
  setCurrentLanguage,
} from "./i18n.js";
import { applyStaticTranslations } from "./static-translations.js";

const BASE_URL = import.meta.env.BASE_URL || "/";
const GREY_GLOBE_PATH = `${BASE_URL}img/Grey Globe.json`;
const GREEN_GLOBE_PATH = `${BASE_URL}img/Green Globe.json`;

const injectMobileLangMenu = () => {
  const mobileMenuInner = document.querySelector(".mobile-menu-inner");
  const desktopLang = document.querySelector(".site-header .nav-lang");
  if (!mobileMenuInner || !desktopLang) return;
  if (mobileMenuInner.querySelector(".mobile-nav-lang")) return;

  const mobileLang = desktopLang.cloneNode(true);
  mobileLang.classList.add("mobile-nav-lang");
  mobileLang.classList.remove("is-open");

  const trigger = mobileLang.querySelector(".nav-lang-trigger");
  if (trigger) {
    trigger.setAttribute("aria-expanded", "false");
  }

  const socialBlock = mobileMenuInner.querySelector(".mobile-menu-social");
  if (socialBlock) {
    mobileMenuInner.insertBefore(mobileLang, socialBlock);
    return;
  }

  mobileMenuInner.appendChild(mobileLang);
};

const applyLanguageLinks = () => {
  const currentLanguage = setCurrentLanguage(getCurrentLanguage());

  document.querySelectorAll(".nav-lang").forEach((block) => {
    const currentEl = block.querySelector(".nav-lang-current");
    if (currentEl) currentEl.textContent = LANGUAGE_LABELS[currentLanguage] || currentLanguage.toUpperCase();

    const menu = block.querySelector(".nav-lang-menu");
    if (!menu) return;

    menu.innerHTML = SUPPORTED_LANGUAGES.map((language) => {
      const isCurrent = language === currentLanguage;
      const ariaCurrent = isCurrent ? ' aria-current="true"' : "";
      return `<a href="${buildLanguageUrl(language)}" role="menuitem" lang="${language}"${ariaCurrent}>${LANGUAGE_LABELS[language] || language.toUpperCase()}</a>`;
    }).join("");
  });
};

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
  const isHomePage = bodyEl.classList.contains("home-page");
  if (isHomePage) {
    return headerEl.classList.contains("is-solid");
  }
  return true;
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

initLanguageDocumentState();
applyStaticTranslations();
injectMobileLangMenu();
applyLanguageLinks();
initNavLangGlobe();

const initNavLangMenu = () => {
  const langBlocks = document.querySelectorAll(".nav-lang");
  if (!langBlocks.length) return;

  const closeAll = () => {
    langBlocks.forEach((block) => {
      block.classList.remove("is-open");
      const trigger = block.querySelector(".nav-lang-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  };

  langBlocks.forEach((block) => {
    const trigger = block.querySelector(".nav-lang-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpen = block.classList.contains("is-open");
      closeAll();
      if (!isOpen) {
        block.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const insideAny = Array.from(langBlocks).some((block) => block.contains(target));
    if (!insideAny) closeAll();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
  });
};

initNavLangMenu();
