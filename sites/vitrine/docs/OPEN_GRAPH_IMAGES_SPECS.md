# Spécifications des images Open Graph - ImuChat

## Vue d'ensemble

Ce document définit toutes les images Open Graph (OG) et PWA nécessaires pour le site vitrine ImuChat. Ces images sont essentielles pour l'apparence professionnelle du site lors des partages sur les réseaux sociaux et l'installation de la PWA.

## 📐 Formats requis

### Images Open Graph (Réseaux sociaux)

- **Dimensions** : 1200 × 630 pixels
- **Format** : PNG (pour la qualité) ou JPG (pour la taille)
- **Ratio** : 1.91:1
- **Taille max** : 8 MB (recommandé : < 300 KB)
- **Usage** : Facebook, LinkedIn, Twitter/X, Discord, Slack, etc.

### PWA Icons (Application web progressive)

- **Formats requis** :
  - `icon-192x192.png` : 192 × 192 pixels
  - `icon-512x512.png` : 512 × 512 pixels
- **Format** : PNG avec transparence
- **Usage** : Écran d'accueil mobile, app launcher

## 🎨 Guidelines de design

### Palette de couleurs ImuChat

```
Primary Violet : #8B5CF6
Secondary Pink : #EC4899
Dark Background : #0F172A (Slate 900)
Light Gray : #F1F5F9 (Slate 100)
```

### Éléments de marque

- **Logo** : Utiliser le logo ImuChat (à créer si nécessaire)
- **Typographie** : Inter (font utilisée sur le site)
- **Style** : Moderne, épuré, technologique
- **Gradients** : Utiliser les gradients violet → rose du site

### Composition recommandée

1. **Zone de sécurité** : Garder 80px de marge sur tous les côtés
2. **Titre** : 60-80px, bold, maximum 45 caractères
3. **Sous-titre** : 32-40px, regular, maximum 80 caractères
4. **Logo** : Coin supérieur gauche ou centré
5. **Arrière-plan** : Gradient ou forme géométrique avec le thème ImuChat

## 📝 Images à créer

### 1. Page d'accueil : `og-image-home.png`

**Objectif** : Image principale représentant ImuChat
**Contenu suggéré** :

- Titre : "ImuChat - La super-app européenne"
- Sous-titre : "Communication, collaboration, intelligence artificielle"
- Visuel : Mockup multi-plateforme (Web + Mobile + Desktop)
- Badge : "Programme PEPITE"

### 2. Page produit : `og-image-product.png`

**Objectif** : Mettre en avant les applications
**Contenu suggéré** :

- Titre : "Une plateforme, 3 applications"
- Sous-titre : "Web • Mobile • Desktop"
- Visuel : Trois écrans côte à côte montrant chaque plateforme

### 3. Page fonctionnalités : `og-image-features.png`

**Objectif** : Présenter les 5 modules principaux
**Contenu suggéré** :

- Titre : "5 modules surpuissants"
- Sous-titre : "Chat • Voice • Vidéo • Espaces • Évenements"
- Visuel : Grille d'icônes ou interfaces des modules

### 4. Page IA : `og-image-ai.png`

**Objectif** : Mettre en avant l'IA
**Contenu suggéré** :

- Titre : "IA intégrée nativement"
- Sous-titre : "Génération d'images • Résumés intelligents • Traduction"
- Visuel : Interface bot IA + exemples de génération d'images

### 5. Page développeurs : `og-image-developers.png`

**Objectif** : Attirer les développeurs
**Contenu suggéré** :

- Titre : "Plateforme extensible"
- Sous-titre : "Bots • Modules • API • SDK"
- Visuel : Code snippet + diagramme d'architecture

### 6. Page à propos : `og-image-about.png`

**Objectif** : Présenter la vision et l'équipe
**Contenu suggéré** :

- Titre : "Révolutionner la communication en ligne"
- Sous-titre : "Innovation européenne • Open Source • Soutenu par PEPITE"
- Visuel : Carte Europe + logo PEPITE

### 7. Page contact : `og-image-contact.png`

**Objectif** : Inciter à la prise de contact
**Contenu suggéré** :

- Titre : "Contactez-nous"
- Sous-titre : "Investisseurs • Partenaires • Universités • Beta testeurs"
- Visuel : Formulaire ou icons de contact

### 8. Page partenaires : `og-image-partners.png`

**Objectif** : Attirer des partenaires
**Contenu suggéré** :

- Titre : "Rejoignez notre écosystème"
- Sous-titre : "Universités • Institutions • Associations"
- Visuel : Réseau de connexions + badge PEPITE

### 9. Page actualités : `og-image-news.png`

**Objectif** : Montrer que le projet est actif
**Contenu suggéré** :

- Titre : "Actualités ImuChat"
- Sous-titre : "Suivez notre évolution et nos jalons"
- Visuel : Timeline avec jalons clés

### 10. Image par défaut : `og-image-default.png`

**Objectif** : Fallback pour toutes les pages
**Contenu suggéré** :

- Identique à `og-image-home.png` ou version simplifiée
- Logo + tagline + gradient de marque

## 🔧 Implémentation technique

### Structure des fichiers

```
/public
  ├── og-image-home.png
  ├── og-image-product.png
  ├── og-image-features.png
  ├── og-image-ai.png
  ├── og-image-developers.png
  ├── og-image-about.png
  ├── og-image-contact.png
  ├── og-image-partners.png
  ├── og-image-news.png
  ├── og-image-default.png
  ├── icon-192x192.png
  └── icon-512x512.png
```

### Code d'intégration (déjà en place dans metadata.ts)

Le système de métadonnées est déjà configuré pour utiliser ces images :

```typescript
// Dans src/utils/metadata.ts
openGraph: {
  images: [
    {
      url: `/og-image-${page}.png`,
      width: 1200,
      height: 630,
      alt: title,
    },
  ],
  // ...
}
```

Les images seront automatiquement utilisées dès qu'elles seront placées dans `/public`.

### PWA Icons (déjà configuré dans manifest.ts)

```typescript
// Dans src/app/manifest.ts
icons: [
  {
    src: '/icon-192x192.png',
    sizes: '192x192',
    type: 'image/png',
  },
  {
    src: '/icon-512x512.png',
    sizes: '512x512',
    type: 'image/png',
  },
],
```

## ✅ Checklist de validation

Avant de finaliser chaque image, vérifier :

- [ ] Dimensions exactes respectées (1200×630 ou 192×192/512×512)
- [ ] Couleurs ImuChat utilisées
- [ ] Texte lisible sur mobile (tester à petite taille)
- [ ] Zone de sécurité respectée (pas de texte coupé)
- [ ] Fichier optimisé (< 300 KB pour OG)
- [ ] Nom de fichier correct
- [ ] Test sur Facebook Debugger : <https://developers.facebook.com/tools/debug/>
- [ ] Test sur Twitter Card Validator : <https://cards-dev.twitter.com/validator>
- [ ] Test sur LinkedIn Post Inspector : <https://www.linkedin.com/post-inspector/>

## 🚀 Priorisation

### Phase 1 (Critique) - À créer en premier

1. `og-image-default.png` - Fallback universel
2. `og-image-home.png` - Page principale
3. `icon-192x192.png` - PWA requis
4. `icon-512x512.png` - PWA requis

### Phase 2 (Important) - Pages stratégiques

5. `og-image-partners.png` - Pour partages PEPITE/universités
2. `og-image-news.png` - Pour annonces
3. `og-image-product.png` - Pour démos produit

### Phase 3 (Standard) - Compléter le reste

8-10. Toutes les autres pages

## 📌 Notes de production

### Outils recommandés pour la création

**Option 1 : Design manuel**

- Figma (recommandé)
- Canva Pro
- Adobe Photoshop

**Option 2 : Génération IA**

- Midjourney : "create an open graph image for [description], 1200x630px, modern tech style, purple and pink gradient"
- DALL-E 3 : Similar prompt
- Stable Diffusion : Avec contrôle précis des dimensions

**Option 3 : Templates**

- OG Image Generator : <https://og-image.vercel.app/>
- Social Sizes : <https://socialsizes.io/>
- Pablo by Buffer : <https://pablo.buffer.com/>

### Workflow de production suggéré

1. **Créer un template Figma** avec :
   - Artboard 1200×630px
   - Zones de sécurité
   - Palette de couleurs ImuChat
   - Styles de texte (titres, sous-titres)
   - Logo et éléments de marque

2. **Dupliquer pour chaque page** :
   - Adapter le texte
   - Changer le visuel principal
   - Vérifier la lisibilité

3. **Exporter** :
   - PNG @2x pour la qualité
   - Optimiser avec TinyPNG ou ImageOptim

4. **Placer dans `/public`** :
   - Respecter les noms de fichiers exacts
   - Commit dans Git

5. **Valider** :
   - Tester sur Facebook Debugger
   - Tester sur LinkedIn Post Inspector
   - Vérifier sur mobile

## 🎯 Objectifs mesurables

Ces images OG doivent :

- **Augmenter le CTR** des partages de +30%
- **Améliorer la perception** professionnelle du projet
- **Faciliter l'identification** de la marque ImuChat
- **Attirer les partenaires** (universités, PEPITE, investisseurs)

---

**Dernière mise à jour** : 20 décembre 2024
**Prochaine révision** : Après Phase 1 (création des 4 images critiques)
