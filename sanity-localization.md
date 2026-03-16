# Sanity localization setup

This frontend now reads the current language from `?lang=fr|en|nl|de` and asks Sanity for documents in that language, with fallback to:

1. untranslated documents without a `language` field
2. French documents (`fr`)

## What to add in Sanity Studio

Use document-level localization with `@sanity/document-internationalization`.

### 1. Install the plugin

```bash
npm install @sanity/document-internationalization
```

### 2. Register it in `sanity.config.ts`

```ts
import {documentInternationalization} from '@sanity/document-internationalization'

export default defineConfig({
  // ...
  plugins: [
    documentInternationalization({
      supportedLanguages: [
        {id: 'fr', title: 'Francais'},
        {id: 'en', title: 'English'},
        {id: 'nl', title: 'Nederlands'},
        {id: 'de', title: 'Deutsch'},
      ],
      schemaTypes: [
        'homePage',
        'temoignage',
        'formule',
        'lieuRegion',
        'logement',
        'partenaire',
      ],
    }),
  ],
})
```

### 3. Add a `language` field on localized document types

```ts
defineField({
  name: 'language',
  title: 'Language',
  type: 'string',
  readOnly: true,
  hidden: true,
})
```

### 4. Translate these document types first

- `homePage`
- `temoignage`
- `formule`
- `lieuRegion`
- `logement`
- `partenaire`

## Frontend behavior

- Current language is stored in `localStorage`
- The language menu rewrites links to the current page with `?lang=xx`
- Sanity queries now try the requested language first

## Important limitation

Only Sanity-driven content is language-aware after this change.

Static HTML text is still hardcoded in French in the templates:

- page titles and meta tags
- navigation labels
- footer labels
- static section headings and paragraphs

If you want the whole site fully translated, the next step is to move those texts either:

1. into Sanity
2. or into a frontend translation dictionary
