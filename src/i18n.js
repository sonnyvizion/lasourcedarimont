export const SUPPORTED_LANGUAGES = ["fr", "en", "nl", "de"];
export const DEFAULT_LANGUAGE = "fr";
export const LANGUAGE_LABELS = {
  fr: "FR",
  en: "EN",
  nl: "NL",
  de: "DE",
};
const STORAGE_KEY = "arimont_language";

const isSupportedLanguage = (value) => SUPPORTED_LANGUAGES.includes((value || "").toLowerCase());

const getLanguageFromPath = () => {
  const [firstSegment = ""] = window.location.pathname.split("/").filter(Boolean);
  return isSupportedLanguage(firstSegment) ? firstSegment.toLowerCase() : null;
};

const getLanguageFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("lang");
  return isSupportedLanguage(value) ? value.toLowerCase() : null;
};

export const getCurrentLanguage = () => {
  const fromPath = getLanguageFromPath();
  if (fromPath) return fromPath;

  const fromQuery = getLanguageFromQuery();
  if (fromQuery) return fromQuery;

  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (isSupportedLanguage(fromStorage)) return fromStorage.toLowerCase();

  return DEFAULT_LANGUAGE;
};

export const setCurrentLanguage = (language) => {
  const safeLanguage = isSupportedLanguage(language) ? language.toLowerCase() : DEFAULT_LANGUAGE;
  window.localStorage.setItem(STORAGE_KEY, safeLanguage);
  document.documentElement.lang = safeLanguage;
  return safeLanguage;
};

export const buildLanguageUrl = (language) => {
  const safeLanguage = isSupportedLanguage(language) ? language.toLowerCase() : DEFAULT_LANGUAGE;
  const url = new URL(window.location.href);
  url.searchParams.set("lang", safeLanguage);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const initLanguageDocumentState = () => {
  setCurrentLanguage(getCurrentLanguage());
};
