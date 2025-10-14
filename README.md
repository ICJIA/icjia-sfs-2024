# Safe From the Start (SFS)

The Safe From the Start (SFS) program provides developmentally and culturally appropriate direct services to children, ages 0 – 5, who have witnessed or been exposed to violence and their families. SFS focuses on serving young children who are victims of abuse, neglect, or maltreatment, and/or witnesses to domestic violence, sexual assault, or other violent crimes.

**Live Site:** https://sfs.icjia.illinois.gov/

## Technology Stack

- **Framework:** Nuxt 4.1.3 (migrated from Nuxt 3 on October 14, 2024)
- **Content Management:** Nuxt Content v2.13.4
- **UI Framework:** Vuetify 3.7.14
- **Deployment:** Netlify (Static Site Generation)
- **Node.js:** 20.x
- **Package Manager:** Yarn 1.22.22

## Nuxt 4 Migration

**✅ Successfully migrated to Nuxt 4 on October 14, 2024**

This project has been upgraded from Nuxt 3 to Nuxt 4 with the recommended `/app` directory structure. The migration included:

- Upgrade to Nuxt 4.1.3 with Nitro 2.12.7 and Vite 7.1.10
- Adoption of `/app` directory structure for better code organization
- Updated path aliases (`@/` → `/app`, `@@/` → project root)
- Node.js version upgrade to 20.x for compatibility
- All 30 routes successfully prerendering

### Migration Documentation

**📖 For detailed migration documentation, see [MIGRATION.md](./MIGRATION.md)**

The migration guide includes:

- Step-by-step upgrade instructions
- Common issues and solutions
- Rollback procedures
- Path alias reference
- Testing and verification procedures

**🤖 For AI-assisted migrations, see [MIGRATION-PROMPT.md](./MIGRATION-PROMPT.md)**

This comprehensive LLM prompt can be used with Claude, GPT-4, or other AI assistants to guide them through migrating similar ICJIA projects from Nuxt 3 to Nuxt 4. Simply copy the prompt and paste it into a conversation with your preferred LLM to automate the migration process.

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
└── MIGRATION.md           # Nuxt 4 migration guide
```

## Installation

### Prerequisites

- Node.js 20.x or higher (specified in `.nvmrc`)
- Yarn 1.22.22 (recommended) or npm

### Install Dependencies

```bash
yarn install
```

## Development

### Start Development Server

The dev server runs on `http://localhost:8000` and includes:

- Automatic cache clearing
- Build script execution (pages, routes, sitemap)
- Hot module replacement

```bash
yarn dev
```

### Available Scripts

```bash
# Development
yarn dev                    # Start dev server with cache clearing
yarn build                  # Build for production (SSR)

# Static Site Generation
yarn generate               # Generate static site
yarn generate:serve         # Generate and preview locally

# Build Scripts
yarn scripts                # Run all build scripts
yarn create:pages           # Generate pages.json from content
yarn create:routes          # Generate routes for prerendering
yarn create:siteMap         # Generate sitemap.xml

# Accessibility Testing
node accessibility-audit.mjs # Run WCAG 2.1 Level AA compliance audit

# Utilities
yarn clear:cache            # Clear .nuxt and .output directories
```

## Production

### Build for Production

Generate static site for deployment:

```bash
yarn generate
```

**Output:** `.output/public` directory containing static files

### Preview Production Build

```bash
yarn generate:serve
```

This will:

1. Clear cache
2. Run build scripts
3. Generate static site
4. Serve on local server for preview

### Deployment

The site is deployed to Netlify with the following configuration:

- **Build Command:** `yarn generate`
- **Publish Directory:** `.output/public`
- **Node Version:** 20.x (from `.nvmrc`)
- **Build Time:** ~1-2 minutes
- **Routes Prerendered:** 30 routes

## Key Features

- **Static Site Generation:** All pages pre-rendered for optimal performance
- **Content Management:** Markdown-based content with Nuxt Content
- **Responsive Design:** Mobile-first design with Vuetify components
- **SEO Optimized:** Meta tags, sitemap, and semantic HTML
- **Accessibility:** WCAG 2.1 Level AA compliant with automated testing
- **Analytics:** Google Analytics integration via nuxt-gtag
- **Image Optimization:** Thumbor integration for responsive images
- **Auto-routing:** File-based routing from `/app/pages`

## Accessibility

**✅ WCAG 2.1 Level AA Compliant**

This site has been audited for accessibility compliance and meets WCAG 2.1 Level AA standards.

### Accessibility Audit

**📖 For the complete accessibility audit report, see [ACCESSIBILITY-AUDIT-REPORT.md](./ACCESSIBILITY-AUDIT-REPORT.md)**

**📋 For testing instructions and guidelines, see [ACCESSIBILITY-TESTING-GUIDE.md](./ACCESSIBILITY-TESTING-GUIDE.md)**

**Last Audit:** October 14, 2025
**Status:** ✅ PASSED - 0 violations
**Pages Tested:** 8
**Standard:** WCAG 2.1 Level AA

### Running Accessibility Tests

To run the automated accessibility audit:

```bash
# Make sure dev server is running
yarn dev

# In a separate terminal, run the audit
node accessibility-audit.mjs
```

The audit will:

- Test all 8 major pages against WCAG 2.1 Level AA standards
- Generate detailed JSON reports in `./accessibility-reports/`
- Display a summary of violations by severity
- Provide actionable fix recommendations

**Note:** The dev server must be running on `http://localhost:8000` before running the audit.

### Accessibility Features

- ✅ **Skip Navigation Links** - Keyboard-accessible skip to main content
- ✅ **Semantic HTML** - Proper landmark regions (nav, main, header, footer)
- ✅ **ARIA Attributes** - Comprehensive labels on interactive elements
- ✅ **Keyboard Navigation** - Full keyboard support with visible focus indicators
- ✅ **Screen Reader Support** - Descriptive labels and alt text
- ✅ **Color Contrast** - WCAG AA compliant contrast ratios
- ✅ **Responsive Design** - Accessible on all device sizes

### Audit History

| Date       | Status    | Violations | Notes                                             |
| ---------- | --------- | ---------- | ------------------------------------------------- |
| 2025-10-14 | ✅ PASSED | 0          | Initial comprehensive audit - all issues resolved |

## Development Notes

### Path Aliases

With Nuxt 4's `/app` directory structure:

- `@/` or `~/` → Points to `/app` directory
- `@@/` or `~~/` → Points to project root

**Examples:**

```javascript
// Import from /app
import Foo from "@/components/Foo.vue";
import { bar } from "@/utils/bar.js";

// Import from project root
import config from "@@/src/json/config.json";
```

### Auto-Imports

Nuxt automatically imports:

- Components from `/app/components`
- Composables from `/app/composables`
- Utils from `/app/utils`
- Vue APIs (ref, computed, etc.)
- Nuxt APIs (useRoute, useHead, etc.)

### Content Structure

Content is managed in `/content` directory using Nuxt Content:

- Markdown files with frontmatter
- Queried using `queryContent()` API
- Automatically parsed and rendered

## Troubleshooting

### Common Issues

**Build fails with "Cannot find module":**

- Check import paths use correct aliases (`@/` for `/app`, `@@/` for root)
- Clear cache: `yarn clear:cache`

**CSS not loading:**

- Verify CSS paths in `nuxt.config.js` use `@/` alias
- Check SCSS import paths are relative to file location

**Dev server won't start:**

- Ensure Node.js 20.x is installed: `node --version`
- Clear cache and reinstall: `rm -rf node_modules yarn.lock && yarn install`

**For more troubleshooting, see [MIGRATION.md](./MIGRATION.md#troubleshooting)**

## Contributing

This is an ICJIA (Illinois Criminal Justice Information Authority) project. For questions or contributions, please contact the ICJIA development team.

## License

This project is maintained by the Illinois Criminal Justice Information Authority.
