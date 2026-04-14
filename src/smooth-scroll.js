import Lenis from "lenis";

const isIOSDevice = () =>
  /iP(ad|hone|od)/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const initSmoothScroll = () => {
  if (typeof window === "undefined") return null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || isIOSDevice()) return null;

  const existing = window.__arimontLenisInstance;
  if (existing) return existing;

  const lenis = new Lenis({
    smoothWheel: true,
    smoothTouch: false,
    lerp: 0.08
  });

  const raf = (time) => {
    lenis.raf(time);
    window.__arimontLenisRafId = window.requestAnimationFrame(raf);
  };

  window.__arimontLenisRafId = window.requestAnimationFrame(raf);
  window.__arimontLenisInstance = lenis;

  window.addEventListener(
    "pagehide",
    () => {
      const rafId = window.__arimontLenisRafId;
      if (typeof rafId === "number") {
        window.cancelAnimationFrame(rafId);
      }
      lenis.destroy();
      window.__arimontLenisInstance = null;
      window.__arimontLenisRafId = null;
    },
    { once: true }
  );

  return lenis;
};
