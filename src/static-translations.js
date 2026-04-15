import { getCurrentLanguage } from "./i18n.js";

const STATIC_TRANSLATIONS = {
  fr: {
    common: {
      lang: "fr",
      nav: {
        home: "Accueil",
        lodgings: "Gîtes & chambres",
        groups: "Groupes",
        infrastructure: "Infrastructures",
        region: "La région",
        dining: "Restauration",
        book: "Je réserve",
        whatsapp: "WhatsApp",
        chooseLanguage: "Choisir la langue",
        otherLanguages: "Autres langues",
        openMenu: "Ouvrir le menu",
        closeBookingForm: "Fermer le formulaire",
      },
      footer: {
        navigation: "Navigation",
        legal: "Légales",
        discoverRegion: "Découvrir la région",
        partners: "Nos partenaires",
        contact: "Contact",
        legalNotice: "Mentions légales",
        privacy: "Confidentialité & Cookies",
        credit: "© <span data-year></span> le domaine d'arimont - Website par young, wild &amp; pixels agency",
      },
      testimonials: {
        label: "Ils ont séjourné au Domaine",
        heading:
          "Quelques mots <span class=\"semi-italic\">partagés</span> par nos hôtes, à l’issue <br class=\"br-desktop\" />de leur séjour au Domaine d’<span class=\"semi-italic\">Arimont</span>",
        cta: "vous aussi laissez un avis",
        previous: "Précédent",
        next: "Suivant",
        rating: "{rating} sur 5",
      },
      booking: {
        requestTitle: "Demande de réservation",
        close: "Fermer",
        checkin: "Arrivée",
        checkout: "Départ",
        adults: "Adultes",
        children: "Enfants",
        rooms: "Chambres",
        lastName: "Nom",
        firstName: "Prénom",
        messageOptional: "Message (optionnel)",
        sendEmail: "Envoyer l'email",
        subject: "Demande de réservation - Source d’Arimont",
        mailHello: "Bonjour,",
        mailIntro: "Je souhaite demander une réservation :",
        mailCheckin: "Arrivée",
        mailCheckout: "Départ",
        mailAdults: "Adultes",
        mailChildren: "Enfants",
        mailRooms: "Chambres",
        mailLastName: "Nom",
        mailFirstName: "Prénom",
        mailMessage: "Message :",
      },
      ui: {
        previousImage: "Image précédente",
        nextImage: "Image suivante",
        amenities: "Équipements",
        fromToPeople: "De <strong>{min} à {max}</strong> personnes",
        maxPeople: "<strong>{max}</strong> personnes",
        upToPeople: "Jusqu'à <strong>{max}</strong> personnes",
        reviewMetaLodging: "Gîte 2 chambres",
        reviewMetaRoom: "Chambre d'hôtes",
        showDetails: "Afficher les détails de {name}",
        openInGoogleMaps: "Ouvrir {name} dans Google Maps",
        openInWaze: "Ouvrir {name} dans Waze",
      },
    },
    home: {
      metaTitle: "La Source d'Arimont – Gîtes & Chambres d'hôtes aux Ardennes",
      metaDescription:
        "Domaine de la Source d'Arimont – Gîte de charme au cœur de la nature. Séjours ressourçants en famille ou en couple, hébergements authentiques, grands espaces verts.",
      heroTitle:
        "<span class=\"hero-line\">Bienvenue au</span><span class=\"hero-line\">domaine de la</span><span class=\"hero-line\">Source d’Arimont</span>",
      heroCta: "Réservez maintenant",
      heroNote: "Séjournez entre forêts<br>et virages mythiques",
      scroll: "Scroll",
      groupsLabel: "Groupes & séminaires",
      groupsTitle:
        "Un cadre d’exception <br />pour&nbsp;vos&nbsp;<span class=\"semi-italic\">événements</span>",
      groupsLead:
        "Le Domaine de la Source d’Arimont accueille vos séminaires, retraites et événements privés. Avec une capacité de <strong>plus de 30 personnes</strong>, profitez d’un cadre naturel préservé, loin de l’agitation, pour des journées de travail ou de cohésion qui laissent une empreinte durable.",
      groupsPeople: "Personnes",
      groupsStays: "Hébergements",
      groupsNature: "Ha de nature",
      groupsCta: "Demander un devis",
      bannerLabel: "L'essence du Domaine d'Arimont",
      bannerTitle:
        "Explorer la <span class=\"semi-italic\">région</span> <br class=\"br-desktop\">au départ du Domaine",
      bannerCta: "Découvrir la région",
      lodgingsGitesLabel: "Les gîtes",
      lodgingsGitesTitle:
        "Petit comité ou <span class=\"semi-italic\">grande</span><br />tribu ? On a la place !",
      lodgingsGitesCta: "Voir les gîtes",
      lodgingsRoomsLabel: "Les chambres",
      lodgingsRoomsTitle:
        "Des nuits <span class=\"semi-italic\">confortables</span><br />pour des journées inoubliables",
      lodgingsRoomsCta: "Voir les chambres",
      lodgingsInfraLabel: "Le domaine",
      lodgingsInfraTitle:
        "Piscine, jardins, espaces communs —<br />tout est là pour <span class=\"semi-italic\">ne manquer de rien</span>",
      lodgingsInfraCta: "Découvrir le domaine",
      lodgingsInfraImageAlt: "Les infrastructures du Domaine d'Arimont",
    },
    contact: {
      metaTitle: "Contact & Réservation – La Source d'Arimont aux Ardennes",
      metaDescription:
        "Contactez le Domaine de la Source d'Arimont. Demande de réservation, informations sur les hébergements, accès et coordonnées.",
      introLabel: "Contact & Réservation",
      introTitle: "Parlons de votre <span class=\"semi-italic\">séjour</span>",
      introLead:
        "Pour toute demande de disponibilité, réservation ou information, utilisez le formulaire ci-dessous ou contactez-nous directement.",
      fields: {
        fullName: "Nom & prénom",
        email: "Email",
        checkin: "Date d'arrivée",
        checkout: "Date de départ",
        travellers: "Nombre de voyageurs",
        lodging: "Hébergement souhaité",
        message: "Message",
      },
      placeholders: {
        fullName: "Marie Dupont",
        email: "marie@example.com",
        travellers: "2",
        message: "Votre demande, questions particulières...",
      },
      lodgingOptions: {
        choose: "— Choisir —",
        room: "Chambre d'hôtes",
        other: "Pas encore décidé",
      },
      submit: "Envoyer ma demande",
      info: {
        findUs: "Nous trouver",
        map: "Voir sur Google Maps →",
        contact: "Nous joindre",
        access: "Accès",
        accessText: "À 10 min de Spa-Francorchamps, 15 min de Malmedy,<br />2h de Bruxelles et 1h30 de Liège.",
      },
    },
    legalMentions: {
      metaTitle: "Mentions légales – La Source d'Arimont",
      metaDescription:
        "Mentions légales du site lasourcedarimont.be – éditeur, hébergeur, propriété intellectuelle et données personnelles.",
      content: `
        <h1 style="margin-bottom: 48px;">Mentions légales</h1>
        <h2>1. Éditeur du site</h2>
        <p>Le présent site <strong>lasourcedarimont.be</strong> est édité par :<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, Belgique<br />Tél. : +32 000 00 00<br />Email : contact@domaine-arimont.be</p>
        <h2>2. Conception &amp; développement</h2>
        <p>Site conçu et développé par <strong>Young, Wild &amp; Pixels</strong>.<br />Pour toute question technique : contact@youngwildandpixels.com</p>
        <h2>3. Hébergement</h2>
        <p>Le site est hébergé par :<br /><br /><strong>[Nom de l'hébergeur à compléter]</strong><br />[Adresse de l'hébergeur]</p>
        <h2>4. Propriété intellectuelle</h2>
        <p>L'ensemble des contenus présents sur ce site (textes, images, vidéos, graphismes, logo) sont la propriété exclusive du Domaine de la Source d'Arimont ou de leurs auteurs respectifs, et sont protégés par le droit belge et international de la propriété intellectuelle.</p>
        <p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.</p>
        <h2>5. Données personnelles (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD – UE 2016/679) et à la loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel, vous disposez des droits suivants sur vos données :</p>
        <ul>
          <li>Droit d'accès, de rectification et d'effacement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition et de limitation du traitement</li>
        </ul>
        <p>Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <p>Les données collectées via le formulaire de contact sont utilisées uniquement pour répondre à vos demandes et ne sont pas transmises à des tiers sans votre consentement.</p>
        <h2>6. Cookies</h2>
        <p>Ce site peut utiliser des cookies techniques nécessaires à son bon fonctionnement. Aucun cookie de traçage publicitaire n'est déposé sans votre consentement préalable.</p>
        <h2>7. Liens hypertextes</h2>
        <p>Le site peut contenir des liens vers des sites tiers. Le Domaine de la Source d'Arimont décline toute responsabilité quant au contenu de ces sites externes.</p>
        <h2>8. Droit applicable</h2>
        <p>Le présent site est soumis au droit belge. Tout litige relatif à son utilisation sera soumis à la compétence exclusive des tribunaux de l'arrondissement judiciaire de Liège.</p>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Dernière mise à jour : mars 2025</p>
      `,
    },
    privacy: {
      metaTitle: "Confidentialité & Cookies – La Source d'Arimont",
      metaDescription:
        "Politique de confidentialité et gestion des cookies du site lasourcedarimont.be – protection de vos données personnelles (RGPD).",
      content: `
        <h1 style="margin-bottom: 48px;">Confidentialité &amp; Cookies</h1>
        <h2>1. Responsable du traitement</h2>
        <p>Le responsable du traitement de vos données personnelles est :<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, Belgique<br />Email : <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <h2>2. Données collectées</h2>
        <p>Nous collectons uniquement les données que vous nous transmettez volontairement via le formulaire de contact ou de réservation :</p>
        <ul>
          <li>Nom et prénom</li>
          <li>Adresse e-mail</li>
          <li>Numéro de téléphone (si renseigné)</li>
          <li>Dates et informations de séjour</li>
          <li>Message libre</li>
        </ul>
        <p>Aucune donnée sensible (santé, origine, opinions politiques, etc.) n'est collectée.</p>
        <h2>3. Finalités du traitement</h2>
        <p>Vos données sont utilisées exclusivement pour :</p>
        <ul>
          <li>Répondre à vos demandes de renseignements ou de réservation</li>
          <li>Assurer le suivi de votre séjour</li>
          <li>Vous recontacter si nécessaire</li>
        </ul>
        <p>Elles ne sont jamais revendues, cédées ni transmises à des tiers à des fins commerciales.</p>
        <h2>4. Durée de conservation</h2>
        <p>Vos données sont conservées pendant une durée maximale de <strong>3 ans</strong> à compter du dernier contact, puis supprimées.</p>
        <h2>5. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD – UE 2016/679) et à la loi belge du 30 juillet 2018, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
          <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
          <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
          <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition</strong> : vous opposer à un traitement</li>
          <li><strong>Droit de limitation</strong> : restreindre l'utilisation de vos données</li>
        </ul>
        <p>Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a>.<br />En cas de litige non résolu, vous pouvez introduire une réclamation auprès de l'<a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener">Autorité de protection des données (APD)</a>.</p>
        <h2 style="margin-top: 64px;">6. Politique en matière de cookies</h2>
        <h3>Qu'est-ce qu'un cookie ?</h3>
        <p>Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. Il permet de mémoriser certaines informations pour améliorer votre expérience de navigation.</p>
        <h3>Cookies utilisés sur ce site</h3>
        <p>Ce site utilise uniquement des <strong>cookies techniques strictement nécessaires</strong> à son bon fonctionnement :</p>
        <ul>
          <li><strong>Préférence de langue</strong> : mémorise la langue choisie lors de votre navigation (<code>arimont_lang</code>)</li>
          <li><strong>Session de navigation</strong> : assure le bon déroulement de votre visite</li>
        </ul>
        <p>Ces cookies ne collectent aucune donnée personnelle à des fins publicitaires ou de traçage. Aucun cookie tiers (Google Analytics, Facebook Pixel, etc.) n'est déposé sur ce site.</p>
        <h3>Durée de vie des cookies</h3>
        <p>Les cookies techniques sont conservés pour la durée de votre session ou au maximum <strong>12 mois</strong>.</p>
        <h3>Comment gérer les cookies ?</h3>
        <p>Vous pouvez à tout moment désactiver ou supprimer les cookies via les paramètres de votre navigateur. Notez que la désactivation de certains cookies techniques peut affecter le fonctionnement du site.</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/fr/kb/effacer-les-cookies-et-autres-donnees-de-site" target="_blank" rel="noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
          <li><a href="https://support.microsoft.com/fr-fr/windows/supprimer-et-g%C3%A9rer-les-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener">Microsoft Edge</a></li>
        </ul>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Dernière mise à jour : mars 2025</p>
      `,
    },
    gites: {
      metaTitle: "Gîtes & Chambres – La Source d'Arimont aux Ardennes",
      metaDescription:
        "Découvrez nos gîtes et chambres au Domaine de la Source d'Arimont. Hébergements confortables et authentiques au cœur de la nature. Capacités, équipements et tarifs.",
      introLabel: "Domaine de la Source d'Arimont",
      introTitle:
        "Des <span class=\"semi-italic\">gîtes</span> et <span class=\"semi-italic\">chambres</span> paisibles, dans un<br class=\"br-desktop\" />environnement naturel propice à la<br class=\"br-desktop\" />déconnexion",
      introLead:
        "Des gîtes et chambres paisibles, dans un environnement naturel propice à la déconnexion.",
      switchAria: "Choisir la catégorie de logements",
      tabGites: "Gîtes",
      tabRooms: "Chambres",
      notesLabel: "Infos pratiques",
      notesTitleGites: "Informations utiles avant votre séjour",
      notesTitleRooms: "Nos chambres",
    },
    region: {
      metaTitle: "La région – Activités & découvertes autour de La Source d'Arimont",
      metaDescription:
        "Explorez la région autour du Domaine de la Source d'Arimont. Activités nature, patrimoine, balades et visites aux alentours pour un séjour complet.",
      introLabel: "Découvrir la région",
      introTitle:
        "Séjournez au cœur des Ardennes <br class=\"br-desktop\" />et explorez les incontournables <br class=\"br-desktop\" />autour du Domaine",
      placesLabel: "Lieux à visiter",
      filterAria: "Filtrer les activités",
      outdoor: "En extérieur",
      indoor: "En intérieur",
      mapAria: "Carte des activités autour du Domaine",
      mapLabel: "Explorer autour de Spa-Francorchamps",
      mapTitle:
        "Circuit de Spa-Francorchamps, patrimoine ardennais et expériences nature à moins de 30 minutes",
      mapLead:
        "Depuis le Domaine, repérez facilement les activités sportives, culturelles et familiales autour de Malmedy, Stavelot et Spa. La carte vous aide à organiser vos journées selon vos envies et votre temps de trajet.",
      mapNote:
        "Pins <strong>verts</strong> : activités extérieures. Pins <strong>oranges</strong> : activités intérieures. Le pin du domaine indique votre point de départ.",
      videoAria: "Vidéo du Domaine d'Arimont",
      videoMobileAria: "Vidéo mobile du Domaine d'Arimont",
    },
    restauration: {
      metaTitle: "Restauration & Petit-déjeuner – La Source d'Arimont aux Ardennes",
      metaDescription:
        "Restauration au Domaine de la Source d'Arimont. Cuisine authentique, produits locaux et saveurs de la région pour compléter votre séjour nature.",
      introLabel: "Restauration sur place",
      introTitle: "Petits déjeuners<br class=\"br-desktop\" />&amp; repas conviviaux",
      introLead:
        "Commandez à l’avance et savourez dans votre gîte ou à la terrasse. Tous nos repas sont préparés avec soin, à emporter ou à déguster sur place.",
      takeawayLabel: "À emporter",
      breakfastTitle: "Petits déjeuners",
      breakfastNote: "Commandez la veille avant 19h pour garantir la disponibilité.",
      groupLabel: "En groupe",
      mealsTitle: "Repas conviviaux",
      mealsNote: "Sur réservation · À partir de 2 personnes selon les formules.",
    },
    partners: {
      metaTitle: "Nos partenaires locaux – La Source d'Arimont aux Ardennes",
      metaDescription:
        "Les partenaires du Domaine de la Source d'Arimont. Acteurs locaux, artisans et prestataires qui enrichissent votre séjour en région.",
      introLabel: "Nos partenaires locaux",
      introTitle: "Nos bonnes adresses autour du <br class=\"br-desktop\" />Domaine",
      introLead: "Activités, bien-être et expériences locales: profitez d’avantages négociés pour nos hôtes.",
      otherPartners: "Autres partenaires",
      staySelection:
        "Sélection de lieux et activités<br class=\"br-desktop\" />recommandés pour votre séjour",
      featuredBadge: "Partenaire à la une",
      viewOffer: "Voir l’offre",
      categoryWellness: "Bien-être",
      categoryDining: "Restauration",
      categoryFamily: "Famille",
      categoryCulture: "Culture",
      categoryOther: "Autre",
    },
  },
  en: {
    common: {
      lang: "en",
      nav: {
        home: "Home",
        lodgings: "Lodgings & rooms",
        groups: "Groups",
        infrastructure: "Infrastructure",
        region: "The region",
        dining: "Dining",
        book: "Book now",
        whatsapp: "WhatsApp",
        chooseLanguage: "Choose language",
        otherLanguages: "Other languages",
        openMenu: "Open menu",
        closeBookingForm: "Close booking form",
      },
      footer: {
        navigation: "Navigation",
        legal: "Legal",
        discoverRegion: "Discover the region",
        partners: "Our partners",
        contact: "Contact",
        legalNotice: "Legal notice",
        privacy: "Privacy & Cookies",
        credit: "© <span data-year></span> domaine d'arimont - Website by young, wild &amp; pixels agency",
      },
      testimonials: {
        label: "They stayed at the estate",
        heading:
          "A few <span class=\"semi-italic\">shared</span> words from our guests after <br class=\"br-desktop\" />their stay at Domaine d’<span class=\"semi-italic\">Arimont</span>",
        cta: "leave a review too",
        previous: "Previous",
        next: "Next",
        rating: "{rating} out of 5",
      },
      booking: {
        requestTitle: "Booking request",
        close: "Close",
        checkin: "Check-in",
        checkout: "Check-out",
        adults: "Adults",
        children: "Children",
        rooms: "Rooms",
        lastName: "Last name",
        firstName: "First name",
        messageOptional: "Message (optional)",
        sendEmail: "Send email",
        subject: "Booking request - Source d’Arimont",
        mailHello: "Hello,",
        mailIntro: "I would like to request a booking:",
        mailCheckin: "Check-in",
        mailCheckout: "Check-out",
        mailAdults: "Adults",
        mailChildren: "Children",
        mailRooms: "Rooms",
        mailLastName: "Last name",
        mailFirstName: "First name",
        mailMessage: "Message:",
      },
      ui: {
        previousImage: "Previous image",
        nextImage: "Next image",
        amenities: "Amenities",
        fromToPeople: "From <strong>{min} to {max}</strong> guests",
        maxPeople: "<strong>{max}</strong> guests",
        upToPeople: "Up to <strong>{max}</strong> guests",
        reviewMetaLodging: "2-bedroom cottage",
        reviewMetaRoom: "Guest room",
        showDetails: "Show details for {name}",
        openInGoogleMaps: "Open {name} in Google Maps",
        openInWaze: "Open {name} in Waze",
      },
    },
    home: {
      metaTitle: "La Source d'Arimont – Holiday cottages & guest rooms in the Ardennes",
      metaDescription:
        "Domaine de la Source d'Arimont – charming accommodation in the heart of nature. Restful stays for families or couples, authentic lodgings and wide green spaces.",
      heroTitle:
        "<span class=\"hero-line\">Welcome to</span><span class=\"hero-line\">Domaine de la</span><span class=\"hero-line\">Source d’Arimont</span>",
      heroCta: "Book now",
      heroNote: "Stay between forests<br>and legendary bends",
      scroll: "Scroll",
      groupsLabel: "Groups & seminars",
      groupsTitle:
        "An exceptional setting <br class=\"br-desktop\" />for your <span class=\"semi-italic\">events</span>",
      groupsLead:
        "Domaine de la Source d’Arimont welcomes your seminars, retreats and private events. With capacity for <strong>more than 30 guests</strong>, enjoy an unspoiled natural setting away from the noise for workdays and team moments that leave a lasting impression.",
      groupsPeople: "Guests",
      groupsStays: "Accommodations",
      groupsNature: "Acres of nature",
      groupsCta: "Request a quote",
      bannerLabel: "The essence of Domaine d'Arimont",
      bannerTitle:
        "Explore the <span class=\"semi-italic\">region</span> <br class=\"br-desktop\">from the estate",
      bannerCta: "Discover the region",
      lodgingsGitesLabel: "Holiday cottages",
      lodgingsGitesTitle:
        "Small group or <span class=\"semi-italic\">big</span><br />tribe? We have the room!",
      lodgingsGitesCta: "View cottages",
      lodgingsRoomsLabel: "Guest rooms",
      lodgingsRoomsTitle:
        "Comfortable <span class=\"semi-italic\">nights</span><br />for unforgettable days",
      lodgingsRoomsCta: "View rooms",
      lodgingsInfraLabel: "The estate",
      lodgingsInfraTitle:
        "Pool, gardens, shared spaces —<br />everything is there for a <span class=\"semi-italic\">carefree stay</span>",
      lodgingsInfraCta: "Discover the estate",
      lodgingsInfraImageAlt: "Infrastructure at Domaine d'Arimont",
    },
    contact: {
      metaTitle: "Contact & Booking – La Source d'Arimont in the Ardennes",
      metaDescription:
        "Contact Domaine de la Source d'Arimont. Booking request, accommodation information, directions and contact details.",
      introLabel: "Contact & Booking",
      introTitle: "Let's talk about your <span class=\"semi-italic\">stay</span>",
      introLead:
        "For availability requests, bookings or information, use the form below or contact us directly.",
      fields: {
        fullName: "Full name",
        email: "Email",
        checkin: "Check-in date",
        checkout: "Check-out date",
        travellers: "Number of guests",
        lodging: "Preferred accommodation",
        message: "Message",
      },
      placeholders: {
        fullName: "Marie Dupont",
        email: "marie@example.com",
        travellers: "2",
        message: "Your request, special questions...",
      },
      lodgingOptions: {
        choose: "— Choose —",
        room: "Guest room",
        other: "Not decided yet",
      },
      submit: "Send my request",
      info: {
        findUs: "Find us",
        map: "View on Google Maps →",
        contact: "Contact us",
        access: "Access",
        accessText: "10 min from Spa-Francorchamps, 15 min from Malmedy,<br />2 hours from Brussels and 1h30 from Liège.",
      },
    },
    legalMentions: {
      metaTitle: "Legal notice – La Source d'Arimont",
      metaDescription:
        "Legal notice for lasourcedarimont.be – publisher, hosting, intellectual property and personal data.",
      content: `
        <h1 style="margin-bottom: 48px;">Legal notice</h1>
        <h2>1. Website publisher</h2>
        <p>This website <strong>lasourcedarimont.be</strong> is published by:<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, Belgium<br />Phone: +32 000 00 00<br />Email: contact@domaine-arimont.be</p>
        <h2>2. Design &amp; development</h2>
        <p>Website designed and developed by <strong>Young, Wild &amp; Pixels</strong>.<br />For any technical question: contact@youngwildandpixels.com</p>
        <h2>3. Hosting</h2>
        <p>The website is hosted by:<br /><br /><strong>[Hosting provider name to complete]</strong><br />[Hosting provider address]</p>
        <h2>4. Intellectual property</h2>
        <p>All content on this website (texts, images, videos, graphics, logo) is the exclusive property of Domaine de la Source d'Arimont or their respective authors and is protected by Belgian and international intellectual property law.</p>
        <p>Any reproduction, representation, modification, publication or adaptation of all or part of the elements of this website, whatever the means or process used, is prohibited without prior written authorization.</p>
        <h2>5. Personal data (GDPR)</h2>
        <p>In accordance with the General Data Protection Regulation (GDPR – EU 2016/679) and Belgian law of 30 July 2018 relating to the protection of natural persons with regard to the processing of personal data, you have the following rights regarding your data:</p>
        <ul>
          <li>Right of access, rectification and erasure</li>
          <li>Right to portability</li>
          <li>Right to object and restrict processing</li>
        </ul>
        <p>To exercise these rights, contact us at: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <p>The data collected through the contact form is used only to answer your requests and is not shared with third parties without your consent.</p>
        <h2>6. Cookies</h2>
        <p>This website may use technical cookies necessary for its proper functioning. No advertising tracking cookies are placed without your prior consent.</p>
        <h2>7. Hyperlinks</h2>
        <p>The website may contain links to third-party websites. Domaine de la Source d'Arimont declines all responsibility for the content of these external sites.</p>
        <h2>8. Applicable law</h2>
        <p>This website is governed by Belgian law. Any dispute relating to its use shall be subject to the exclusive jurisdiction of the courts of the judicial district of Liège.</p>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Last updated: March 2025</p>
      `,
    },
    privacy: {
      metaTitle: "Privacy & Cookies – La Source d'Arimont",
      metaDescription:
        "Privacy policy and cookie management for lasourcedarimont.be – protection of your personal data (GDPR).",
      content: `
        <h1 style="margin-bottom: 48px;">Privacy &amp; Cookies</h1>
        <h2>1. Data controller</h2>
        <p>The controller of your personal data is:<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, Belgium<br />Email: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <h2>2. Collected data</h2>
        <p>We only collect the data you voluntarily submit through the contact or booking form:</p>
        <ul>
          <li>First and last name</li>
          <li>Email address</li>
          <li>Phone number (if provided)</li>
          <li>Stay dates and related information</li>
          <li>Free message</li>
        </ul>
        <p>No sensitive data (health, origin, political opinions, etc.) is collected.</p>
        <h2>3. Purposes of processing</h2>
        <p>Your data is used exclusively to:</p>
        <ul>
          <li>Answer your information or booking requests</li>
          <li>Ensure follow-up for your stay</li>
          <li>Contact you again if necessary</li>
        </ul>
        <p>It is never sold, transferred or disclosed to third parties for commercial purposes.</p>
        <h2>4. Retention period</h2>
        <p>Your data is kept for a maximum of <strong>3 years</strong> from the last contact, then deleted.</p>
        <h2>5. Your rights (GDPR)</h2>
        <p>In accordance with the General Data Protection Regulation (GDPR – EU 2016/679) and Belgian law of 30 July 2018, you have the following rights:</p>
        <ul>
          <li><strong>Right of access</strong>: obtain a copy of your data</li>
          <li><strong>Right to rectification</strong>: correct inaccurate data</li>
          <li><strong>Right to erasure</strong>: request deletion of your data</li>
          <li><strong>Right to portability</strong>: receive your data in a structured format</li>
          <li><strong>Right to object</strong>: object to processing</li>
          <li><strong>Right to restriction</strong>: restrict the use of your data</li>
        </ul>
        <p>To exercise these rights, contact us at: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a>.<br />If a dispute remains unresolved, you may file a complaint with the <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener">Data Protection Authority</a>.</p>
        <h2 style="margin-top: 64px;">6. Cookie policy</h2>
        <h3>What is a cookie?</h3>
        <p>A cookie is a small text file placed on your device when you visit a website. It stores certain information to improve your browsing experience.</p>
        <h3>Cookies used on this website</h3>
        <p>This website only uses <strong>strictly necessary technical cookies</strong> for proper operation:</p>
        <ul>
          <li><strong>Language preference</strong>: stores the language chosen during your visit (<code>arimont_lang</code>)</li>
          <li><strong>Browsing session</strong>: ensures your visit runs smoothly</li>
        </ul>
        <p>These cookies do not collect any personal data for advertising or tracking purposes. No third-party cookies (Google Analytics, Facebook Pixel, etc.) are placed on this website.</p>
        <h3>Cookie lifetime</h3>
        <p>Technical cookies are kept for the duration of your session or for a maximum of <strong>12 months</strong>.</p>
        <h3>How to manage cookies?</h3>
        <p>You can disable or delete cookies at any time through your browser settings. Please note that disabling certain technical cookies may affect the proper functioning of the website.</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener">Microsoft Edge</a></li>
        </ul>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Last updated: March 2025</p>
      `,
    },
    gites: {
      metaTitle: "Lodgings & Rooms – La Source d'Arimont in the Ardennes",
      metaDescription:
        "Discover our lodgings and rooms at Domaine de la Source d'Arimont. Comfortable, authentic accommodation in the heart of nature. Capacities, amenities and rates.",
      introLabel: "Domaine de la Source d'Arimont",
      introTitle:
        "Peaceful <span class=\"semi-italic\">cottages</span> and <span class=\"semi-italic\">rooms</span> in a<br class=\"br-desktop\" />natural setting designed for true<br class=\"br-desktop\" />disconnection",
      introLead:
        "Peaceful cottages and rooms in a natural setting designed for true disconnection.",
      switchAria: "Choose accommodation category",
      tabGites: "Cottages",
      tabRooms: "Rooms",
      notesLabel: "Practical info",
      notesTitleGites: "Useful information before your stay",
      notesTitleRooms: "Our rooms",
    },
    region: {
      metaTitle: "The region – Activities & discoveries around La Source d'Arimont",
      metaDescription:
        "Explore the region around Domaine de la Source d'Arimont. Nature activities, heritage, walks and visits for a complete stay.",
      introLabel: "Discover the region",
      introTitle:
        "Stay in the heart of the Ardennes <br class=\"br-desktop\" />and explore the must-sees <br class=\"br-desktop\" />around the estate",
      placesLabel: "Places to visit",
      filterAria: "Filter activities",
      outdoor: "Outdoor",
      indoor: "Indoor",
      mapAria: "Map of activities around the estate",
      mapLabel: "Explore around Spa-Francorchamps",
      mapTitle:
        "Spa-Francorchamps Circuit, Ardennes heritage and nature experiences within 30 minutes",
      mapLead:
        "From the estate, quickly spot sports, cultural and family activities around Malmedy, Stavelot and Spa. The map helps you plan each day by travel time and interests.",
      mapNote:
        "<strong>Green</strong> pins: outdoor activities. <strong>Orange</strong> pins: indoor activities. The estate pin marks your starting point.",
      videoAria: "Video of Domaine d'Arimont",
      videoMobileAria: "Mobile video of Domaine d'Arimont",
    },
    restauration: {
      metaTitle: "Dining & Breakfast – La Source d'Arimont in the Ardennes",
      metaDescription:
        "Dining at Domaine de la Source d'Arimont. Authentic cuisine, local produce and regional flavours to complete your nature stay.",
      introLabel: "Dining on site",
      introTitle: "Breakfasts<br class=\"br-desktop\" />&amp; convivial meals",
      introLead:
        "Order in advance and enjoy your meal in your cottage or on the terrace. All our meals are carefully prepared, to take away or enjoy on site.",
      takeawayLabel: "Take away",
      breakfastTitle: "Breakfasts",
      breakfastNote: "Order the day before by 7pm to guarantee availability.",
      groupLabel: "Groups",
      mealsTitle: "Shared meals",
      mealsNote: "By reservation · From 2 guests depending on the menu.",
    },
    partners: {
      metaTitle: "Our local partners – La Source d'Arimont in the Ardennes",
      metaDescription:
        "Partners of Domaine de la Source d'Arimont. Local players, artisans and providers who enrich your stay in the region.",
      introLabel: "Our local partners",
      introTitle: "Our favourite spots around the <br class=\"br-desktop\" />estate",
      introLead: "Activities, wellness and local experiences: enjoy negotiated benefits for our guests.",
      otherPartners: "Other partners",
      staySelection:
        "A selection of places and activities<br class=\"br-desktop\" />recommended for your stay",
      featuredBadge: "Featured partner",
      viewOffer: "View offer",
      categoryWellness: "Wellness",
      categoryDining: "Dining",
      categoryFamily: "Family",
      categoryCulture: "Culture",
      categoryOther: "Other",
    },
  },
  nl: {
    common: {
      lang: "nl",
      nav: {
        home: "Home",
        lodgings: "Gites & kamers",
        groups: "Groepen",
        infrastructure: "Infrastructuur",
        region: "De streek",
        dining: "Catering",
        book: "Boeken",
        whatsapp: "WhatsApp",
        chooseLanguage: "Taal kiezen",
        otherLanguages: "Andere talen",
        openMenu: "Menu openen",
        closeBookingForm: "Boekingsformulier sluiten",
      },
      footer: {
        navigation: "Navigatie",
        legal: "Juridisch",
        discoverRegion: "Ontdek de streek",
        partners: "Onze partners",
        contact: "Contact",
        legalNotice: "Juridische kennisgeving",
        privacy: "Privacy & Cookies",
        credit: "© <span data-year></span> domaine d'arimont - Website door young, wild &amp; pixels agency",
      },
      testimonials: {
        label: "Ze verbleven op het domein",
        heading:
          "Enkele <span class=\"semi-italic\">gedeelde</span> woorden van onze gasten na <br class=\"br-desktop\" />hun verblijf op Domaine d’<span class=\"semi-italic\">Arimont</span>",
        cta: "laat ook een review achter",
        previous: "Vorige",
        next: "Volgende",
        rating: "{rating} op 5",
      },
      booking: {
        requestTitle: "Boekingsaanvraag",
        close: "Sluiten",
        checkin: "Aankomst",
        checkout: "Vertrek",
        adults: "Volwassenen",
        children: "Kinderen",
        rooms: "Kamers",
        lastName: "Achternaam",
        firstName: "Voornaam",
        messageOptional: "Bericht (optioneel)",
        sendEmail: "E-mail verzenden",
        subject: "Boekingsaanvraag - Source d’Arimont",
        mailHello: "Hallo,",
        mailIntro: "Ik wil graag een boekingsaanvraag doen:",
        mailCheckin: "Aankomst",
        mailCheckout: "Vertrek",
        mailAdults: "Volwassenen",
        mailChildren: "Kinderen",
        mailRooms: "Kamers",
        mailLastName: "Achternaam",
        mailFirstName: "Voornaam",
        mailMessage: "Bericht:",
      },
      ui: {
        previousImage: "Vorige afbeelding",
        nextImage: "Volgende afbeelding",
        amenities: "Voorzieningen",
        fromToPeople: "Van <strong>{min} tot {max}</strong> personen",
        maxPeople: "<strong>{max}</strong> personen",
        upToPeople: "Tot <strong>{max}</strong> personen",
        reviewMetaLodging: "Gîte met 2 slaapkamers",
        reviewMetaRoom: "Gastenkamer",
        showDetails: "Toon details van {name}",
        openInGoogleMaps: "Open {name} in Google Maps",
        openInWaze: "Open {name} in Waze",
      },
    },
    home: {
      metaTitle: "La Source d'Arimont – Gîtes & gastenkamers in de Ardennen",
      metaDescription:
        "Domaine de la Source d'Arimont – charmante verblijven in het hart van de natuur. Ontspannende verblijven voor families of koppels, authentieke logies en ruime groene omgeving.",
      heroTitle:
        "<span class=\"hero-line\">Welkom op</span><span class=\"hero-line\">Domaine de la</span><span class=\"hero-line\">Source d’Arimont</span>",
      heroCta: "Boek nu",
      heroNote: "Verblijf tussen bossen<br>en legendarische bochten",
      scroll: "Scroll",
      groupsLabel: "Groepen & seminaries",
      groupsTitle:
        "Een uitzonderlijk kader <br class=\"br-desktop\" />voor uw <span class=\"semi-italic\">evenementen</span>",
      groupsLead:
        "Domaine de la Source d’Arimont verwelkomt uw seminaries, retraites en privé-evenementen. Met plaats voor <strong>meer dan 30 personen</strong> geniet u van een ongerepte natuurlijke omgeving, ver van de drukte, voor werkdagen en teammomenten met blijvende impact.",
      groupsPeople: "Personen",
      groupsStays: "Accommodaties",
      groupsNature: "Ha natuur",
      groupsCta: "Offerte aanvragen",
      bannerLabel: "De essentie van Domaine d'Arimont",
      bannerTitle:
        "Ontdek de <span class=\"semi-italic\">streek</span> <br class=\"br-desktop\">vanuit het domein",
      bannerCta: "Ontdek de streek",
      lodgingsGitesLabel: "De gîtes",
      lodgingsGitesTitle:
        "Klein gezelschap of <span class=\"semi-italic\">grote</span><br />groep? We hebben plaats!",
      lodgingsGitesCta: "Bekijk de gîtes",
      lodgingsRoomsLabel: "De kamers",
      lodgingsRoomsTitle:
        "Comfortabele <span class=\"semi-italic\">nachten</span><br />voor onvergetelijke dagen",
      lodgingsRoomsCta: "Bekijk de kamers",
      lodgingsInfraLabel: "Het domein",
      lodgingsInfraTitle:
        "Zwembad, tuinen, gedeelde ruimtes —<br />alles is er voor een <span class=\"semi-italic\">zorgeloos verblijf</span>",
      lodgingsInfraCta: "Ontdek het domein",
      lodgingsInfraImageAlt: "De infrastructuur van Domaine d'Arimont",
    },
    contact: {
      metaTitle: "Contact & Reservering – La Source d'Arimont in de Ardennen",
      metaDescription:
        "Neem contact op met Domaine de la Source d'Arimont. Reserveringsaanvraag, informatie over de accommodaties, route en contactgegevens.",
      introLabel: "Contact & Reservering",
      introTitle: "Laten we praten over uw <span class=\"semi-italic\">verblijf</span>",
      introLead:
        "Gebruik het onderstaande formulier voor beschikbaarheid, reserveringen of informatie, of neem rechtstreeks contact met ons op.",
      fields: {
        fullName: "Naam & voornaam",
        email: "E-mail",
        checkin: "Aankomstdatum",
        checkout: "Vertrekdatum",
        travellers: "Aantal gasten",
        lodging: "Gewenste accommodatie",
        message: "Bericht",
      },
      placeholders: {
        fullName: "Marie Dupont",
        email: "marie@example.com",
        travellers: "2",
        message: "Uw aanvraag, speciale vragen...",
      },
      lodgingOptions: {
        choose: "— Kies —",
        room: "Gastenkamer",
        other: "Nog niet beslist",
      },
      submit: "Mijn aanvraag verzenden",
      info: {
        findUs: "Ons vinden",
        map: "Bekijk op Google Maps →",
        contact: "Contacteer ons",
        access: "Toegang",
        accessText: "10 min van Spa-Francorchamps, 15 min van Malmedy,<br />2 uur van Brussel en 1u30 van Luik.",
      },
    },
    legalMentions: {
      metaTitle: "Juridische kennisgeving – La Source d'Arimont",
      metaDescription:
        "Juridische informatie van lasourcedarimont.be – uitgever, hosting, intellectuele eigendom en persoonsgegevens.",
      content: `
        <h1 style="margin-bottom: 48px;">Juridische kennisgeving</h1>
        <h2>1. Uitgever van de website</h2>
        <p>Deze website <strong>lasourcedarimont.be</strong> wordt uitgegeven door:<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, België<br />Tel.: +32 000 00 00<br />E-mail: contact@domaine-arimont.be</p>
        <h2>2. Ontwerp &amp; ontwikkeling</h2>
        <p>Website ontworpen en ontwikkeld door <strong>Young, Wild &amp; Pixels</strong>.<br />Voor technische vragen: contact@youngwildandpixels.com</p>
        <h2>3. Hosting</h2>
        <p>De website wordt gehost door:<br /><br /><strong>[Naam van de hostingprovider in te vullen]</strong><br />[Adres van de hostingprovider]</p>
        <h2>4. Intellectuele eigendom</h2>
        <p>Alle inhoud op deze website (teksten, afbeeldingen, video's, grafische elementen, logo) is exclusieve eigendom van Domaine de la Source d'Arimont of van hun respectieve auteurs en wordt beschermd door het Belgische en internationale intellectuele eigendomsrecht.</p>
        <p>Elke reproductie, weergave, wijziging, publicatie of aanpassing van geheel of een deel van de elementen van deze website, ongeacht het gebruikte middel of proces, is verboden zonder voorafgaande schriftelijke toestemming.</p>
        <h2>5. Persoonsgegevens (AVG)</h2>
        <p>Overeenkomstig de Algemene Verordening Gegevensbescherming (AVG – EU 2016/679) en de Belgische wet van 30 juli 2018 betreffende de bescherming van natuurlijke personen met betrekking tot de verwerking van persoonsgegevens, beschikt u over de volgende rechten:</p>
        <ul>
          <li>Recht op inzage, rectificatie en verwijdering</li>
          <li>Recht op overdraagbaarheid</li>
          <li>Recht op bezwaar en beperking van de verwerking</li>
        </ul>
        <p>Om deze rechten uit te oefenen, contacteer ons via: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <p>De via het contactformulier verzamelde gegevens worden uitsluitend gebruikt om uw verzoeken te beantwoorden en worden niet aan derden doorgegeven zonder uw toestemming.</p>
        <h2>6. Cookies</h2>
        <p>Deze website kan technische cookies gebruiken die noodzakelijk zijn voor een goede werking. Er worden geen advertentietrackingcookies geplaatst zonder uw voorafgaande toestemming.</p>
        <h2>7. Hyperlinks</h2>
        <p>De website kan links bevatten naar websites van derden. Domaine de la Source d'Arimont wijst elke verantwoordelijkheid af voor de inhoud van deze externe websites.</p>
        <h2>8. Toepasselijk recht</h2>
        <p>Op deze website is Belgisch recht van toepassing. Elk geschil met betrekking tot het gebruik ervan valt onder de exclusieve bevoegdheid van de rechtbanken van het gerechtelijk arrondissement Luik.</p>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Laatst bijgewerkt: maart 2025</p>
      `,
    },
    privacy: {
      metaTitle: "Privacy & Cookies – La Source d'Arimont",
      metaDescription:
        "Privacybeleid en cookiebeheer van lasourcedarimont.be – bescherming van uw persoonsgegevens (AVG).",
      content: `
        <h1 style="margin-bottom: 48px;">Privacy &amp; Cookies</h1>
        <h2>1. Verwerkingsverantwoordelijke</h2>
        <p>De verantwoordelijke voor de verwerking van uw persoonsgegevens is:<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, België<br />E-mail: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <h2>2. Verzamelde gegevens</h2>
        <p>Wij verzamelen enkel de gegevens die u vrijwillig via het contact- of reserveringsformulier aan ons doorgeeft:</p>
        <ul>
          <li>Naam en voornaam</li>
          <li>E-mailadres</li>
          <li>Telefoonnummer (indien opgegeven)</li>
          <li>Data en informatie over het verblijf</li>
          <li>Vrij bericht</li>
        </ul>
        <p>Er worden geen gevoelige gegevens (gezondheid, afkomst, politieke overtuigingen enz.) verzameld.</p>
        <h2>3. Doeleinden van de verwerking</h2>
        <p>Uw gegevens worden uitsluitend gebruikt om:</p>
        <ul>
          <li>Uw informatie- of reserveringsaanvragen te beantwoorden</li>
          <li>De opvolging van uw verblijf te verzekeren</li>
          <li>U indien nodig opnieuw te contacteren</li>
        </ul>
        <p>Ze worden nooit verkocht, overgedragen of meegedeeld aan derden voor commerciële doeleinden.</p>
        <h2>4. Bewaartermijn</h2>
        <p>Uw gegevens worden maximaal <strong>3 jaar</strong> na het laatste contact bewaard en daarna verwijderd.</p>
        <h2>5. Uw rechten (AVG)</h2>
        <p>Overeenkomstig de Algemene Verordening Gegevensbescherming (AVG – EU 2016/679) en de Belgische wet van 30 juli 2018 beschikt u over de volgende rechten:</p>
        <ul>
          <li><strong>Recht op inzage</strong>: een kopie van uw gegevens verkrijgen</li>
          <li><strong>Recht op rectificatie</strong>: onjuiste gegevens laten corrigeren</li>
          <li><strong>Recht op verwijdering</strong>: verwijdering van uw gegevens vragen</li>
          <li><strong>Recht op overdraagbaarheid</strong>: uw gegevens in een gestructureerd formaat ontvangen</li>
          <li><strong>Recht van bezwaar</strong>: bezwaar maken tegen verwerking</li>
          <li><strong>Recht op beperking</strong>: het gebruik van uw gegevens beperken</li>
        </ul>
        <p>Om deze rechten uit te oefenen, contacteer ons via: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a>.<br />Bij een onopgelost geschil kunt u een klacht indienen bij de <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener">Gegevensbeschermingsautoriteit</a>.</p>
        <h2 style="margin-top: 64px;">6. Cookiebeleid</h2>
        <h3>Wat is een cookie?</h3>
        <p>Een cookie is een klein tekstbestand dat op uw apparaat wordt geplaatst wanneer u een website bezoekt. Het onthoudt bepaalde informatie om uw surfervaring te verbeteren.</p>
        <h3>Cookies die op deze website worden gebruikt</h3>
        <p>Deze website gebruikt enkel <strong>strikt noodzakelijke technische cookies</strong> voor een goede werking:</p>
        <ul>
          <li><strong>Taalvoorkeur</strong>: onthoudt de gekozen taal tijdens uw bezoek (<code>arimont_lang</code>)</li>
          <li><strong>Browsersessie</strong>: zorgt voor een vlot verloop van uw bezoek</li>
        </ul>
        <p>Deze cookies verzamelen geen persoonsgegevens voor reclame- of trackingdoeleinden. Er worden geen cookies van derden (Google Analytics, Facebook Pixel enz.) geplaatst op deze website.</p>
        <h3>Levensduur van cookies</h3>
        <p>Technische cookies worden bewaard voor de duur van uw sessie of maximaal <strong>12 maanden</strong>.</p>
        <h3>Hoe kunt u cookies beheren?</h3>
        <p>U kunt cookies op elk moment uitschakelen of verwijderen via de instellingen van uw browser. Houd er rekening mee dat het uitschakelen van bepaalde technische cookies de goede werking van de website kan beïnvloeden.</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/nl/kb/cookies-en-sitegegevens-wissen-firefox" target="_blank" rel="noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/nl-be/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
          <li><a href="https://support.microsoft.com/nl-nl/windows/cookies-beheren-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener">Microsoft Edge</a></li>
        </ul>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Laatst bijgewerkt: maart 2025</p>
      `,
    },
    gites: {
      metaTitle: "Gîtes & kamers – La Source d'Arimont in de Ardennen",
      metaDescription:
        "Ontdek onze gîtes en kamers in Domaine de la Source d'Arimont. Comfortabele en authentieke accommodaties midden in de natuur. Capaciteit, voorzieningen en tarieven.",
      introLabel: "Domaine de la Source d'Arimont",
      introTitle:
        "Rustige <span class=\"semi-italic\">gîtes</span> en <span class=\"semi-italic\">kamers</span> in een<br class=\"br-desktop\" />natuurlijke omgeving die uitnodigt tot<br class=\"br-desktop\" />ontkoppeling",
      introLead:
        "Rustige gîtes en kamers in een natuurlijke omgeving die uitnodigt tot ontkoppeling.",
      switchAria: "Kies type accommodatie",
      tabGites: "Gîtes",
      tabRooms: "Kamers",
      notesLabel: "Praktische info",
      notesTitleGites: "Handige informatie vóór uw verblijf",
      notesTitleRooms: "Onze kamers",
    },
    region: {
      metaTitle: "De streek – Activiteiten & ontdekkingen rond La Source d'Arimont",
      metaDescription:
        "Verken de streek rond Domaine de la Source d'Arimont. Natuuractiviteiten, erfgoed, wandelingen en bezoeken voor een volledig verblijf.",
      introLabel: "Ontdek de streek",
      introTitle:
        "Verblijf in het hart van de Ardennen <br class=\"br-desktop\" />en ontdek de hoogtepunten <br class=\"br-desktop\" />rond het domein",
      placesLabel: "Te bezoeken plaatsen",
      filterAria: "Activiteiten filteren",
      outdoor: "Buiten",
      indoor: "Binnen",
      mapAria: "Kaart van activiteiten rond het domein",
      mapLabel: "Ontdek rond Spa-Francorchamps",
      mapTitle:
        "Circuit van Spa-Francorchamps, Ardense erfgoedlocaties en natuurervaringen binnen 30 minuten",
      mapLead:
        "Vanuit het domein vindt u snel sportieve, culturele en gezinsactiviteiten rond Malmedy, Stavelot en Spa. De kaart helpt u uw dagen te plannen volgens reistijd en interesses.",
      mapNote:
        "<strong>Groene</strong> pins: buitenactiviteiten. <strong>Oranje</strong> pins: binnenactiviteiten. De pin van het domein toont uw vertrekpunt.",
      videoAria: "Video van Domaine d'Arimont",
      videoMobileAria: "Mobiele video van Domaine d'Arimont",
    },
    restauration: {
      metaTitle: "Catering & ontbijt – La Source d'Arimont in de Ardennen",
      metaDescription:
        "Catering in Domaine de la Source d'Arimont. Authentieke keuken, lokale producten en streeksmaken als aanvulling op uw natuurverblijf.",
      introLabel: "Catering ter plaatse",
      introTitle: "Ontbijt<br class=\"br-desktop\" />&amp; gezellige maaltijden",
      introLead:
        "Bestel vooraf en geniet in uw gîte of op het terras. Al onze maaltijden worden met zorg bereid, om mee te nemen of ter plaatse te proeven.",
      takeawayLabel: "Om mee te nemen",
      breakfastTitle: "Ontbijt",
      breakfastNote: "Bestel de dag voordien vóór 19u om beschikbaarheid te garanderen.",
      groupLabel: "In groep",
      mealsTitle: "Gezellige maaltijden",
      mealsNote: "Op reservatie · Vanaf 2 personen afhankelijk van de formule.",
    },
    partners: {
      metaTitle: "Onze lokale partners – La Source d'Arimont in de Ardennen",
      metaDescription:
        "Partners van Domaine de la Source d'Arimont. Lokale spelers, ambachtslieden en aanbieders die uw verblijf in de streek verrijken.",
      introLabel: "Onze lokale partners",
      introTitle: "Onze goede adressen rond het <br class=\"br-desktop\" />domein",
      introLead: "Activiteiten, wellness en lokale ervaringen: geniet van onderhandelde voordelen voor onze gasten.",
      otherPartners: "Andere partners",
      staySelection:
        "Selectie van plekken en activiteiten<br class=\"br-desktop\" />aanbevolen voor uw verblijf",
      featuredBadge: "Uitgelichte partner",
      viewOffer: "Bekijk aanbod",
      categoryWellness: "Wellness",
      categoryDining: "Catering",
      categoryFamily: "Familie",
      categoryCulture: "Cultuur",
      categoryOther: "Overig",
    },
  },
  de: {
    common: {
      lang: "de",
      nav: {
        home: "Start",
        lodgings: "Ferienhäuser & Zimmer",
        groups: "Gruppen",
        infrastructure: "Infrastruktur",
        region: "Die Region",
        dining: "Verpflegung",
        book: "Buchen",
        whatsapp: "WhatsApp",
        chooseLanguage: "Sprache wählen",
        otherLanguages: "Weitere Sprachen",
        openMenu: "Menü öffnen",
        closeBookingForm: "Buchungsformular schließen",
      },
      footer: {
        navigation: "Navigation",
        legal: "Rechtliches",
        discoverRegion: "Region entdecken",
        partners: "Unsere Partner",
        contact: "Kontakt",
        legalNotice: "Impressum",
        privacy: "Datenschutz & Cookies",
        credit: "© <span data-year></span> domaine d'arimont - Website von young, wild &amp; pixels agency",
      },
      testimonials: {
        label: "Sie haben auf dem Anwesen übernachtet",
        heading:
          "Einige <span class=\"semi-italic\">geteilte</span> Worte unserer Gäste nach <br class=\"br-desktop\" />ihrem Aufenthalt im Domaine d’<span class=\"semi-italic\">Arimont</span>",
        cta: "hinterlassen Sie auch eine Bewertung",
        previous: "Zurück",
        next: "Weiter",
        rating: "{rating} von 5",
      },
      booking: {
        requestTitle: "Buchungsanfrage",
        close: "Schließen",
        checkin: "Anreise",
        checkout: "Abreise",
        adults: "Erwachsene",
        children: "Kinder",
        rooms: "Zimmer",
        lastName: "Nachname",
        firstName: "Vorname",
        messageOptional: "Nachricht (optional)",
        sendEmail: "E-Mail senden",
        subject: "Buchungsanfrage - Source d’Arimont",
        mailHello: "Guten Tag,",
        mailIntro: "Ich möchte eine Buchungsanfrage stellen:",
        mailCheckin: "Anreise",
        mailCheckout: "Abreise",
        mailAdults: "Erwachsene",
        mailChildren: "Kinder",
        mailRooms: "Zimmer",
        mailLastName: "Nachname",
        mailFirstName: "Vorname",
        mailMessage: "Nachricht:",
      },
      ui: {
        previousImage: "Vorheriges Bild",
        nextImage: "Nächstes Bild",
        amenities: "Ausstattung",
        fromToPeople: "Von <strong>{min} bis {max}</strong> Personen",
        maxPeople: "<strong>{max}</strong> Personen",
        upToPeople: "Bis zu <strong>{max}</strong> Personen",
        reviewMetaLodging: "Ferienhaus mit 2 Schlafzimmern",
        reviewMetaRoom: "Gästezimmer",
        showDetails: "Details zu {name} anzeigen",
        openInGoogleMaps: "{name} in Google Maps öffnen",
        openInWaze: "{name} in Waze öffnen",
      },
    },
    home: {
      metaTitle: "La Source d'Arimont – Ferienhäuser & Gästezimmer in den Ardennen",
      metaDescription:
        "Domaine de la Source d'Arimont – charmante Unterkünfte mitten in der Natur. Erholsame Aufenthalte für Familien oder Paare, authentische Unterkünfte und viel Grün.",
      heroTitle:
        "<span class=\"hero-line\">Willkommen im</span><span class=\"hero-line\">Domaine de la</span><span class=\"hero-line\">Source d’Arimont</span>",
      heroCta: "Jetzt buchen",
      heroNote: "Zwischen Wäldern<br>und legendären Kurven wohnen",
      scroll: "Scroll",
      groupsLabel: "Gruppen & Seminare",
      groupsTitle:
        "Ein außergewöhnlicher Rahmen <br class=\"br-desktop\" />für Ihre <span class=\"semi-italic\">Veranstaltungen</span>",
      groupsLead:
        "Das Domaine de la Source d’Arimont empfängt Ihre Seminare, Retreats und privaten Veranstaltungen. Mit Platz für <strong>mehr als 30 Personen</strong> genießen Sie eine geschützte Naturlandschaft fernab vom Trubel für Arbeitstage und Team-Momente mit bleibendem Eindruck.",
      groupsPeople: "Personen",
      groupsStays: "Unterkünfte",
      groupsNature: "Ha Natur",
      groupsCta: "Angebot anfragen",
      bannerLabel: "Die Essenz des Domaine d'Arimont",
      bannerTitle:
        "Die <span class=\"semi-italic\">Region</span> <br class=\"br-desktop\">vom Anwesen aus entdecken",
      bannerCta: "Region entdecken",
      lodgingsGitesLabel: "Die Ferienhäuser",
      lodgingsGitesTitle:
        "Kleine Runde oder <span class=\"semi-italic\">große</span><br />Gruppe? Wir haben Platz!",
      lodgingsGitesCta: "Ferienhäuser ansehen",
      lodgingsRoomsLabel: "Die Zimmer",
      lodgingsRoomsTitle:
        "Komfortable <span class=\"semi-italic\">Nächte</span><br />für unvergessliche Tage",
      lodgingsRoomsCta: "Zimmer ansehen",
      lodgingsInfraLabel: "Das Anwesen",
      lodgingsInfraTitle:
        "Pool, Gärten, Gemeinschaftsbereiche —<br />alles ist da für einen <span class=\"semi-italic\">sorglosen Aufenthalt</span>",
      lodgingsInfraCta: "Anwesen entdecken",
      lodgingsInfraImageAlt: "Infrastruktur des Domaine d'Arimont",
    },
    contact: {
      metaTitle: "Kontakt & Buchung – La Source d'Arimont in den Ardennen",
      metaDescription:
        "Kontaktieren Sie Domaine de la Source d'Arimont. Buchungsanfrage, Informationen zu den Unterkünften, Anfahrt und Kontaktdaten.",
      introLabel: "Kontakt & Buchung",
      introTitle: "Sprechen wir über Ihren <span class=\"semi-italic\">Aufenthalt</span>",
      introLead:
        "Für Verfügbarkeitsanfragen, Buchungen oder Informationen nutzen Sie das untenstehende Formular oder kontaktieren Sie uns direkt.",
      fields: {
        fullName: "Name & Vorname",
        email: "E-Mail",
        checkin: "Anreisedatum",
        checkout: "Abreisedatum",
        travellers: "Anzahl der Gäste",
        lodging: "Gewünschte Unterkunft",
        message: "Nachricht",
      },
      placeholders: {
        fullName: "Marie Dupont",
        email: "marie@example.com",
        travellers: "2",
        message: "Ihre Anfrage, besondere Fragen...",
      },
      lodgingOptions: {
        choose: "— Wählen —",
        room: "Gästezimmer",
        other: "Noch nicht entschieden",
      },
      submit: "Anfrage senden",
      info: {
        findUs: "So finden Sie uns",
        map: "In Google Maps ansehen →",
        contact: "Kontakt",
        access: "Anfahrt",
        accessText: "10 Min. von Spa-Francorchamps, 15 Min. von Malmedy,<br />2 Stunden von Brüssel und 1 Std. 30 Min. von Lüttich.",
      },
    },
    legalMentions: {
      metaTitle: "Impressum – La Source d'Arimont",
      metaDescription:
        "Impressum der Website lasourcedarimont.be – Herausgeber, Hosting, geistiges Eigentum und personenbezogene Daten.",
      content: `
        <h1 style="margin-bottom: 48px;">Impressum</h1>
        <h2>1. Herausgeber der Website</h2>
        <p>Diese Website <strong>lasourcedarimont.be</strong> wird herausgegeben von:<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, Belgien<br />Tel.: +32 000 00 00<br />E-Mail: contact@domaine-arimont.be</p>
        <h2>2. Konzeption &amp; Entwicklung</h2>
        <p>Website konzipiert und entwickelt von <strong>Young, Wild &amp; Pixels</strong>.<br />Bei technischen Fragen: contact@youngwildandpixels.com</p>
        <h2>3. Hosting</h2>
        <p>Die Website wird gehostet von:<br /><br /><strong>[Name des Hosting-Anbieters zu ergänzen]</strong><br />[Adresse des Hosting-Anbieters]</p>
        <h2>4. Geistiges Eigentum</h2>
        <p>Alle Inhalte dieser Website (Texte, Bilder, Videos, Grafiken, Logo) sind ausschließliches Eigentum des Domaine de la Source d'Arimont oder ihrer jeweiligen Autoren und durch belgisches und internationales Urheberrecht geschützt.</p>
        <p>Jede Vervielfältigung, Darstellung, Änderung, Veröffentlichung oder Anpassung der gesamten oder eines Teils der Elemente der Website ist ohne vorherige schriftliche Genehmigung untersagt.</p>
        <h2>5. Personenbezogene Daten (DSGVO)</h2>
        <p>Gemäß der Datenschutz-Grundverordnung (DSGVO – EU 2016/679) und dem belgischen Gesetz vom 30. Juli 2018 zum Schutz natürlicher Personen bei der Verarbeitung personenbezogener Daten haben Sie folgende Rechte:</p>
        <ul>
          <li>Recht auf Auskunft, Berichtigung und Löschung</li>
          <li>Recht auf Datenübertragbarkeit</li>
          <li>Recht auf Widerspruch und Einschränkung der Verarbeitung</li>
        </ul>
        <p>Zur Ausübung dieser Rechte kontaktieren Sie uns unter: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <p>Die über das Kontaktformular erhobenen Daten werden ausschließlich zur Beantwortung Ihrer Anfragen verwendet und ohne Ihre Zustimmung nicht an Dritte weitergegeben.</p>
        <h2>6. Cookies</h2>
        <p>Diese Website kann technische Cookies verwenden, die für ihren ordnungsgemäßen Betrieb erforderlich sind. Werbetracking-Cookies werden ohne Ihre vorherige Zustimmung nicht gesetzt.</p>
        <h2>7. Hyperlinks</h2>
        <p>Die Website kann Links zu Websites Dritter enthalten. Das Domaine de la Source d'Arimont übernimmt keine Verantwortung für deren Inhalte.</p>
        <h2>8. Anwendbares Recht</h2>
        <p>Diese Website unterliegt belgischem Recht. Alle Streitigkeiten im Zusammenhang mit ihrer Nutzung unterliegen der ausschließlichen Zuständigkeit der Gerichte des Gerichtsbezirks Lüttich.</p>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Letzte Aktualisierung: März 2025</p>
      `,
    },
    privacy: {
      metaTitle: "Datenschutz & Cookies – La Source d'Arimont",
      metaDescription:
        "Datenschutzerklärung und Cookie-Verwaltung der Website lasourcedarimont.be – Schutz Ihrer personenbezogenen Daten (DSGVO).",
      content: `
        <h1 style="margin-bottom: 48px;">Datenschutz &amp; Cookies</h1>
        <h2>1. Verantwortlicher für die Verarbeitung</h2>
        <p>Verantwortlich für die Verarbeitung Ihrer personenbezogenen Daten ist:<br /><br /><strong>Domaine de la Source d'Arimont</strong><br />Chemin de la Cense 22<br />4960 Malmedy, Belgien<br />E-Mail: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a></p>
        <h2>2. Erhobene Daten</h2>
        <p>Wir erheben nur die Daten, die Sie uns freiwillig über das Kontakt- oder Buchungsformular übermitteln:</p>
        <ul>
          <li>Name und Vorname</li>
          <li>E-Mail-Adresse</li>
          <li>Telefonnummer (falls angegeben)</li>
          <li>Aufenthaltsdaten und Informationen</li>
          <li>Freitextnachricht</li>
        </ul>
        <p>Es werden keine sensiblen Daten (Gesundheit, Herkunft, politische Meinungen usw.) erhoben.</p>
        <h2>3. Zwecke der Verarbeitung</h2>
        <p>Ihre Daten werden ausschließlich verwendet, um:</p>
        <ul>
          <li>Ihre Informations- oder Buchungsanfragen zu beantworten</li>
          <li>Die Betreuung Ihres Aufenthalts sicherzustellen</li>
          <li>Sie bei Bedarf erneut zu kontaktieren</li>
        </ul>
        <p>Sie werden niemals verkauft, übertragen oder zu kommerziellen Zwecken an Dritte weitergegeben.</p>
        <h2>4. Speicherdauer</h2>
        <p>Ihre Daten werden maximal <strong>3 Jahre</strong> ab dem letzten Kontakt aufbewahrt und anschließend gelöscht.</p>
        <h2>5. Ihre Rechte (DSGVO)</h2>
        <p>Gemäß der Datenschutz-Grundverordnung (DSGVO – EU 2016/679) und dem belgischen Gesetz vom 30. Juli 2018 haben Sie folgende Rechte:</p>
        <ul>
          <li><strong>Auskunftsrecht</strong>: eine Kopie Ihrer Daten erhalten</li>
          <li><strong>Recht auf Berichtigung</strong>: unrichtige Daten korrigieren lassen</li>
          <li><strong>Recht auf Löschung</strong>: Löschung Ihrer Daten verlangen</li>
          <li><strong>Recht auf Übertragbarkeit</strong>: Ihre Daten in einem strukturierten Format erhalten</li>
          <li><strong>Widerspruchsrecht</strong>: einer Verarbeitung widersprechen</li>
          <li><strong>Recht auf Einschränkung</strong>: die Nutzung Ihrer Daten einschränken</li>
        </ul>
        <p>Zur Ausübung dieser Rechte kontaktieren Sie uns unter: <a href="mailto:contact@domaine-arimont.be">contact@domaine-arimont.be</a>.<br />Falls ein Streitfall nicht gelöst wird, können Sie bei der <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener">Datenschutzbehörde</a> Beschwerde einreichen.</p>
        <h2 style="margin-top: 64px;">6. Cookie-Richtlinie</h2>
        <h3>Was ist ein Cookie?</h3>
        <p>Ein Cookie ist eine kleine Textdatei, die beim Besuch einer Website auf Ihrem Gerät gespeichert wird. Es speichert bestimmte Informationen, um Ihr Surferlebnis zu verbessern.</p>
        <h3>Auf dieser Website verwendete Cookies</h3>
        <p>Diese Website verwendet nur <strong>unbedingt notwendige technische Cookies</strong> für einen ordnungsgemäßen Betrieb:</p>
        <ul>
          <li><strong>Spracheinstellung</strong>: speichert die während Ihres Besuchs gewählte Sprache (<code>arimont_lang</code>)</li>
          <li><strong>Browsersitzung</strong>: sorgt für einen reibungslosen Ablauf Ihres Besuchs</li>
        </ul>
        <p>Diese Cookies erfassen keine personenbezogenen Daten zu Werbe- oder Trackingzwecken. Es werden keine Cookies von Drittanbietern (Google Analytics, Facebook Pixel usw.) auf dieser Website gesetzt.</p>
        <h3>Lebensdauer von Cookies</h3>
        <p>Technische Cookies werden für die Dauer Ihrer Sitzung oder maximal <strong>12 Monate</strong> gespeichert.</p>
        <h3>Wie können Cookies verwaltet werden?</h3>
        <p>Sie können Cookies jederzeit über die Einstellungen Ihres Browsers deaktivieren oder löschen. Bitte beachten Sie, dass die Deaktivierung bestimmter technischer Cookies die Funktion der Website beeinträchtigen kann.</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/de/kb/cookies-und-website-daten-in-firefox-loschen" target="_blank" rel="noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/de-de/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
          <li><a href="https://support.microsoft.com/de-de/windows/cookies-in-microsoft-edge-anzeigen-zulassen-blockieren-löschen-und-verwenden-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener">Microsoft Edge</a></li>
        </ul>
        <p style="margin-top: 48px; opacity: 0.5; font-size: 0.9rem;">Letzte Aktualisierung: März 2025</p>
      `,
    },
    gites: {
      metaTitle: "Ferienhäuser & Zimmer – La Source d'Arimont in den Ardennen",
      metaDescription:
        "Entdecken Sie unsere Ferienhäuser und Zimmer im Domaine de la Source d'Arimont. Komfortable und authentische Unterkünfte mitten in der Natur. Kapazitäten, Ausstattung und Preise.",
      introLabel: "Domaine de la Source d'Arimont",
      introTitle:
        "Ruhige <span class=\"semi-italic\">Ferienhäuser</span> und <span class=\"semi-italic\">Zimmer</span> in einer<br class=\"br-desktop\" />natürlichen Umgebung für echte<br class=\"br-desktop\" />Entschleunigung",
      introLead:
        "Ruhige Ferienhäuser und Zimmer in einer natürlichen Umgebung für echte Entschleunigung.",
      switchAria: "Unterkunftskategorie wählen",
      tabGites: "Ferienhäuser",
      tabRooms: "Zimmer",
      notesLabel: "Praktische Infos",
      notesTitleGites: "Wichtige Informationen vor Ihrem Aufenthalt",
      notesTitleRooms: "Unsere Zimmer",
    },
    region: {
      metaTitle: "Die Region – Aktivitäten & Entdeckungen rund um La Source d'Arimont",
      metaDescription:
        "Erkunden Sie die Region rund um Domaine de la Source d'Arimont. Naturaktivitäten, Kulturerbe, Spaziergänge und Ausflüge für einen gelungenen Aufenthalt.",
      introLabel: "Die Region entdecken",
      introTitle:
        "Verbringen Sie Ihren Aufenthalt im Herzen der Ardennen <br class=\"br-desktop\" />und entdecken Sie die Highlights <br class=\"br-desktop\" />rund um das Anwesen",
      placesLabel: "Sehenswürdigkeiten",
      filterAria: "Aktivitäten filtern",
      outdoor: "Im Freien",
      indoor: "Drinnen",
      mapAria: "Karte der Aktivitäten rund um das Anwesen",
      mapLabel: "Rund um Spa-Francorchamps entdecken",
      mapTitle:
        "Circuit de Spa-Francorchamps, Ardennen-Kulturerbe und Naturerlebnisse in weniger als 30 Minuten",
      mapLead:
        "Vom Anwesen aus finden Sie schnell sportliche, kulturelle und familienfreundliche Aktivitäten rund um Malmedy, Stavelot und Spa. Die Karte hilft Ihnen, Ihre Tage nach Fahrzeit und Interessen zu planen.",
      mapNote:
        "<strong>Grüne</strong> Pins: Aktivitäten im Freien. <strong>Orange</strong> Pins: Indoor-Aktivitäten. Der Pin des Anwesens zeigt Ihren Startpunkt.",
      videoAria: "Video des Domaine d'Arimont",
      videoMobileAria: "Mobiles Video des Domaine d'Arimont",
    },
    restauration: {
      metaTitle: "Verpflegung & Frühstück – La Source d'Arimont in den Ardennen",
      metaDescription:
        "Verpflegung im Domaine de la Source d'Arimont. Authentische Küche, lokale Produkte und regionale Aromen als Ergänzung zu Ihrem Naturaufenthalt.",
      introLabel: "Verpflegung vor Ort",
      introTitle: "Frühstück<br class=\"br-desktop\" />&amp; gesellige Mahlzeiten",
      introLead:
        "Bestellen Sie im Voraus und genießen Sie Ihre Mahlzeit in Ihrem Ferienhaus oder auf der Terrasse. Alle unsere Speisen werden sorgfältig zubereitet, zum Mitnehmen oder vor Ort.",
      takeawayLabel: "Zum Mitnehmen",
      breakfastTitle: "Frühstücke",
      breakfastNote: "Bestellen Sie am Vortag vor 19 Uhr, um die Verfügbarkeit zu sichern.",
      groupLabel: "In der Gruppe",
      mealsTitle: "Gesellige Mahlzeiten",
      mealsNote: "Auf Reservierung · Ab 2 Personen je nach Angebot.",
    },
    partners: {
      metaTitle: "Unsere lokalen Partner – La Source d'Arimont in den Ardennen",
      metaDescription:
        "Partner des Domaine de la Source d'Arimont. Lokale Akteure, Handwerker und Anbieter, die Ihren Aufenthalt in der Region bereichern.",
      introLabel: "Unsere lokalen Partner",
      introTitle: "Unsere besten Adressen rund um das <br class=\"br-desktop\" />Anwesen",
      introLead: "Aktivitäten, Wellness und lokale Erlebnisse: profitieren Sie von ausgehandelten Vorteilen für unsere Gäste.",
      otherPartners: "Weitere Partner",
      staySelection:
        "Auswahl an Orten und Aktivitäten<br class=\"br-desktop\" />für Ihren Aufenthalt",
      featuredBadge: "Partner im Fokus",
      viewOffer: "Angebot ansehen",
      categoryWellness: "Wellness",
      categoryDining: "Verpflegung",
      categoryFamily: "Familie",
      categoryCulture: "Kultur",
      categoryOther: "Sonstiges",
    },
  },
};

const getDictionary = () => STATIC_TRANSLATIONS[getCurrentLanguage()] || STATIC_TRANSLATIONS.fr;

const resolvePath = (obj, path) => path.split(".").reduce((acc, key) => acc?.[key], obj);

export const t = (path, replacements = {}) => {
  const value = resolvePath(getDictionary(), path) ?? resolvePath(STATIC_TRANSLATIONS.fr, path) ?? path;
  if (typeof value !== "string") return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => replacements[key] ?? "");
};

const setText = (selector, value) => {
  const el = document.querySelector(selector);
  if (el && value != null) el.textContent = value;
};

const setHTML = (selector, value) => {
  const el = document.querySelector(selector);
  if (el && value != null) el.innerHTML = value;
};

const setAttr = (selector, attr, value) => {
  const el = document.querySelector(selector);
  if (el && value != null) el.setAttribute(attr, value);
};

const setTextAll = (selector, value) => {
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = value;
  });
};

const setAttrAll = (selector, attr, value) => {
  document.querySelectorAll(selector).forEach((el) => {
    el.setAttribute(attr, value);
  });
};

const setHTMLAll = (selector, value) => {
  document.querySelectorAll(selector).forEach((el) => {
    el.innerHTML = value;
  });
};

const setMeta = (selector, attr, value) => {
  const el = document.querySelector(selector);
  if (!el || value == null) return;
  if (attr === "textContent") {
    el.textContent = value;
    return;
  }
  el.setAttribute(attr, value);
};

const applySharedTranslations = () => {
  document.documentElement.lang = t("common.lang");

  setTextAll(".nav-links a[href='./index.html']", t("common.nav.home"));
  setTextAll(".nav-links a[href='./gites-chambres.html']", t("common.nav.lodgings"));
  setTextAll(".nav-links a[href='./groupes-seminaires.html']", t("common.nav.groups"));
  setTextAll(".nav-links a[data-nav='infrastructure']", t("common.nav.infrastructure"));
  setTextAll(".nav-links a[href='./la-region.html']", t("common.nav.region"));
  setTextAll(".nav-links a[href='./restauration.html']", t("common.nav.dining"));
  setTextAll(".mobile-menu .menu-link[href='./index.html']", t("common.nav.home"));
  setTextAll(".mobile-menu .menu-link[href='./gites-chambres.html']", t("common.nav.lodgings"));
  setTextAll(".mobile-menu .menu-link[href='./groupes-seminaires.html']", t("common.nav.groups"));
  setTextAll(".mobile-menu .menu-link[data-nav='infrastructure']", t("common.nav.infrastructure"));
  setTextAll(".mobile-menu .menu-link[href='./la-region.html']", t("common.nav.region"));
  setTextAll(".mobile-menu .menu-link[href='./restauration.html']", t("common.nav.dining"));
  setTextAll(".nav-cta", t("common.nav.book"));
  setTextAll(".mobile-menu-cta", t("common.nav.book"));
  setTextAll(".footer-rabbit-cta", t("common.nav.book"));
  setAttrAll(".nav-toggle", "aria-label", t("common.nav.openMenu"));
  setAttrAll(".nav-lang", "aria-label", t("common.nav.chooseLanguage"));
  setAttrAll(".nav-lang-menu", "aria-label", t("common.nav.otherLanguages"));
  setAttrAll(".hero-booking-close", "aria-label", t("common.nav.closeBookingForm"));

  const footerTitles = document.querySelectorAll(".footer-title");
  if (footerTitles[1]) footerTitles[1].textContent = t("common.footer.navigation");
  if (footerTitles[2]) footerTitles[2].textContent = t("common.footer.legal");
  setTextAll(".footer-links a[href='./index.html']", t("common.nav.home"));
  setTextAll(".footer-links a[href='./gites-chambres.html']", t("common.nav.lodgings"));
  setTextAll(".footer-links a[href='./la-region.html']", t("common.footer.discoverRegion"));
  setTextAll(".footer-links a[href='./restauration.html']", t("common.nav.dining"));
  setTextAll(".footer-links a[href='./nos-partenaires.html']", t("common.footer.partners"));
  setTextAll(".footer-links a[href='./contact.html']", t("common.footer.contact"));
  setTextAll(".footer-links a[href='./mentions-legales.html']", t("common.footer.legalNotice"));
  setTextAll(".footer-links a[href='./confidentialite-cookies.html']", t("common.footer.privacy"));
  setHTMLAll(".footer-bottom", t("common.footer.credit"));

  setTextAll(".section-footer-reviews .label", t("common.testimonials.label"));
  setHTMLAll(".section-footer-reviews .intro-text", t("common.testimonials.heading"));
  setTextAll(".section-footer-reviews .btn.btn-outline", t("common.testimonials.cta"));
  setAttrAll(".testimonials-prev", "aria-label", t("common.testimonials.previous"));
  setAttrAll(".testimonials-next", "aria-label", t("common.testimonials.next"));
};

const applyHomeTranslations = () => {
  if (!document.body.classList.contains("home-page")) return;
  setMeta("title", "textContent", t("home.metaTitle"));
  setMeta('meta[name="description"]', "content", t("home.metaDescription"));
  setMeta('meta[property="og:title"]', "content", t("home.metaTitle"));
  setMeta('meta[property="og:description"]', "content", t("home.metaDescription"));

  setHTML(".hero-split", t("home.heroTitle"));
  setText(".hero-cta", t("home.heroCta"));
  setHTML(".hero-note", t("home.heroNote"));
  setText(".scroll-cue-label", t("home.scroll"));
  const bookingLabels = document.querySelectorAll(".hero-booking-field span");
  if (bookingLabels[0]) bookingLabels[0].textContent = t("common.booking.checkin");
  if (bookingLabels[1]) bookingLabels[1].textContent = t("common.booking.checkout");
  if (bookingLabels[2]) bookingLabels[2].textContent = t("common.booking.adults");
  if (bookingLabels[3]) bookingLabels[3].textContent = t("common.booking.children");
  if (bookingLabels[4]) bookingLabels[4].textContent = t("common.booking.rooms");
  setText(".groups-label", t("home.groupsLabel"));
  setHTML(".groups-title", t("home.groupsTitle"));
  setHTML(".groups-lead", t("home.groupsLead"));
  const groupLabels = document.querySelectorAll(".groups-feat-label");
  if (groupLabels[0]) groupLabels[0].textContent = t("home.groupsPeople");
  if (groupLabels[1]) groupLabels[1].textContent = t("home.groupsStays");
  if (groupLabels[2]) groupLabels[2].textContent = t("home.groupsNature");
  setText(".groups-cta", t("home.groupsCta"));
  setText(".banner .label", t("home.bannerLabel"));
  setHTML(".banner-title", t("home.bannerTitle"));
  setText(".banner .btn", t("home.bannerCta"));
  const labels = document.querySelectorAll(".lodgings-slide-label");
  if (labels[0]) labels[0].textContent = t("home.lodgingsGitesLabel");
  if (labels[1]) labels[1].textContent = t("home.lodgingsRoomsLabel");
  const titles = document.querySelectorAll(".lodgings-slide-title");
  if (titles[0]) titles[0].innerHTML = t("home.lodgingsGitesTitle");
  if (titles[1]) titles[1].innerHTML = t("home.lodgingsRoomsTitle");
  const ctas = document.querySelectorAll(".lodgings-slide-overlay .btn");
  if (ctas[0]) ctas[0].textContent = t("home.lodgingsGitesCta");
  if (ctas[1]) ctas[1].textContent = t("home.lodgingsRoomsCta");
  setText("[data-home-lodgings-infra-label]", t("home.lodgingsInfraLabel"));
  setHTML("[data-home-lodgings-infra-title]", t("home.lodgingsInfraTitle"));
  setText("[data-home-lodgings-infra-cta]", t("home.lodgingsInfraCta"));
  setAttr("[data-home-lodgings-infra-image]", "alt", t("home.lodgingsInfraImageAlt"));
};

const applyContactTranslations = () => {
  if (!document.body.classList.contains("contact-page")) return;
  setMeta("title", "textContent", t("contact.metaTitle"));
  setMeta('meta[name="description"]', "content", t("contact.metaDescription"));
  setMeta('meta[property="og:title"]', "content", t("contact.metaTitle"));
  setMeta('meta[property="og:description"]', "content", t("contact.metaDescription"));
  setText(".contact-intro .label", t("contact.introLabel"));
  setHTML(".contact-intro .intro-text", t("contact.introTitle"));
  setText(".contact-intro p", t("contact.introLead"));
  setText('label[for="contact-nom"]', t("contact.fields.fullName"));
  setText('label[for="contact-email"]', t("contact.fields.email"));
  setText('label[for="contact-arrivee"]', t("contact.fields.checkin"));
  setText('label[for="contact-depart"]', t("contact.fields.checkout"));
  setText('label[for="contact-voyageurs"]', t("contact.fields.travellers"));
  setText('label[for="contact-hebergement"]', t("contact.fields.lodging"));
  setText('label[for="contact-message"]', t("contact.fields.message"));
  setAttr('#contact-nom', "placeholder", t("contact.placeholders.fullName"));
  setAttr('#contact-email', "placeholder", t("contact.placeholders.email"));
  setAttr('#contact-voyageurs', "placeholder", t("contact.placeholders.travellers"));
  setAttr('#contact-message', "placeholder", t("contact.placeholders.message"));
  const options = document.querySelectorAll("#contact-hebergement option");
  if (options[0]) options[0].textContent = t("contact.lodgingOptions.choose");
  if (options[6]) options[6].textContent = t("contact.lodgingOptions.room");
  if (options[7]) options[7].textContent = t("contact.lodgingOptions.other");
  setText(".contact-submit", t("contact.submit"));
  const infoLabels = document.querySelectorAll(".contact-info-block .label");
  if (infoLabels[0]) infoLabels[0].textContent = t("contact.info.findUs");
  if (infoLabels[1]) infoLabels[1].textContent = t("contact.info.contact");
  if (infoLabels[2]) infoLabels[2].textContent = t("contact.info.access");
  setText(".contact-map-link", t("contact.info.map"));
  const accessParagraph = document.querySelectorAll(".contact-info-block p")[0];
  if (accessParagraph) accessParagraph.innerHTML = t("contact.info.accessText");
};

const applyLegalTranslations = () => {
  if (!document.body.classList.contains("legal-page")) return;
  if (window.location.pathname.includes("mentions-legales")) {
    setMeta("title", "textContent", t("legalMentions.metaTitle"));
    setMeta('meta[name="description"]', "content", t("legalMentions.metaDescription"));
    setHTML(".legal-content .content-wrap", t("legalMentions.content"));
    return;
  }
  if (window.location.pathname.includes("confidentialite-cookies")) {
    setMeta("title", "textContent", t("privacy.metaTitle"));
    setMeta('meta[name="description"]', "content", t("privacy.metaDescription"));
    setHTML(".legal-content .content-wrap", t("privacy.content"));
  }
};

const applyGitesTranslations = () => {
  if (!document.body.classList.contains("gites-chambres-page")) return;
  setMeta("title", "textContent", t("gites.metaTitle"));
  setMeta('meta[name="description"]', "content", t("gites.metaDescription"));
  setMeta('meta[property="og:title"]', "content", t("gites.metaTitle"));
  setMeta('meta[property="og:description"]', "content", t("gites.metaDescription"));
  setHTML(".stays-hero .hero-banner-lead", t("gites.introLead"));
  setAttr(".stays-switch", "aria-label", t("gites.switchAria"));
  const tabs = document.querySelectorAll(".stays-switch-btn");
  if (tabs[0]) tabs[0].textContent = t("gites.tabGites");
  if (tabs[1]) tabs[1].textContent = t("gites.tabRooms");
  const noteLabels = document.querySelectorAll(".stays-notes-card .label");
  noteLabels.forEach((el) => (el.textContent = t("gites.notesLabel")));
  const noteTitles = document.querySelectorAll(".stays-notes-title");
  if (noteTitles[0]) noteTitles[0].textContent = t("gites.notesTitleGites");
  if (noteTitles[1]) noteTitles[1].textContent = t("gites.notesTitleRooms");
};

const applyRegionTranslations = () => {
  if (!document.body.classList.contains("region-page")) return;
  setMeta("title", "textContent", t("region.metaTitle"));
  setMeta('meta[name="description"]', "content", t("region.metaDescription"));
  setMeta('meta[property="og:title"]', "content", t("region.metaTitle"));
  setMeta('meta[property="og:description"]', "content", t("region.metaDescription"));
  setText(".region-intro .label", t("region.introLabel"));
  setHTML(".region-intro .intro-text", t("region.introTitle"));
  const labels = document.querySelectorAll(".region-list-section .label");
  if (labels[0]) labels[0].textContent = t("region.placesLabel");
  setAttr(".region-activities-switch", "aria-label", t("region.filterAria"));
  const switchBtns = document.querySelectorAll(".region-activities-switch-btn");
  if (switchBtns[0]) switchBtns[0].textContent = t("region.outdoor");
  if (switchBtns[1]) switchBtns[1].textContent = t("region.indoor");
  setAttr(".region-activities-prev", "aria-label", t("common.testimonials.previous"));
  setAttr(".region-activities-next", "aria-label", t("common.testimonials.next"));
  setAttr("#region-map", "aria-label", t("region.mapAria"));
  setText(".region-map-label", t("region.mapLabel"));
  setHTML(".region-map-title", t("region.mapTitle"));
  setHTML(".region-map-lead", t("region.mapLead"));
  setHTML(".region-map-note", t("region.mapNote"));
  setAttr(".region-video-desktop", "aria-label", t("region.videoAria"));
  setAttr(".region-video-mobile", "aria-label", t("region.videoMobileAria"));
};

const applyRestaurationTranslations = () => {
  if (!document.body.classList.contains("restauration-page")) return;
  setMeta("title", "textContent", t("restauration.metaTitle"));
  setMeta('meta[name="description"]', "content", t("restauration.metaDescription"));
  setMeta('meta[property="og:title"]', "content", t("restauration.metaTitle"));
  setMeta('meta[property="og:description"]', "content", t("restauration.metaDescription"));
  setText(".restauration-intro .label", t("restauration.introLabel"));
  setHTML(".restauration-title", t("restauration.introTitle"));
  setText(".hero-banner-lead", t("restauration.introLead"));
  const sectionLabels = document.querySelectorAll(".restauration-section-header .label");
  if (sectionLabels[0]) sectionLabels[0].textContent = t("restauration.takeawayLabel");
  if (sectionLabels[1]) sectionLabels[1].textContent = t("restauration.groupLabel");
  const sectionTitles = document.querySelectorAll(".restauration-section-header .intro-text");
  if (sectionTitles[0]) sectionTitles[0].textContent = t("restauration.breakfastTitle");
  if (sectionTitles[1]) sectionTitles[1].textContent = t("restauration.mealsTitle");
  const notes = document.querySelectorAll(".section-note");
  if (notes[0]) notes[0].textContent = t("restauration.breakfastNote");
  if (notes[1]) notes[1].textContent = t("restauration.mealsNote");
};

const applyPartnersTranslations = () => {
  if (!document.body.classList.contains("partners-page")) return;
  setMeta("title", "textContent", t("partners.metaTitle"));
  setMeta('meta[name="description"]', "content", t("partners.metaDescription"));
  setMeta('meta[property="og:title"]', "content", t("partners.metaTitle"));
  setMeta('meta[property="og:description"]', "content", t("partners.metaDescription"));
  setText(".partners-intro .label", t("partners.introLabel"));
  setHTML(".partners-title", t("partners.introTitle"));
  setText(".partners-lead", t("partners.introLead"));
  const labels = document.querySelectorAll(".partners-list-section .label");
  if (labels[0]) labels[0].textContent = t("partners.otherPartners");
  setHTML(".partners-list-section .intro-text", t("partners.staySelection"));
};

export const applyStaticTranslations = () => {
  applySharedTranslations();
  applyHomeTranslations();
  applyContactTranslations();
  applyLegalTranslations();
  applyGitesTranslations();
  applyRegionTranslations();
  applyRestaurationTranslations();
  applyPartnersTranslations();
};
