import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@sanity/client";

const PROJECT_ID = "z25t0wsp";
const DATASET = "production";
const API_VERSION = "2025-08-15";
const CONFIG_PATH = path.join(os.homedir(), ".config", "sanity", "config.json");
const ROOT = process.cwd();
const TARGET_LANGUAGES = ["en", "nl", "de"];

const slideDefinitions = [
  {
    slug: "outdoor-relaxation",
    order: 0,
    imagePath: "public/img/slider/domaine.jpg",
    fr: {
      title: "Espaces extérieurs et détente",
      description:
        "Grandes zones vertes, coins repos et circulation facile dans le domaine: idéal pour alterner activités et moments calmes.",
      points: [
        "Espaces ouverts pour respirer et se retrouver",
        "Ambiance nature à deux pas des hébergements",
        "Cadre adapté aux séjours en couple, famille ou groupe",
      ],
      imageAlt: "Vue extérieure du Domaine de la Source d'Arimont",
    },
    en: {
      title: "Outdoor spaces and relaxation",
      description:
        "Large green areas, quiet corners and easy circulation throughout the estate: ideal for alternating activities and calm moments.",
      points: [
        "Open spaces to breathe and gather together",
        "A natural atmosphere just steps from the accommodation",
        "A setting suited to stays as a couple, family or group",
      ],
      imageAlt: "Outdoor view of the La Source d'Arimont estate",
    },
    nl: {
      title: "Buitenruimtes en ontspanning",
      description:
        "Grote groenzones, rustplekken en vlotte circulatie op het domein: ideaal om activiteiten af te wisselen met kalme momenten.",
      points: [
        "Open ruimtes om te ademen en samen te komen",
        "Natuurlijke sfeer vlak bij de verblijven",
        "Een kader dat past bij verblijven als koppel, gezin of groep",
      ],
      imageAlt: "Buitenaanzicht van het domein La Source d'Arimont",
    },
    de: {
      title: "Außenbereiche und Entspannung",
      description:
        "Große Grünflächen, Ruhezonen und kurze Wege auf dem Landgut: ideal, um Aktivitäten und ruhige Momente abzuwechseln.",
      points: [
        "Offene Bereiche zum Durchatmen und Zusammensein",
        "Naturstimmung nur wenige Schritte von den Unterkünften entfernt",
        "Ein Rahmen für Aufenthalte zu zweit, mit der Familie oder in der Gruppe",
      ],
      imageAlt: "Außenansicht des Landguts La Source d'Arimont",
    },
  },
  {
    slug: "family-play",
    order: 1,
    imagePath: "public/img/region/lac_card.webp",
    fr: {
      title: "Aires de jeux et moments en famille",
      description:
        "Les enfants profitent d'espaces adaptés pendant que les adultes gardent un vrai confort de séjour, sans devoir quitter le domaine.",
      points: [
        "Zones de jeux sécurisées pour varier les activités",
        "Organisation simple pour les familles avec enfants",
        "Bonne répartition entre animation et tranquillité",
      ],
      imageAlt: "Famille profitant des activités autour du domaine",
    },
    en: {
      title: "Play areas and family moments",
      description:
        "Children enjoy adapted spaces while adults keep real comfort throughout the stay, without having to leave the estate.",
      points: [
        "Safe play areas to vary the activities",
        "Easy organisation for families with children",
        "A good balance between activity and quiet time",
      ],
      imageAlt: "Family enjoying activities around the estate",
    },
    nl: {
      title: "Speelzones en familiemomenten",
      description:
        "Kinderen genieten van aangepaste ruimtes terwijl volwassenen echt verblijfcomfort behouden, zonder het domein te moeten verlaten.",
      points: [
        "Veilige speelzones om activiteiten af te wisselen",
        "Eenvoudige organisatie voor gezinnen met kinderen",
        "Goede balans tussen levendigheid en rust",
      ],
      imageAlt: "Gezin dat geniet van activiteiten rond het domein",
    },
    de: {
      title: "Spielbereiche und Familienmomente",
      description:
        "Kinder genießen angepasste Bereiche, während Erwachsene echten Aufenthaltskomfort behalten, ohne das Landgut verlassen zu müssen.",
      points: [
        "Sichere Spielbereiche für abwechslungsreiche Aktivitäten",
        "Einfache Organisation für Familien mit Kindern",
        "Gute Balance zwischen Aktivität und Ruhe",
      ],
      imageAlt: "Familie bei Aktivitäten rund um das Landgut",
    },
  },
  {
    slug: "group-friendly",
    order: 2,
    imagePath: "public/img/hero_v3.webp",
    fr: {
      title: "Infrastructure pensée pour les groupes",
      description:
        "Le site facilite les séjours collectifs: circulation fluide, lieux de rassemblement et espaces compatibles avec les événements privés ou pros.",
      points: [
        "Configuration pratique pour séminaires et réunions",
        "Atmosphère chaleureuse pour les week-ends entre amis",
        "Accès rapide aux autres pôles du domaine",
      ],
      imageAlt: "Infrastructures du Domaine pour accueillir des groupes",
    },
    en: {
      title: "Facilities designed for groups",
      description:
        "The site makes group stays easier: fluid circulation, gathering spots and spaces suited to private or professional events.",
      points: [
        "A practical setup for seminars and meetings",
        "A warm atmosphere for weekends with friends",
        "Quick access to the estate's other areas",
      ],
      imageAlt: "Estate facilities designed to host groups",
    },
    nl: {
      title: "Infrastructuur voor groepen",
      description:
        "De site maakt groepsverblijven eenvoudiger: vlotte circulatie, verzamelplekken en ruimtes die geschikt zijn voor privé- of professionele evenementen.",
      points: [
        "Praktische indeling voor seminaries en vergaderingen",
        "Warme sfeer voor weekends met vrienden",
        "Snelle toegang tot de andere zones van het domein",
      ],
      imageAlt: "Infrastructuur van het domein voor groepen",
    },
    de: {
      title: "Infrastruktur für Gruppen",
      description:
        "Das Gelände erleichtert Gruppenaufenthalte: fließende Wege, Treffpunkte und Bereiche für private oder berufliche Veranstaltungen.",
      points: [
        "Praktische Konfiguration für Seminare und Treffen",
        "Warme Atmosphäre für Wochenenden mit Freunden",
        "Schneller Zugang zu den anderen Bereichen des Landguts",
      ],
      imageAlt: "Infrastruktur des Landguts für Gruppen",
    },
  },
];

const farmPhotoDefinitions = [
  {
    slug: "goats",
    order: 0,
    imagePath: "public/img/slider/chevres.jpg",
    fr: {
      alt: "Chèvres dans la ferme du Domaine",
      caption: "Les chèvres du domaine, une rencontre incontournable pour les enfants.",
    },
    en: {
      alt: "Goats at the estate farm",
      caption: "The estate's goats, a must-see encounter for children.",
    },
    nl: {
      alt: "Geiten op de boerderij van het domein",
      caption: "De geiten van het domein, een ontmoeting die kinderen niet snel vergeten.",
    },
    de: {
      alt: "Ziegen auf dem Bauernhof des Landguts",
      caption: "Die Ziegen des Landguts, eine unvergessliche Begegnung für Kinder.",
    },
  },
  {
    slug: "horse-prairie",
    order: 1,
    imagePath: "public/img/slider/cheval_15_11zon.jpg",
    fr: {
      alt: "Cheval dans la prairie du Domaine",
      caption: "Un environnement vivant qui valorise la nature et la proximité avec les animaux.",
    },
    en: {
      alt: "Horse in the estate meadow",
      caption: "A living environment that highlights nature and closeness to animals.",
    },
    nl: {
      alt: "Paard in de weide van het domein",
      caption: "Een levendige omgeving die natuur en nabijheid van dieren centraal stelt.",
    },
    de: {
      alt: "Pferd auf der Wiese des Landguts",
      caption: "Eine lebendige Umgebung, in der Natur und die Nähe zu Tieren im Mittelpunkt stehen.",
    },
  },
  {
    slug: "farm-animals",
    order: 2,
    imagePath: "public/img/slider/cheval2_16_11zon.jpg",
    fr: {
      alt: "Animaux de la ferme du Domaine",
      caption: "La ferme complète l'expérience du séjour avec une activité simple et authentique.",
    },
    en: {
      alt: "Animals at the estate farm",
      caption: "The farm completes the stay with a simple and authentic activity.",
    },
    nl: {
      alt: "Dieren op de boerderij van het domein",
      caption: "De boerderij vult de verblijfservaring aan met een eenvoudige en authentieke activiteit.",
    },
    de: {
      alt: "Tiere auf dem Bauernhof des Landguts",
      caption: "Der Bauernhof ergänzt den Aufenthalt mit einer einfachen und authentischen Aktivität.",
    },
  },
  {
    slug: "wildlife",
    order: 3,
    imagePath: "public/img/slider/fox.jpg",
    fr: {
      alt: "Vie sauvage observée autour du Domaine",
      caption: "Un cadre ardennais riche, à observer tout au long de l'année.",
    },
    en: {
      alt: "Wildlife spotted around the estate",
      caption: "A rich Ardennes setting to observe throughout the year.",
    },
    nl: {
      alt: "Wilde dieren rond het domein",
      caption: "Een rijke Ardense omgeving om het hele jaar door te observeren.",
    },
    de: {
      alt: "Wildtiere rund um das Landgut",
      caption: "Eine reiche Ardennenlandschaft, die man das ganze Jahr über beobachten kann.",
    },
  },
];

function buildTranslationEntry(type, language, docId) {
  return {
    _key: crypto.randomUUID(),
    _type: "internationalizedArrayReferenceValue",
    language,
    value: {
      _ref: docId,
      _type: "reference",
      _weak: true,
      _strengthenOnPublish: { type },
    },
  };
}

async function readToken() {
  const configRaw = await fsp.readFile(CONFIG_PATH, "utf8");
  const { authToken } = JSON.parse(configRaw);
  if (!authToken) throw new Error(`Sanity auth token not found in ${CONFIG_PATH}`);
  return authToken;
}

async function withRetry(fn, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = attempt * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function ensureAsset(client, relativePath) {
  const filename = path.basename(relativePath);
  const existing = await withRetry(() =>
    client.fetch(
      `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
      { filename },
    ),
  );
  if (existing?._id) return { _type: "image", asset: { _type: "reference", _ref: existing._id } };

  const absolutePath = path.join(ROOT, relativePath);
  const asset = await withRetry(() => {
    const stream = fs.createReadStream(absolutePath);
    return client.assets.upload("image", stream, { filename });
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function ensureCollectionItems(client, tx, type, items, mapDoc) {
  for (const item of items) {
    const baseId = `${type}.${item.slug}`;
    const metadataId = `translation.metadata.${type}.${item.slug}`;
    const image = await ensureAsset(client, item.imagePath);

    const existingDocs = await client.fetch(
      `*[_type == $type && order == $order]{_id, language}`,
      { type, order: item.order },
    );
    const existingByLanguage = new Map(
      existingDocs.map((doc) => [doc.language ?? "base", doc._id]),
    );

    if (!existingByLanguage.has("base")) {
      tx.createIfNotExists({
        _id: baseId,
        _type: type,
        language: null,
        order: item.order,
        image,
        ...mapDoc(item.fr),
      });
    }

    const requiredEntries = [];
    for (const language of TARGET_LANGUAGES) {
      const existingId = existingByLanguage.get(language);
      const docId = existingId || `${baseId}.i18n.${language}`;
      requiredEntries.push(buildTranslationEntry(type, language, docId));

      if (!existingId) {
        tx.createIfNotExists({
          _id: docId,
          _type: type,
          language,
          order: item.order,
          image,
          ...mapDoc(item[language]),
        });
      }
    }

    const metadataDoc = await client.fetch(
      `*[_type == "translation.metadata" && _id == $metadataId][0]`,
      { metadataId },
    );

    if (!metadataDoc) {
      tx.createIfNotExists({
        _id: metadataId,
        _type: "translation.metadata",
        schemaTypes: [type],
        translations: requiredEntries,
      });
    } else {
      const preserved = Array.isArray(metadataDoc.translations)
        ? metadataDoc.translations.filter((entry) => !TARGET_LANGUAGES.includes(entry?.language))
        : [];
      tx.patch(metadataId, {
        set: {
          schemaTypes: [type],
          translations: [...preserved, ...requiredEntries],
        },
      });
    }
  }
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

  await ensureCollectionItems(client, tx, "infraSlide", slideDefinitions, (doc) => ({
    title: doc.title,
    description: doc.description,
    points: doc.points,
    imageAlt: doc.imageAlt,
  }));

  await ensureCollectionItems(client, tx, "farmPhoto", farmPhotoDefinitions, (doc) => ({
    alt: doc.alt,
    caption: doc.caption,
  }));

  const result = await tx.commit();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
