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

const pageDefinitions = [
  {
    type: "gitesChambresPage",
    baseId: "gitesChambresPage.singleton",
    metadataId: "translation.metadata.gitesChambresPage.singleton",
    base: {
      heroLabel: "Gîtes & Chambres",
      heroLead: [
        "Des gîtes et chambres paisibles,",
        "dans un environnement naturel",
        "propice à la déconnexion.",
      ],
    },
    translations: {
      en: {
        heroLabel: "Cottages & Rooms",
        heroLead: [
          "Peaceful cottages and rooms,",
          "in a natural setting",
          "made for switching off.",
        ],
      },
      nl: {
        heroLabel: "Vakantiehuizen & Kamers",
        heroLead: [
          "Rustige vakantiehuizen en kamers,",
          "in een natuurlijke omgeving",
          "die uitnodigt om los te laten.",
        ],
      },
      de: {
        heroLabel: "Ferienhäuser & Zimmer",
        heroLead: [
          "Ruhige Ferienhäuser und Zimmer,",
          "in einer natürlichen Umgebung,",
          "die zum Abschalten einlädt.",
        ],
      },
    },
  },
  {
    type: "restaurationPage",
    baseId: "restaurationPage.singleton",
    metadataId: "translation.metadata.restaurationPage.singleton",
    base: {
      heroLabel: "Restauration sur place",
      heroLead: [
        "Commandez à l'avance et savourez dans votre gîte ou à la terrasse.",
        "Tous nos repas sont préparés avec soin, à emporter ou à déguster sur place.",
      ],
      dejeunersLabel: "À emporter",
      dejeunersTitre: "Petits déjeuners",
      dejeunersNote: "Commandez la veille avant 19h pour garantir la disponibilité.",
      repasLabel: "En groupe",
      repasTitre: "Repas conviviaux",
      repasNote: "Sur réservation · À partir de 2 personnes selon les formules.",
    },
    translations: {
      en: {
        heroLabel: "Dining on site",
        heroLead: [
          "Order in advance and enjoy it in your cottage or on the terrace.",
          "All our meals are carefully prepared, to take away or enjoy on site.",
        ],
        dejeunersLabel: "Take away",
        dejeunersTitre: "Breakfasts",
        dejeunersNote: "Order the day before by 7 pm to guarantee availability.",
        repasLabel: "For groups",
        repasTitre: "Shared meals",
        repasNote: "By reservation · From 2 people depending on the menu.",
      },
      nl: {
        heroLabel: "Ter plaatse eten",
        heroLead: [
          "Bestel vooraf en geniet in je vakantiehuis of op het terras.",
          "Al onze maaltijden worden met zorg bereid, om mee te nemen of ter plaatse te proeven.",
        ],
        dejeunersLabel: "Om mee te nemen",
        dejeunersTitre: "Ontbijten",
        dejeunersNote: "Bestel de dag voordien voor 19 uur om beschikbaarheid te garanderen.",
        repasLabel: "Voor groepen",
        repasTitre: "Gezellige maaltijden",
        repasNote: "Op reservatie · Vanaf 2 personen afhankelijk van de formules.",
      },
      de: {
        heroLabel: "Verpflegung vor Ort",
        heroLead: [
          "Bestellen Sie im Voraus und genießen Sie in Ihrer Unterkunft oder auf der Terrasse.",
          "Alle unsere Gerichte werden mit Sorgfalt zubereitet, zum Mitnehmen oder zum Genießen vor Ort.",
        ],
        dejeunersLabel: "Zum Mitnehmen",
        dejeunersTitre: "Frühstücke",
        dejeunersNote: "Bestellen Sie am Vortag vor 19 Uhr, um die Verfügbarkeit zu sichern.",
        repasLabel: "Für Gruppen",
        repasTitre: "Gesellige Mahlzeiten",
        repasNote: "Auf Reservierung · Ab 2 Personen je nach Angebot.",
      },
    },
  },
  {
    type: "partenairesPage",
    baseId: "partenairesPage.singleton",
    metadataId: "translation.metadata.partenairesPage.singleton",
    base: {
      introLabel: "Nos partenaires locaux",
      introTitre: [
        "Nos bonnes adresses autour du",
        "Domaine",
      ],
      introLead: [
        "Activités, bien-être et expériences locales: profitez d’avantages négociés pour nos hôtes.",
      ],
    },
    translations: {
      en: {
        introLabel: "Our local partners",
        introTitre: [
          "Our favourite places around the",
          "Estate",
        ],
        introLead: [
          "Activities, wellness and local experiences: enjoy exclusive benefits negotiated for our guests.",
        ],
      },
      nl: {
        introLabel: "Onze lokale partners",
        introTitre: [
          "Onze goede adressen rond het",
          "Domein",
        ],
        introLead: [
          "Activiteiten, wellness en lokale belevenissen: profiteer van exclusieve voordelen voor onze gasten.",
        ],
      },
      de: {
        introLabel: "Unsere lokalen Partner",
        introTitre: [
          "Unsere guten Adressen rund um das",
          "Landgut",
        ],
        introLead: [
          "Aktivitäten, Wellness und lokale Erlebnisse: Profitieren Sie von exklusiven Vorteilen für unsere Gäste.",
        ],
      },
    },
  },
  {
    type: "infrastructurePage",
    baseId: "infrastructurePage.singleton",
    metadataId: "translation.metadata.infrastructurePage.singleton",
    base: {
      heroLabel: "Infrastructures du Domaine",
      heroLead: [
        "Espaces et activités pour profiter du Domaine en famille ou en groupe, en toute saison.",
      ],
      highlightsLabel: "Ce qui vous attend sur place",
      highlightsTitre: [
        "Un carrousel d’espaces et d’activités",
        "pour profiter du Domaine en toute saison",
      ],
      fermeLabel: "La ferme du domaine",
      fermeTitre: [
        "Une immersion nature pour",
        "les petits comme les grands",
      ],
      fermeLead: [
        "La ferme apporte une dimension vivante au séjour: observation des animaux, découverte du rythme du domaine et moments de partage en famille.",
      ],
      fermeBody: [
        "Cette expérience complète les autres infrastructures du site en proposant une activité simple, locale et mémorable, à deux pas des hébergements.",
      ],
    },
    translations: {
      en: {
        heroLabel: "Estate facilities",
        heroLead: [
          "Spaces and activities to enjoy the Estate with family or as a group, in every season.",
        ],
        highlightsLabel: "What awaits you on site",
        highlightsTitre: [
          "A carousel of spaces and activities",
          "to enjoy the Estate in every season",
        ],
        fermeLabel: "The estate farm",
        fermeTitre: [
          "A nature immersion for",
          "young and old alike",
        ],
        fermeLead: [
          "The farm brings a living dimension to the stay: watching the animals, discovering the rhythm of the estate and sharing moments as a family.",
        ],
        fermeBody: [
          "This experience complements the other on-site facilities by offering a simple, local and memorable activity just steps from the accommodation.",
        ],
      },
      nl: {
        heroLabel: "Faciliteiten van het domein",
        heroLead: [
          "Ruimtes en activiteiten om als gezin of groep van het domein te genieten, in elk seizoen.",
        ],
        highlightsLabel: "Wat je ter plaatse te wachten staat",
        highlightsTitre: [
          "Een carrousel van ruimtes en activiteiten",
          "om in elk seizoen van het domein te genieten",
        ],
        fermeLabel: "De boerderij van het domein",
        fermeTitre: [
          "Een natuurbeleving voor",
          "jong en oud",
        ],
        fermeLead: [
          "De boerderij geeft het verblijf extra leven: dieren observeren, het ritme van het domein ontdekken en fijne familiemomenten delen.",
        ],
        fermeBody: [
          "Deze ervaring vult de andere faciliteiten op het domein aan met een eenvoudige, lokale en memorabele activiteit vlak bij de verblijven.",
        ],
      },
      de: {
        heroLabel: "Infrastruktur des Landguts",
        heroLead: [
          "Bereiche und Aktivitäten, um das Landgut mit der Familie oder in der Gruppe zu jeder Jahreszeit zu genießen.",
        ],
        highlightsLabel: "Was Sie vor Ort erwartet",
        highlightsTitre: [
          "Ein Karussell aus Bereichen und Aktivitäten,",
          "um das Landgut zu jeder Jahreszeit zu genießen",
        ],
        fermeLabel: "Der Bauernhof des Landguts",
        fermeTitre: [
          "Ein Naturerlebnis für",
          "Groß und Klein",
        ],
        fermeLead: [
          "Der Bauernhof bringt Leben in den Aufenthalt: Tiere beobachten, den Rhythmus des Landguts entdecken und gemeinsame Familienmomente erleben.",
        ],
        fermeBody: [
          "Dieses Erlebnis ergänzt die anderen Einrichtungen vor Ort durch eine einfache, lokale und unvergessliche Aktivität ganz in der Nähe der Unterkünfte.",
        ],
      },
    },
  },
];

function buildPortableText(lines, prefix) {
  return lines.map((line, index) => ({
    _key: `${prefix}-${index}`,
    _type: "block",
    children: [
      {
        _key: `${prefix}-${index}-span`,
        _type: "span",
        marks: [],
        text: line,
      },
    ],
    markDefs: [],
    style: "normal",
  }));
}

function normalizeDocFields(rawDoc, type, keyPrefix) {
  const doc = { _type: type, ...rawDoc };

  for (const [key, value] of Object.entries(doc)) {
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      doc[key] = buildPortableText(value, `${keyPrefix}-${key}`);
    }
  }

  return doc;
}

function buildTranslationEntry(type, language, docId) {
  return {
    _key: crypto.randomUUID(),
    _type: "internationalizedArrayReferenceValue",
    language,
    value: {
      _ref: docId,
      _type: "reference",
      _weak: true,
      _strengthenOnPublish: {
        type,
      },
    },
  };
}

async function readToken() {
  const configRaw = await fs.readFile(CONFIG_PATH, "utf8");
  const { authToken } = JSON.parse(configRaw);

  if (!authToken) {
    throw new Error(`Sanity auth token not found in ${CONFIG_PATH}`);
  }

  return authToken;
}

async function main() {
  const token = await readToken();
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    token,
  });

  const tx = client.transaction();

  for (const definition of pageDefinitions) {
    const { type, baseId, metadataId, base, translations } = definition;
    const existingDocs = await client.fetch(
      `*[_type == $type]{_id, language}`,
      { type },
    );
    const existingByLanguage = new Map(existingDocs.map((doc) => [doc.language ?? "base", doc._id]));

    if (!existingByLanguage.has("base")) {
      tx.createIfNotExists({
        _id: baseId,
        language: null,
        ...normalizeDocFields(base, type, `${type}-fr`),
      });
    }

    const ensuredTranslationIds = new Map();
    for (const language of TARGET_LANGUAGES) {
      const existingId = existingByLanguage.get(language);
      const docId = existingId || `${type}.i18n.${language}`;
      ensuredTranslationIds.set(language, docId);

      if (!existingId) {
        tx.createIfNotExists({
          _id: docId,
          language,
          ...normalizeDocFields(translations[language], type, `${type}-${language}`),
        });
      }
    }

    const metadataDoc = await client.fetch(
      `*[_type == "translation.metadata" && _id == $metadataId][0]`,
      { metadataId },
    );
    const requiredEntries = TARGET_LANGUAGES.map((language) =>
      buildTranslationEntry(type, language, ensuredTranslationIds.get(language)),
    );

    if (!metadataDoc) {
      tx.createIfNotExists({
        _id: metadataId,
        _type: "translation.metadata",
        schemaTypes: [type],
        translations: requiredEntries,
      });
    } else {
      const existingTranslations = Array.isArray(metadataDoc.translations)
        ? metadataDoc.translations.filter(
            (entry) => !TARGET_LANGUAGES.includes(entry?.language),
          )
        : [];

      tx.patch(metadataId, {
        set: {
          schemaTypes: [type],
          translations: [...existingTranslations, ...requiredEntries],
        },
      });
    }
  }

  const result = await tx.commit();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
