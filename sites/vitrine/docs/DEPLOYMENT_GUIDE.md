# Guide de Déploiement Firebase - Site Vitrine ImuChat

Ce guide vous explique comment déployer le site vitrine ImuChat sur Firebase Hosting.

## 📋 Prérequis

### 1. Firebase CLI installé

Vérifier l'installation :

```bash
firebase --version
```

Si non installé :

```bash
npm install -g firebase-tools
```

### 2. Compte Firebase configuré

Le projet Firebase est déjà configuré :

- **Project ID** : `imuchat-378ad`
- **Hosting Site** : `imuchat-378ad-e8298`

## 🔧 Configuration actuelle

### ✅ Next.js configuré pour l'export statique

[next.config.mjs](../next.config.mjs) :

```javascript
output: "export",  // Génère un site statique
images: {
  unoptimized: true  // Nécessaire pour l'export statique
}
```

### ✅ Firebase Hosting configuré

[firebase.json](../firebase.json) :

- **Public directory** : `out` (sortie de Next.js)
- **Clean URLs** : Activés (pas de `.html` dans les URLs)
- **Cache optimisé** : Headers configurés pour performance
- **Redirection racine** : `/` → `/fr` (langue par défaut)

### ✅ Scripts npm disponibles

```json
{
  "deploy": "pnpm build && firebase deploy --only hosting",
  "deploy:preview": "pnpm build && firebase hosting:channel:deploy preview",
  "firebase:login": "firebase login",
  "firebase:init": "firebase init"
}
```

## 🚀 Processus de déploiement

### Étape 1 : Connexion à Firebase

```bash
cd /Users/nathanimogo/Documents/GitHub/imuchat_global/site-vitrine
pnpm firebase:login
```

Cela ouvrira votre navigateur pour l'authentification Google.

### Étape 2 : Build du projet

```bash
pnpm build
```

Ce qui va :

1. Compiler TypeScript
2. Générer les pages statiques pour les 5 locales (fr, en, de, es, ja)
3. Optimiser CSS et JS
4. Créer le dossier `/out` avec le site statique complet

**Sortie attendue** :

```
Route (app)                              Size     First Load JS
┌ ○ /[locale]                            X kB           X kB
├ ○ /[locale]/about                      X kB           X kB
├ ○ /[locale]/ai                         X kB           X kB
├ ○ /[locale]/contact                    X kB           X kB
├ ○ /[locale]/developers                 X kB           X kB
├ ○ /[locale]/features                   X kB           X kB
├ ○ /[locale]/legal                      X kB           X kB
├ ○ /[locale]/news                       X kB           X kB
├ ○ /[locale]/partners                   X kB           X kB
├ ○ /[locale]/privacy                    X kB           X kB
├ ○ /[locale]/product                    X kB           X kB
└ ○ /[locale]/terms                      X kB           X kB

○ Static (SSG)
```

### Étape 3 : Vérifier le build localement

```bash
# Option 1 : Serveur simple Python
cd out
python3 -m http.server 8080

# Option 2 : Firebase Hosting émulateur
firebase serve
```

Ouvrir <http://localhost:8080> (ou 5000 avec Firebase) et vérifier :

- ✅ Toutes les pages se chargent
- ✅ Navigation fonctionne
- ✅ Images OG présentes dans les métadonnées
- ✅ PWA icons accessibles
- ✅ Traductions correctes

### Étape 4 : Déploiement preview (recommandé)

```bash
pnpm deploy:preview
```

Cela crée un **channel preview** temporaire pour tester avant prod.

**Avantages** :

- URL temporaire comme `https://imuchat-378ad-e8298--preview-xxxxx.web.app`
- Ne touche pas la production
- Peut être partagé avec l'équipe pour validation
- Expire automatiquement après 7 jours

### Étape 5 : Déploiement production

Après validation du preview :

```bash
pnpm deploy
```

Ou manuellement :

```bash
pnpm build
firebase deploy --only hosting
```

**Sortie attendue** :

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/imuchat-378ad/overview
Hosting URL: https://imuchat-378ad-e8298.web.app
```

## 🌐 URLs du site après déploiement

### URLs principales

- **Production** : `https://imuchat-378ad-e8298.web.app`
- **Custom domain** (si configuré) : `https://imuchat.app`

### URLs par langue

- 🇫🇷 Français : `https://imuchat.app/fr`
- 🇬🇧 English : `https://imuchat.app/en`
- 🇩🇪 Deutsch : `https://imuchat.app/de`
- 🇪🇸 Español : `https://imuchat.app/es`
- 🇯🇵 日本語 : `https://imuchat.app/ja`

### URLs des pages

Exemple pour la page partenaires :

- `https://imuchat.app/fr/partners`
- `https://imuchat.app/en/partners`
- etc.

## 🔍 Validation post-déploiement

### 1. Tester toutes les pages

```bash
# Script de vérification rapide
curl -I https://imuchat-378ad-e8298.web.app/fr
curl -I https://imuchat-378ad-e8298.web.app/en
curl -I https://imuchat-378ad-e8298.web.app/fr/partners
curl -I https://imuchat-378ad-e8298.web.app/fr/news
```

Toutes les requêtes doivent retourner **200 OK**.

### 2. Valider les Open Graph images

**Facebook Debugger** :

```
https://developers.facebook.com/tools/debug/
```

Tester avec : `https://imuchat.app/fr/partners`

**LinkedIn Post Inspector** :

```
https://www.linkedin.com/post-inspector/
```

**Twitter Card Validator** :

```
https://cards-dev.twitter.com/validator
```

### 3. Vérifier le SEO

**Google Search Console** :

1. Soumettre le sitemap : `https://imuchat.app/sitemap.xml`
2. Demander l'indexation des nouvelles pages (partners, news)

**Test Lighthouse** :

```bash
# Via Chrome DevTools
# Ou en ligne de commande
lighthouse https://imuchat.app/fr --view
```

Objectifs :

- 🎯 Performance : > 90
- 🎯 Accessibility : > 95
- 🎯 Best Practices : > 95
- 🎯 SEO : 100

### 4. Tester la PWA

- Ouvrir `https://imuchat.app/fr` dans Chrome/Edge
- Cliquer sur l'icône d'installation dans la barre d'adresse
- Vérifier que les icons 192×192 et 512×512 s'affichent correctement

## 🔄 Workflow de déploiement continu

### Option 1 : Déploiement manuel (actuel)

```bash
# Après chaque modification importante
pnpm deploy:preview   # Tester
pnpm deploy          # Déployer en prod
```

### Option 2 : GitHub Actions (recommandé)

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Install dependencies
        run: pnpm install
        working-directory: ./site-vitrine
      
      - name: Build
        run: pnpm build
        working-directory: ./site-vitrine
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: imuchat-378ad
          entryPoint: ./site-vitrine
```

## 🛠️ Résolution de problèmes

### Problème : "Firebase login failed"

**Solution** :

```bash
firebase logout
firebase login --reauth
```

### Problème : "Build failed - Module not found"

**Solution** :

```bash
# Nettoyer et réinstaller
rm -rf node_modules .next out
pnpm install
pnpm build
```

### Problème : "404 sur certaines pages après déploiement"

**Cause** : Pages non générées pendant le build.

**Solution** : Vérifier que toutes les pages sont dans `/out` après build :

```bash
pnpm build
ls -R out/
```

### Problème : "Images OG ne s'affichent pas sur les réseaux sociaux"

**Solution** :

1. Vérifier que les images sont dans `/public`
2. Forcer le cache des réseaux sociaux :
   - Facebook Debugger : Cliquer "Scrape Again"
   - LinkedIn : Ajouter `?v=1` à l'URL
   - Twitter : Attendre 30min pour le cache

### Problème : "Site lent après déploiement"

**Solution** : Vérifier le Lighthouse et optimiser :

```bash
# Analyser le bundle
pnpm build
du -sh out/*
```

Si trop gros :

- Optimiser les images (déjà fait avec `unoptimized: true`)
- Code splitting automatique par Next.js
- Utiliser `next/dynamic` pour chargement différé

## 📊 Monitoring post-déploiement

### Firebase Hosting Metrics

Console Firebase → Hosting → Usage :

- **Requests** : Nombre de requêtes
- **Bandwidth** : Bande passante utilisée
- **Storage** : Espace utilisé (site statique)

### Firebase Performance Monitoring (optionnel)

Pour ajouter le monitoring :

1. Installer le SDK :

```bash
pnpm add firebase
```

1. Ajouter dans `app/layout.tsx` :

```typescript
import { getPerformance } from 'firebase/performance';
// ... init Firebase
const perf = getPerformance(app);
```

### Google Analytics 4 (recommandé)

Ajouter GA4 pour le tracking utilisateurs :

1. Créer une propriété GA4
2. Ajouter le script dans `app/[locale]/layout.tsx`
3. Suivre : pages vues, conversions, engagement

## 🔐 Sécurité

### Headers de sécurité

Ajouter dans `firebase.json` (déjà configuré) :

```json
{
  "source": "**",
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    }
  ]
}
```

### Domaine personnalisé avec SSL

1. Console Firebase → Hosting → Ajouter un domaine personnalisé
2. Suivre les instructions DNS
3. Firebase génère automatiquement un certificat SSL gratuit

Exemple de configuration DNS :

```
Type  Name            Value
A     imuchat.app     Firebase IP
TXT   imuchat.app     firebase=imuchat-378ad
```

## 📝 Checklist de déploiement

Avant chaque déploiement production :

- [ ] Build local réussi (`pnpm build`)
- [ ] Test local avec `firebase serve`
- [ ] Toutes les 12 pages accessibles
- [ ] Images OG présentes dans `/public`
- [ ] Traductions FR/EN complètes
- [ ] Pas d'erreurs de console
- [ ] Lighthouse > 90 sur toutes les métriques
- [ ] Preview déployé et validé
- [ ] Commit et push sur Git
- [ ] Déploiement production (`pnpm deploy`)
- [ ] Validation post-déploiement (curl + debuggers)
- [ ] Sitemaps soumis à Google Search Console

## 🎯 Prochaines étapes recommandées

1. **Configurer le domaine personnalisé** : `imuchat.app`
2. **Activer Firebase Performance Monitoring**
3. **Ajouter Google Analytics 4**
4. **Configurer CI/CD avec GitHub Actions**
5. **Créer un environnement de staging** (channel preview permanent)
6. **Mettre en place des tests E2E** (Playwright/Cypress)
7. **Monitoring des erreurs** (Sentry)

---

**Dernière mise à jour** : 11 février 2026
**Version du site** : 1.0.0 (12 pages, 5 langues, 12 images OG)
