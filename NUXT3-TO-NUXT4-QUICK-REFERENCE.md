# Nuxt 3 to Nuxt 4 Migration - Quick Reference Card

**Print this page or bookmark it for quick access during migration**

---

## 🚀 Quick Start

```bash
# 1. Backup
git tag -a pre-nuxt-4-migration -m "Backup before Nuxt 4 upgrade"

# 2. Update Node.js
echo "20" > .nvmrc
nvm use 20

# 3. Update dependencies
yarn install  # or: npm install

# 4. Test
yarn dev
yarn generate
```

---

## 📋 6-Phase Overview

| Phase | Focus | Time | Status |
|-------|-------|------|--------|
| 1 | Preparation & Backup | 10 min | [ ] |
| 2 | Nuxt 4 Upgrade | 20 min | [ ] |
| 3 | /app Directory | 15 min | [ ] |
| 4 | Fix Issues | 30 min | [ ] |
| 5 | Final Testing | 20 min | [ ] |
| 6 | Commit & Deploy | 10 min | [ ] |

---

## 🔧 Key Changes

### package.json
```json
{
  "nuxt": "^4.0.0",           // from ^3.x.x
  "@nuxt/content": "^2.13.4", // KEEP at v2 (not v3!)
  "@nuxt/image": "^1.11.0"
}
```

### .nvmrc
```
20  // from 18
```

### nuxt.config.js
```javascript
// REMOVE:
future: { compatibilityVersion: 4 }
experimental: { appManifest: false }

// CHANGE:
generate.routes → nitro.prerender.routes
```

### CSS Paths
```javascript
// CHANGE:
"../assets/css/app.css"

// TO:
"@/assets/css/app.css"
```

---

## 📁 Directory Changes

### Move to /app
- app.vue
- app.config.js
- components/
- composables/
- pages/
- plugins/
- assets/
- middleware/ (if exists)
- layouts/ (if exists)

### Stay in Root
- content/
- public/
- server/
- nuxt.config.js
- package.json
- .nvmrc

---

## 🎯 Path Aliases

| Alias | Points To | Use For |
|-------|-----------|---------|
| `@/` | `/app` | App code |
| `@@/` | Project root | Config, content |
| `~/` | `/app` | App code |
| `~~/` | Project root | Config, content |

---

## ⚠️ Common Issues & Fixes

| Error | Fix |
|-------|-----|
| SCSS import error | Add extra `../` to path |
| Cannot find module | Use correct alias (`@/` or `@@/`) |
| Netlify build fails | Check `.nvmrc` has `20` |
| Content queries fail | Ensure `@nuxt/content` is v2.13.4 |
| Hydration mismatch | Normal during migration, resolves on rebuild |

---

## 🚫 Don't Do This

1. ❌ Upgrade @nuxt/content to v3 (do that separately later)
2. ❌ Forget to update .nvmrc (Netlify will fail)
3. ❌ Use @/ for project root files (use @@/ instead)
4. ❌ Skip git backup tags (you'll regret it)
5. ❌ Combine Nuxt 4 + Content v3 migrations (too risky)

---

## ✅ Success Checklist

- [ ] `yarn dev` runs without errors
- [ ] `yarn generate` completes successfully
- [ ] All routes prerender (count matches original)
- [ ] No console errors in browser
- [ ] All pages load correctly
- [ ] CSS/images load properly
- [ ] Navigation works
- [ ] Git history is clean

---

## 🔄 Rollback Commands

```bash
# Rollback to before /app migration
git reset --hard pre-app-directory-migration
rm -rf node_modules yarn.lock .nuxt .output
yarn install

# Rollback to before Nuxt 4 upgrade
git reset --hard pre-nuxt-4-migration
rm -rf node_modules yarn.lock .nuxt .output
yarn install
```

---

## 📚 Full Guide

For complete details, see: `MIGRATION-PROMPT.md`

---

## 🆘 Getting Help

### For Developers
1. Check "Common Issues" section above
2. Refer to full migration guide
3. Check git log for recent changes

### For LLM Assistance
1. Share your project structure
2. Reference specific phase: "Help with Phase 2"
3. Provide error messages
4. Ask LLM to verify checklist items

---

## 📞 Key Contacts

- **Nuxt Docs:** https://nuxt.com/docs/migration/overview
- **Nuxt Content v3:** https://content.nuxt.com/
- **Netlify Docs:** https://docs.netlify.com/

---

## 📝 Notes

```
Project: ___________________
Started: ___________________
Completed: ___________________
Issues Found: ___________________
```

---

**Last Updated:** October 2025  
**Version:** 2.0 (Universal Guide)

