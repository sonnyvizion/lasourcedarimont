import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@sanity/client";

const PROJECT_ID = "z25t0wsp";
const DATASET = "production";
const API_VERSION = "2025-08-15";
const CONFIG_PATH = path.join(os.homedir(), ".config", "sanity", "config.json");
const TARGET_LANGUAGES = ["en", "nl", "de"];

const TRANSLATIONS = {
  en: {
    heroLabel: "Discover the region",
    carteLabel: "Explore around Spa-Francorchamps",
    carteTitre: [
      {
        _key: "region-title-en",
        _type: "block",
        children: [
          {
            _key: "region-title-en-1",
            _type: "span",
            marks: [],
            text: "From the ",
          },
          {
            _key: "region-title-en-2",
            _type: "span",
            marks: ["strong", "em"],
            text: "Estate",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  },
  nl: {
    heroLabel: "Ontdek de regio",
    carteLabel: "Verken rond Spa-Francorchamps",
    carteTitre: [
      {
        _key: "region-title-nl",
        _type: "block",
        children: [
          {
            _key: "region-title-nl-1",
            _type: "span",
            marks: [],
            text: "Vanuit het ",
          },
          {
            _key: "region-title-nl-2",
            _type: "span",
            marks: ["strong", "em"],
            text: "domein",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  },
  de: {
    heroLabel: "Die Region entdecken",
    carteLabel: "Rund um Spa-Francorchamps entdecken",
    carteTitre: [
      {
        _key: "region-title-de",
        _type: "block",
        children: [
          {
            _key: "region-title-de-1",
            _type: "span",
            marks: [],
            text: "Vom ",
          },
          {
            _key: "region-title-de-2",
            _type: "span",
            marks: ["strong", "em"],
            text: "Landgut",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  },
};

function buildTranslationDocId(language) {
  return `regionPage.i18n.${language}`;
}

function buildTranslationEntry(language, docId) {
  return {
    _key: crypto.randomUUID(),
    _type: "internationalizedArrayReferenceValue",
    language,
    value: {
      _ref: docId,
      _type: "reference",
      _weak: true,
      _strengthenOnPublish: {
        type: "regionPage",
      },
    },
  };
}

async function main() {
  const configRaw = await fs.readFile(CONFIG_PATH, "utf8");
  const { authToken } = JSON.parse(configRaw);

  if (!authToken) {
    throw new Error(`Sanity auth token not found in ${CONFIG_PATH}`);
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    token: authToken,
  });

  const [sourceDoc, localizedDocs, metadataDoc] = await Promise.all([
    client.fetch(`*[_type == "regionPage" && !defined(language)][0]`),
    client.fetch(`*[_type == "regionPage" && defined(language)]{_id, language}`),
    client.fetch(`*[_type == "translation.metadata" && "regionPage" in schemaTypes][0]`),
  ]);

  if (!sourceDoc) {
    throw new Error("No base regionPage document found");
  }

  const localizedByLanguage = new Map(
    localizedDocs.map((doc) => [doc.language, doc._id]),
  );

  const tx = client.transaction();
  const ensuredIds = new Map();

  for (const language of TARGET_LANGUAGES) {
    const existingId = localizedByLanguage.get(language);
    const targetId = existingId || buildTranslationDocId(language);
    ensuredIds.set(language, targetId);

    if (existingId) {
      continue;
    }

    const translation = TRANSLATIONS[language];

    tx.createIfNotExists({
      ...sourceDoc,
      _id: targetId,
      _type: "regionPage",
      language,
      heroLabel: translation.heroLabel,
      carteLabel: translation.carteLabel,
      carteTitre: translation.carteTitre,
      _createdAt: undefined,
      _updatedAt: undefined,
      _rev: undefined,
      _system: undefined,
    });
  }

  const requiredEntries = TARGET_LANGUAGES.map((language) =>
    buildTranslationEntry(language, ensuredIds.get(language)),
  );

  if (!metadataDoc) {
    tx.createIfNotExists({
      _id: "translation.metadata.regionPage.singleton",
      _type: "translation.metadata",
      schemaTypes: ["regionPage"],
      translations: requiredEntries,
    });
  } else {
    const existingTranslations = Array.isArray(metadataDoc.translations)
      ? metadataDoc.translations.filter(
          (entry) => !TARGET_LANGUAGES.includes(entry?.language),
        )
      : [];

    tx.patch(metadataDoc._id, {
      set: {
        schemaTypes: ["regionPage"],
        translations: [...existingTranslations, ...requiredEntries],
      },
    });
  }

  const result = await tx.commit();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
