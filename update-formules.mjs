import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "z25t0wsp",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const formules = [
  // ── Petits déjeuners ──────────────────────────────────────────────────────
  {
    _type: "formule",
    _id: "formule-leger",
    name: "Le Léger",
    categorie: "petitDejeuner",
    type: "standard",
    prix: "8€",
    plats: [
      "1 viennoiserie (croissant, pain au chocolat…)",
      "1 jus de pomme artisanal",
      "1 boisson chaude",
    ],
    order: 1,
  },
  {
    _type: "formule",
    _id: "formule-sale",
    name: "Le Salé",
    categorie: "petitDejeuner",
    type: "standard",
    prix: "12€",
    plats: [
      "1 tranche de jambon",
      "1 tranche de fromage",
      "1 œuf",
      "Beurre",
      "Baguette ou pain",
      "1 jus de pomme artisanal",
      "1 boisson chaude",
    ],
    order: 2,
  },
  {
    _type: "formule",
    _id: "formule-sucre",
    name: "Le Sucré",
    categorie: "petitDejeuner",
    type: "standard",
    prix: "10€",
    plats: [
      "1 viennoiserie",
      "1 gaufre + crème chantilly",
      "Baguette ou pain",
      "Confiture",
    ],
    order: 3,
  },
  {
    _type: "formule",
    _id: "formule-complet",
    name: "Le Complet",
    categorie: "petitDejeuner",
    type: "featured",
    badge: "Le plus gourmand",
    prix: "20€",
    plats: [
      "1 viennoiserie",
      "1 gaufre + chantilly",
      "Baguette ou pain + confiture",
      "1 tranche de jambon",
      "1 tranche de fromage",
      "1 yaourt",
      "1 œuf",
      "1 jus de pomme artisanal",
      "1 boisson chaude",
    ],
    order: 4,
  },

  // ── Repas ─────────────────────────────────────────────────────────────────
  {
    _type: "formule",
    _id: "formule-fromages",
    name: "Plateau Fromages",
    categorie: "repas",
    type: "standard",
    service: "À partir de 2 personnes",
    prix: "18€ / pers.",
    plats: [
      "Sélection de fromages de la région",
      "Plateau décoré de fruits secs",
      "Pain ou baguette",
    ],
    order: 5,
  },
  {
    _type: "formule",
    _id: "formule-gourmet",
    name: "Gourmet",
    categorie: "repas",
    type: "standard",
    badge: "Raclette",
    service: "À partir de 2 personnes",
    prix: "19€ / pers.",
    plats: [
      "Charcuterie",
      "Pommes de terre",
      "Oignons et cornichons",
      "Salade, concombre, tomates + sauce",
      "Appareil à raclette",
    ],
    order: 6,
  },
  {
    _type: "formule",
    _id: "formule-fondue",
    name: "Fondue Suisse",
    categorie: "repas",
    type: "featured",
    service: "Option charcuterie sur demande",
    prix: "21€ / pers.",
    plats: [
      "Baguette",
      "Gruyère & Vacherin fribourgeois + vin blanc",
      "Caquelon à fondue",
    ],
    order: 7,
  },
  {
    _type: "formule",
    _id: "formule-choucroute",
    name: "Choucroute",
    categorie: "repas",
    type: "standard",
    badge: "En saison",
    service: "Option hivernale traditionnelle",
    prix: "Prix à déterminer",
    plats: [],
    order: 8,
  },
];

async function run() {
  // Supprimer les anciennes formules
  const existing = await client.fetch(`*[_type == "formule"]._id`);
  if (existing.length) {
    const tx = client.transaction();
    existing.forEach((id) => tx.delete(id));
    await tx.commit();
    console.log(`✓ ${existing.length} anciennes formules supprimées`);
  }

  // Créer les nouvelles
  const tx = client.transaction();
  formules.forEach((f) => tx.createOrReplace(f));
  await tx.commit();
  console.log(`✓ ${formules.length} formules créées`);
}

run().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
