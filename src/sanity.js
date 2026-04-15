import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { DEFAULT_LANGUAGE, getCurrentLanguage } from "./i18n.js";

export const client = createClient({
  projectId: 'z25t0wsp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const builder = imageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)

const buildOrderSegment = (orderBy) => (orderBy ? ` | order(${orderBy})` : "");

const buildFilter = (extraFilter = "") =>
  `*[_type == $type${extraFilter ? ` && ${extraFilter}` : ""}`;

const BASE_SITE_URL = "https://www.lasourcedarimont.be";

function setMetaTag(attr, value, content) {
  const el = document.querySelector(`meta[${attr}="${value}"]`);
  if (el) el.setAttribute("content", content);
}

export function applyPageSeo(doc) {
  if (!doc) return;

  const title = doc.seo?.title || doc.name;
  const description = doc.seo?.description;
  const slug = doc.seo?.slug?.current;
  const noIndex = doc.seo?.noIndex;

  if (title) {
    document.title = title;
    setMetaTag("property", "og:title", title);
  }

  if (description) {
    setMetaTag("name", "description", description);
    setMetaTag("property", "og:description", description);
  }

  if (slug !== undefined) {
    const url = slug ? `${BASE_SITE_URL}/${slug}/` : `${BASE_SITE_URL}/`;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
    setMetaTag("property", "og:url", url);
  }

  if (noIndex) {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
  }
}

export async function fetchPageConfig(pageId) {
  const currentLanguage = getCurrentLanguage();
  const params = { pageId, language: currentLanguage, defaultLanguage: DEFAULT_LANGUAGE };

  const localized = await client.fetch(
    `*[_type == "pageConfig" && pageId == $pageId && language == $language][0]`,
    params
  );
  if (localized) return localized;

  const untranslated = await client.fetch(
    `*[_type == "pageConfig" && pageId == $pageId && !defined(language)][0]`,
    params
  );
  if (untranslated) return untranslated;

  if (currentLanguage !== DEFAULT_LANGUAGE) {
    return client.fetch(
      `*[_type == "pageConfig" && pageId == $pageId && language == $defaultLanguage][0]`,
      params
    );
  }

  return null;
}

export async function fetchLocalizedSingleton(type, options = {}) {
  const { extraFilter = "", projection = "" } = options;
  const currentLanguage = getCurrentLanguage();
  const params = { type, language: currentLanguage, defaultLanguage: DEFAULT_LANGUAGE };
  const baseQuery = buildFilter(extraFilter);
  const proj = projection ? `{ ..., ${projection} }` : "";

  const localized = await client.fetch(`${baseQuery} && language == $language][0]${proj}`, params);
  if (localized) return localized;

  const untranslated = await client.fetch(`${baseQuery} && !defined(language)][0]${proj}`, params);
  if (untranslated) return untranslated;

  if (currentLanguage !== DEFAULT_LANGUAGE) {
    return client.fetch(`${baseQuery} && language == $defaultLanguage][0]${proj}`, params);
  }

  return null;
}

export async function fetchLocalizedCollection(type, options = {}) {
  const { extraFilter = "", orderBy = "order asc" } = options;
  const currentLanguage = getCurrentLanguage();
  const params = { type, language: currentLanguage, defaultLanguage: DEFAULT_LANGUAGE };
  const baseQuery = buildFilter(extraFilter);
  const orderSegment = buildOrderSegment(orderBy);

  const localized = await client.fetch(`${baseQuery} && language == $language]${orderSegment}`, params);
  if (localized?.length) return localized;

  const untranslated = await client.fetch(`${baseQuery} && !defined(language)]${orderSegment}`, params);
  if (untranslated?.length) return untranslated;

  if (currentLanguage !== DEFAULT_LANGUAGE) {
    return client.fetch(`${baseQuery} && language == $defaultLanguage]${orderSegment}`, params);
  }

  return [];
}

/**
 * Applique un objet heroMedia Sanity aux éléments video/image d'un hero/banner.
 * @param {object} media        Champ heroMedia depuis Sanity
 * @param {object} selectors    { videoDesktop, videoMobile, imgDesktop, imgMobile }
 * @param {function} urlForFn   Fonction urlFor du client Sanity
 */
export function applyHeroMedia(media, selectors, urlForFn) {
  if (!media) return;

  const { videoDesktop, videoMobile, imgDesktop, imgMobile } = selectors;
  const isVideo = media.mediaType === "video";

  if (isVideo) {
    if (videoDesktop instanceof HTMLVideoElement && media.videoDesktop?.asset?.url) {
      const src = videoDesktop.querySelector("source");
      if (src) src.src = media.videoDesktop.asset.url;
      videoDesktop.load();
    }
    if (videoMobile instanceof HTMLVideoElement && media.videoMobile?.asset?.url) {
      const src = videoMobile.querySelector("source");
      if (src) src.src = media.videoMobile.asset.url;
      videoMobile.load();
    }
    if (media.fallbackDesktop) {
      const url = urlForFn(media.fallbackDesktop).width(1920).url();
      if (videoDesktop instanceof HTMLVideoElement) videoDesktop.poster = url;
      if (imgDesktop instanceof HTMLImageElement) imgDesktop.src = url;
    }
    if (media.fallbackMobile) {
      const url = urlForFn(media.fallbackMobile).width(980).url();
      if (videoMobile instanceof HTMLVideoElement) videoMobile.poster = url;
      if (imgMobile instanceof HTMLSourceElement) imgMobile.srcset = url;
    }
  } else {
    if (videoDesktop instanceof HTMLVideoElement) { videoDesktop.pause(); videoDesktop.style.display = "none"; }
    if (videoMobile instanceof HTMLVideoElement) { videoMobile.pause(); videoMobile.style.display = "none"; }
    if (media.photoDesktop && imgDesktop instanceof HTMLImageElement) {
      imgDesktop.src = urlForFn(media.photoDesktop).width(1920).url();
    }
    if (media.photoMobile && imgMobile instanceof HTMLSourceElement) {
      imgMobile.srcset = urlForFn(media.photoMobile).width(980).url();
    }
  }
}
