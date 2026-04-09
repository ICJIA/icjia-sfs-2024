# Safe From the Start (SFS)

The Safe From the Start (SFS) program provides developmentally and culturally appropriate direct services to children, ages 0 -- 5, who have witnessed or been exposed to violence and their families. SFS focuses on serving young children who are victims of abuse, neglect, or maltreatment, and/or witnesses to domestic violence, sexual assault, or other violent crimes.

**Live Site:** https://sfs.icjia.illinois.gov/

## Technology Stack

- **Framework:** Nuxt 4.1.3
- **Content Management:** Nuxt Content v3.7.1
- **UI Framework:** Vuetify 3.7.14
- **Deployment:** Netlify (Static Site Generation)
- **Node.js:** 22.x (see `.nvmrc`)
- **Package Manager:** Yarn 1.22.22

## Project Structure

```
/
├── app/                    # Application code (Nuxt 4 convention)
│   ├── app.vue            # Root component
│   ├── app.config.js      # App configuration
│   ├── assets/            # CSS, images, fonts
│   ├── components/        # Vue components
│   ├── composables/       # Composable functions
│   ├── pages/             # Page components (auto-routed)
│   ├── plugins/           # Nuxt plugins (Vuetify, etc.)
│   └── utils/             # Utility functions
├── content/               # Markdown content (Nuxt Content)
├── creators/              # Build scripts (pages, routes, sitemap)
├── public/                # Static assets
├── server/                # Server plugins and middleware
├── src/                   # Generated JSON files
├── nuxt.config.js         # Nuxt configuration
└── content.config.ts      # Nuxt Content collection definitions
```

## Installation

### Prerequisites

- Node.js 22.x (specified in `.nvmrc`)
- Yarn 1.22.22 (recommended) or npm

```bash
nvm use          # Automatically reads .nvmrc
yarn install
```

## Development

```bash
yarn dev         # Start dev server on http://localhost:8000
```

## Available Scripts

```bash
yarn dev                    # Dev server with cache clearing and HMR
yarn build                  # Build for production (SSR)
yarn generate               # Generate static site
yarn generate:serve         # Generate and preview locally

yarn scripts                # Run all build scripts
yarn create:pages           # Generate pages.json from content
yarn create:routes          # Generate routes for prerendering
yarn create:siteMap         # Generate sitemap.xml

yarn clear:cache            # Clear .nuxt and .output directories
yarn audit:a11y             # Run WCAG 2.1 Level AA accessibility audit
yarn docs:all               # Generate all documentation
```

## Production

### Static Site Generation

```bash
yarn generate
```

Output: `.output/public/` directory containing pre-rendered static files.

### Deployment

Deployed to Netlify with:

| Setting               | Value            |
|-----------------------|------------------|
| **Build Command**     | `yarn generate`  |
| **Publish Directory** | `.output/public` |
| **Node Version**      | 22.x (`.nvmrc`)  |

## Routes

| Route                  | Description                            |
|------------------------|----------------------------------------|
| `/`                    | Homepage with hero image               |
| `/about`               | About the SFS program                  |
| `/childhood-exposure`  | Childhood exposure to violence info    |
| `/program-summary`     | Program overview and core components   |
| `/research`            | Research goals, publications, outcomes |
| `/resources`           | Related resources                      |
| `/sites`               | SFS program sites with interactive map |
| `/privacy`             | Privacy policy                         |

## Key Features

- **Static Site Generation** -- All pages pre-rendered for performance
- **Markdown Content** -- Managed via Nuxt Content with frontmatter
- **Responsive Design** -- Mobile-first with Vuetify components
- **Accessibility** -- WCAG 2.1 Level AA compliant
- **Image Optimization** -- Thumbor integration for responsive WebP images
- **SEO** -- Meta tags, sitemap, and semantic HTML
- **Analytics** -- Google Analytics via nuxt-gtag

## Accessibility

WCAG 2.1 Level AA compliant. Features include:

- Skip-to-main-content link
- Semantic HTML landmarks
- ARIA labels on interactive elements
- Full keyboard navigation
- Screen reader support
- WCAG AA color contrast

Run accessibility tests:

```bash
yarn dev          # Start dev server first
yarn audit:a11y   # Run axe-core audit against all pages
```

## Path Aliases

With Nuxt 4's `/app` directory structure:

- `@/` or `~/` -- Points to `/app` directory
- `@@/` or `~~/` -- Points to project root

```javascript
import Foo from "@/components/Foo.vue";       // /app/components/Foo.vue
import config from "@@/src/json/config.json"; // /src/json/config.json
```

## Migration Documentation

This project was migrated from Nuxt 3 to Nuxt 4 and from Nuxt Content v2 to v3. Migration guides are available for reference:

- [MIGRATION-PROMPT.md](./MIGRATION-PROMPT.md) -- Universal Nuxt 3 to 4 migration guide (LLM-ready)
- [NUXT-CONTENT-MIGRATION.md](./NUXT-CONTENT-MIGRATION.md) -- Nuxt Content v2 to v3 migration guide
- [MIGRATION.md](./MIGRATION.md) -- Project-specific migration notes
- [NUXT3-TO-NUXT4-QUICK-REFERENCE.md](./NUXT3-TO-NUXT4-QUICK-REFERENCE.md) -- Quick reference card

## Documentation Portal

The project includes a documentation portal with test results, accessibility reports, and API docs:

```bash
yarn docs:all     # Generate all documentation
```

- Test results: `/docs/tests/`
- Accessibility audits: `/docs/accessibility/`
- API docs: `/docs/jsdoc/`

See [DOCUMENTATION-PORTAL-PROMPT.md](./markdown-documentation/DOCUMENTATION-PORTAL-PROMPT.md) for replicating this setup in other projects.

## License

MIT License. See [LICENSE](./LICENSE) for details.

## Contributing

This is an [Illinois Criminal Justice Information Authority](https://icjia.illinois.gov) project. For questions or contributions, please contact the ICJIA development team.
