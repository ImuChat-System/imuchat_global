# ✅ TODO - Site Vitrine ImuChat

> Checklist actions prioritaires - Phase 1 (4-6 semaines)

**Légende** :

- ⏳ En cours
- ✅ Terminé
- ❌ À faire
- 🔥 Critique
- 🟡 Important
- 💡 Bonus

---

## 🔥 CRITIQUE - Semaine 1-2

### Analytics & Tracking

- [ ] ❌ Choisir solution analytics (Plausible/Umami/GA4)
- [ ] ❌ Créer compte & obtenir tracking ID
- [ ] ❌ Implémenter script tracking
- [ ] ❌ Configurer events :
  - [ ] Page views
  - [ ] CTA clicks
  - [ ] Form submissions
  - [ ] Scroll depth
- [ ] ❌ Cookie consent banner
  - [ ] Design modal/banner
  - [ ] Choices granulaires (necessary/analytics/marketing)
  - [ ] Persistance localStorage
  - [ ] Test conformité RGPD
- [ ] ❌ Dashboard analytics configuré
- [ ] ❌ Test tracking complet

**Estimation** : 12-15h  
**Assigné** : _________

---

### Contact Form Backend

- [ ] ❌ Choisir solution (Firebase Functions / Next.js API Route)
- [ ] ❌ Setup backend :
  - [ ] Route `/api/contact`
  - [ ] Validation Zod schema
  - [ ] Error handling
- [ ] ❌ Email service :
  - [ ] Compte SendGrid/Resend
  - [ ] Template email confirmation
  - [ ] Template notification interne
- [ ] ❌ Protection spam :
  - [ ] reCAPTCHA v3 setup
  - [ ] Rate limiting
- [ ] ❌ Webhook notifications (Slack/Discord)
- [ ] ❌ Tests :
  - [ ] Test soumission réussie
  - [ ] Test validation erreurs
  - [ ] Test email reception

**Fichier** : `src/app/[locale]/contact/page.tsx`  
**Estimation** : 6-8h  
**Assigné** : _________

---

### Waitlist System

- [ ] ❌ Décider UI (Page dédiée `/waitlist` ou Modal)
- [ ] ❌ Créer composant formulaire :
  - [ ] Champs : email, prénom, intérêt
  - [ ] Validation client + serveur
  - [ ] États : loading, success, error
- [ ] ❌ Backend storage :
  - [ ] Firebase Firestore collection
  - [ ] OU Airtable base
  - [ ] Schema données
- [ ] ❌ Email confirmation :
  - [ ] Template welcome
  - [ ] Position dans file (optionnel)
- [ ] ❌ Admin :
  - [ ] Export CSV fonction
  - [ ] Dashboard stats basique
- [ ] 💡 Bonus : Système parrainage
  - [ ] Lien unique par user
  - [ ] +places pour parrainages

**Nouveau fichier** : `src/app/[locale]/waitlist/page.tsx`  
**Estimation** : 10-12h  
**Assigné** : _________

---

### SEO - Meta Verification

- [ ] ❌ Google Search Console :
  - [ ] Ajouter propriété imuchat.app
  - [ ] Copier meta code verification
  - [ ] Ajouter dans `layout.tsx`
  - [ ] Vérifier ownership
- [ ] ❌ Bing Webmaster Tools :
  - [ ] Même process
- [ ] ❌ Soumettre sitemap :
  - [ ] Vérifier `/sitemap.xml` complet
  - [ ] Soumettre GSC
  - [ ] Soumettre Bing
- [ ] ❌ Vérifier hreflang alternates
- [ ] ❌ Vérifier canonical URLs

**Fichier** : `src/app/[locale]/layout.tsx:59`  
**Estimation** : 2-3h  
**Assigné** : _________

---

## 🔥 CRITIQUE - Semaine 3-4

### Contenu Légal

- [ ] ❌ **Privacy Policy** :
  - [ ] Adresse légale entité
  - [ ] Liste données collectées exhaustive
  - [ ] Durée conservation
  - [ ] Tiers (Firebase, Analytics)
  - [ ] Procédures RGPD détaillées
  - [ ] Contact DPO
- [ ] ❌ **Terms of Service** :
  - [ ] Clauses responsabilité
  - [ ] Conditions mini-apps
  - [ ] Résolution litiges
  - [ ] Suspension/résiliation compte
- [ ] ❌ **Legal Mentions** (créer) :
  - [ ] Nom entité juridique
  - [ ] SIREN/SIRET
  - [ ] Adresse siège
  - [ ] Directeur publication
  - [ ] Hébergeur (Firebase)
- [ ] 🔥 **Review juriste/avocat** (OBLIGATOIRE)
- [ ] ❌ Traductions légal (EN minimum)

**Fichiers** :

- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/legal/page.tsx`

**Estimation** : 10-15h (avec consultant)  
**Assigné** : _________  
**Juriste** : _________

---

### Traductions DE/ES

- [ ] ❌ **Allemand (DE)** :
  - [ ] Homepage
  - [ ] Product
  - [ ] Features
  - [ ] AI
  - [ ] Developers
  - [ ] About
  - [ ] Contact
  - [ ] Privacy/Terms/Legal
  - [ ] Navbar/Footer
- [ ] ❌ **Espagnol (ES)** :
  - [ ] Mêmes pages
- [ ] ❌ Review par native speakers
- [ ] ❌ Test UI textes longs
- [ ] ❌ Vérifier breakpoints mobile

**Fichiers** :

- `messages/de.json`
- `messages/es.json`

**Estimation** : 15-20h (traducteur pro)  
**Assigné** : _________

---

### Images Open Graph

- [ ] ❌ Audit 10 images existantes :
  - [ ] `og-image-home.png`
  - [ ] `og-image-product.png`
  - [ ] `og-image-features.png`
  - [ ] `og-image-ai.png`
  - [ ] `og-image-developers.png`
  - [ ] `og-image-about.png`
  - [ ] `og-image-contact.png`
  - [ ] `og-image-partners.png`
  - [ ] `og-image-news.png`
  - [ ] `og-image-default.png`
- [ ] ❌ Vérifier checklist :
  - [ ] Dimensions 1200×630px exactes
  - [ ] Taille < 300KB
  - [ ] Texte lisible
  - [ ] Logo ImuChat présent
  - [ ] Branding cohérent
  - [ ] Couleurs charte graphique
- [ ] ❌ Regénération si besoin (Figma/Canva)
- [ ] ❌ Test preview :
  - [ ] Twitter Card Validator
  - [ ] LinkedIn Post Inspector
  - [ ] Discord embed

**Dossier** : `public/`  
**Estimation** : 4-6h  
**Assigné** : _________

---

## 🔥 CRITIQUE - Semaine 5-6

### Mockups & Visuels Produit

- [ ] ❌ Design Figma :
  - [ ] 3 mockups mobile (iOS/Android)
  - [ ] 2 mockups desktop
  - [ ] Screens features clés
- [ ] ❌ Export haute qualité :
  - [ ] PNG @2x (retina)
  - [ ] WebP optimization
- [ ] ❌ 1-2 GIFs/animations :
  - [ ] Demo feature clé
  - [ ] Outil : Rotato / After Effects
- [ ] ❌ Intégration pages :
  - [ ] Homepage hero
  - [ ] Product page
  - [ ] Features page
- [ ] ❌ Alt texts accessibilité

**Dossier** : `public/mockups/`  
**Estimation** : 10-12h  
**Assigné** : _________

---

### Video Demo Hero

- [ ] ❌ Script 30s :
  - [ ] Hook (3s)
  - [ ] Problem (7s)
  - [ ] Solution (15s)
  - [ ] CTA (5s)
- [ ] ❌ Choisir format production :
  - [ ] Option A : Screencast app + VO
  - [ ] Option B : Motion design
  - [ ] Option C : Figma prototype animé
- [ ] ❌ Production :
  - [ ] Recording/Création
  - [ ] Editing/Post-prod
  - [ ] Musique/SFX (si besoin)
  - [ ] Sous-titres (accessibility)
- [ ] ❌ Export optimisé :
  - [ ] MP4 (H.264)
  - [ ] WebM (fallback)
  - [ ] Taille < 5MB
- [ ] ❌ Poster image fallback
- [ ] ❌ Intégration hero homepage
- [ ] ❌ Autoplay muted + controls

**Dossier** : `public/videos/`  
**Estimation** : 15-20h  
**Assigné** : _________

---

### Trust Bar Partenaires

- [ ] ❌ Collecter logos :
  - [ ] Badge PEPITE officiel
  - [ ] Université(s)
  - [ ] Incubateur(s)
  - [ ] Sponsor(s)
  - [ ] Partenaires tech (si existants)
- [ ] ❌ Préparer assets :
  - [ ] SVG ou PNG haute qualité
  - [ ] Version grayscale
  - [ ] Version couleur
- [ ] ❌ Développer composant :
  - [ ] Barre défilante auto
  - [ ] Grayscale → color on hover
  - [ ] Responsive mobile
  - [ ] Pausable on hover
- [ ] ❌ Intégration homepage (après hero)
- [ ] ❌ Liens vers sites partenaires

**Nouveau composant** : `src/components/ui/TrustBar.tsx`  
**Estimation** : 2-3h  
**Assigné** : _________

---

## 🟡 IMPORTANT - Bonus Phase 1

### Section Équipe (About)

- [ ] ❌ Photos professionnelles :
  - [ ] _________ (Fondateur)
  - [ ] _________ (Co-fondateur)
  - [ ] _________ (Dev Lead)
  - [ ] _________ (Designer)
  - [ ] Advisors/Mentors (si existants)
- [ ] ❌ Rédiger bios courtes (50-100 mots)
- [ ] ❌ Liens LinkedIn/GitHub
- [ ] ❌ Design component TeamMember
- [ ] ❌ Intégration About page
- [ ] ❌ Traductions EN (minimum)

**Fichier** : `src/app/[locale]/about/page.tsx`  
**Estimation** : 4-6h  
**Assigné** : _________

---

### Page FAQ

- [ ] ❌ Brainstorm 15-20 questions :
  - [ ] Produit (5)
  - [ ] Privacy (4)
  - [ ] Technique (3)
  - [ ] Business (3)
- [ ] ❌ Rédiger réponses claires
- [ ] ❌ Catégorisation
- [ ] ❌ Développer page :
  - [ ] Accordion component
  - [ ] Search/filter optionnel
  - [ ] Schema.org FAQPage
- [ ] ❌ Traductions EN
- [ ] ❌ Link depuis Footer

**Nouveau fichier** : `src/app/[locale]/faq/page.tsx`  
**Estimation** : 4-6h  
**Assigné** : _________

---

### Enrichir Page News

- [ ] ❌ Timeline jalons réels :
  - [ ] Conception projet (date)
  - [ ] Sélection PEPITE (date)
  - [ ] Début développement MVP (date)
  - [ ] Premier prototype (date)
  - [ ] Beta prévue (date)
- [ ] ❌ Mini-article par milestone (150-200 mots)
- [ ] ❌ Section "Press Kit" :
  - [ ] Fact sheet PDF
  - [ ] Logos pack ZIP
  - [ ] Screenshots pack
  - [ ] Kit partenaire
- [ ] ❌ Section "In the News" (si articles)
- [ ] ❌ RSS feed optionnel

**Fichier** : `src/app/[locale]/news/page.tsx`  
**Estimation** : 6-8h  
**Assigné** : _________

---

### Page Partners - Cas d'usage

- [ ] ❌ Rédiger 2-3 cas d'usage détaillés :
  - [ ] Cas 1 : Université (exemple fictif)
  - [ ] Cas 2 : Association (exemple)
  - [ ] Cas 3 : Institution publique
- [ ] ❌ Timeline onboarding partenaire
- [ ] ❌ Kit partenaire PDF :
  - [ ] Présentation projet
  - [ ] Bénéfices partenariat
  - [ ] Modalités collaboration
- [ ] ❌ Formulaire "Devenir partenaire" :
  - [ ] Différent du contact général
  - [ ] Champs spécifiques (organisation, type, projet)
- [ ] ❌ Témoignages (si existants)

**Fichier** : `src/app/[locale]/partners/page.tsx`  
**Estimation** : 6-8h  
**Assigné** : _________

---

## ⚡ Quick Wins (< 4h chacun)

### SEO Basic

- [ ] ❌ Meta descriptions manquantes
- [ ] ❌ H1 unique par page
- [ ] ❌ Alt texts images
- [ ] ❌ Title tags optimisés

**Estimation** : 2h

---

### Newsletter Footer

- [ ] ❌ Input email footer
- [ ] ❌ Compte Mailchimp/ConvertKit
- [ ] ❌ API integration
- [ ] ❌ Email confirmation

**Estimation** : 3h

---

### 404 Page Custom

- [ ] ❌ Design page erreur
- [ ] ❌ Suggestions pages populaires
- [ ] ❌ Search bar optionnel
- [ ] ❌ Illustration fun

**Fichier** : `src/app/[locale]/not-found.tsx`  
**Estimation** : 2h

---

### Loading States

- [ ] ❌ Skeleton screens
- [ ] ❌ Spinners cohérents
- [ ] ❌ Error boundaries
- [ ] ❌ Transitions smooth

**Estimation** : 3h

---

### Comparison Table

- [ ] ❌ ImuChat vs WhatsApp/Telegram/Discord/WeChat
- [ ] ❌ Critères : Privacy, Super-app, API, Prix, Ads
- [ ] ❌ Design responsive table
- [ ] ❌ Intégration `/features` ou `/comparison`

**Estimation** : 4h

---

## 📋 Checklist Pré-Lancement

### Technique

- [ ] ❌ Lighthouse 90+ (5 pages clés)
- [ ] ❌ Test 5 devices (iOS/Android/Desktop)
- [ ] ❌ Test 3 navigateurs (Chrome/Safari/Firefox)
- [ ] ❌ Liens cassés check
- [ ] ❌ Formulaires fonctionnels
- [ ] ❌ Mobile menu navigation
- [ ] ❌ Images optimisées
- [ ] ❌ Fonts loading optimisé

### Contenu

- [ ] ❌ Typos/grammaire review
- [ ] ❌ CTAs cohérents
- [ ] ❌ Alt texts complets
- [ ] ❌ Meta descriptions
- [ ] ❌ Traductions FR/EN
- [ ] ❌ Légal validé juriste

### UX/Design

- [ ] ❌ Contrastes WCAG AA
- [ ] ❌ Navigation clavier
- [ ] ❌ Focus states
- [ ] ❌ Loading states
- [ ] ❌ Messages erreurs
- [ ] ❌ Responsive OK

### Business

- [ ] ❌ Analytics opérationnel
- [ ] ❌ Cookie consent
- [ ] ❌ Contact → emails reçus
- [ ] ❌ Waitlist → stockage
- [ ] ❌ Emails confirmation
- [ ] ❌ 404 page custom

### SEO

- [ ] ❌ Sitemap soumis
- [ ] ❌ Robots.txt configuré
- [ ] ❌ Meta tags toutes pages
- [ ] ❌ OG images toutes pages
- [ ] ❌ JSON-LD structured data
- [ ] ❌ Hreflang alternates

### Sécurité

- [ ] ❌ HTTPS activé
- [ ] ❌ Security headers
- [ ] ❌ Validation serveur
- [ ] ❌ Anti-spam
- [ ] ❌ Backup stratégie
- [ ] ❌ Monitoring errors

---

## 📊 Progress Tracking

**Phase 1 - Semaine 1-2** : _____ / 4 tâches critiques  
**Phase 1 - Semaine 3-4** : _____ / 4 tâches critiques  
**Phase 1 - Semaine 5-6** : _____ / 4 tâches critiques  
**Bonus Important** : _____ / 4 tâches  
**Quick Wins** : _____ / 5 tâches  

**Total Avancement** : _____ / 21 tâches majeures

---

## 🎯 Indicateurs Succès

- [ ] Formulaire contact fonctionne (test réel)
- [ ] Waitlist collecte emails (100+ signups objectif)
- [ ] Analytics tracking actif
- [ ] Contenu légal validé par professionnel
- [ ] Site testable sur 5+ devices sans bugs
- [ ] Lighthouse score 90+ stable
- [ ] 5 personnes externes ont donné feedback positif

---

## 📅 Prochaines Sessions

### Session actuelle : _________

**Focus** : _________________  
**Objectif** : _________________  
**Heures prévues** : _____h

### Prochaine session : _________

**Focus** : _________________

### Blockers actuels

1. _________________
2. _________________

---

**Dernière mise à jour** : _________  
**Par** : _________  
**Next review** : _________

---

*🚀 One task at a time. One sprint at a time. We got this!*
