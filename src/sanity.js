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

export async function fetchLocalizedSingleton(type, options = {}) {
  const { extraFilter = "" } = options;
  const currentLanguage = getCurrentLanguage();
  const params = { type, language: currentLanguage, defaultLanguage: DEFAULT_LANGUAGE };
  const baseQuery = buildFilter(extraFilter);

  const localized = await client.fetch(`${baseQuery} && language == $language][0]`, params);
  if (localized) return localized;

  const untranslated = await client.fetch(`${baseQuery} && !defined(language)][0]`, params);
  if (untranslated) return untranslated;

  if (currentLanguage !== DEFAULT_LANGUAGE) {
    return client.fetch(`${baseQuery} && language == $defaultLanguage][0]`, params);
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
