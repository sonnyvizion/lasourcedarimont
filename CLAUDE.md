# Domaine de la Source d'Arimont — CLAUDE.md

## Projet

Site vitrine statique pour le gite "Domaine de la Source d'Arimont".
Objectifs : présenter le gite, informer sur les hébergements/tarifs/disponibilités, faciliter la prise de contact et la réservation.

## Stack

- **HTML/CSS/JS** — site statique multi-pages, pas de framework
- **Vite** — outillage (dev server + build)
- **GSAP** — animations
- **Lenis** — smooth scroll
- Base URL de déploiement : `/lasourcedarimont/`

## Commandes

```bash
npm run dev      # serveur de développement
npm run build    # build de production → dist/
npm run preview  # prévisualiser le build
```

## Structure des fichiers

```
/                          # racine
├── index.html             # Accueil
├── gites-chambres.html    # Hébergements
├── la-region.html         # La région / activités
├── nos-partenaires.html   # Partenaires
├── restauration.html      # Restauration
├── src/
│   ├── main.js            # JS commun + init Lenis
│   ├── style.css          # CSS global
│   ├── nav.css            # Navigation
│   ├── nav-lang-globe.js  # Sélecteur de langue
│   ├── home.css / home.js (si présent)
│   ├── gites-chambres.css / .js
│   ├── la-region.css / .js
│   ├── nos-partenaires.css / .js
│   ├── restauration.css / .js
│   └── booking-request.js
├── public/                # Assets statiques (images, vidéos, fonts)
├── vite.config.js
├── context.md             # Cahier des charges initial
├── decisions.md           # Journal des décisions
└── font.md                # Décisions typographiques
```

## Pages prévues (non encore créées)

- Galerie (grille photos par catégories : intérieur, extérieur, alentours)
- Contact / Réservation (formulaire + carte + coordonnées)
- Mentions légales / Confidentialité (RGPD)

## Conventions

- **Langue du code** : français pour les commentaires et noms de variables métier
- **Ton éditorial** : chaleureux, naturel, premium simple — mettre en avant la nature, le repos, l'authenticité
- **Langues du site** : FR / NL / EN (contenus parallèles, gérés par `nav-lang-globe.js`)
- **Pas de framework CSS** : tout le style est écrit à la main
- **Animations** : utiliser GSAP ; smooth scroll via Lenis (initialisé dans `main.js`)
- **Multi-pages Vite** : chaque nouvelle page HTML doit être déclarée dans `vite.config.js` sous `rollupOptions.input`

## Décisions en attente

- Hébergement et déploiement final
- Système de contact/réservation (formulaire, email, plateforme tierce)
- Contenu réel (textes, photos, tarifs, disponibilités, coordonnées GPS)
- Intégration d'une carte (embed, plan statique, lien Google Maps)
- Politique RGPD, cookies, analytics
- Arborescence finale des pages

## Public cible

Voyageurs cherchant un séjour au calme et en nature : week-ends, familles, couples, télétravail occasionnel.
