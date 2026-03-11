# 📦 Nouveaux Modules ImuChat — Index d'Implémentation

> **Généré le** : 11 mars 2026  
> **Scope** : 7 nouveaux modules proposés pour ImuChat  
> **Format** : Complet (Architecture + BDD + Écrans + API)

---

## Vue d'ensemble

| # | Module | Fichier | Priorité | Durée est. | Dépendances clés |
|---|--------|---------|----------|-----------|-----------------|
| 1 | **ImuSplit** — Partage de dépenses | `IMPL_IMUSPLIT.md` | 🔴 P0 | ~4 semaines | `wallet`, `chat`, `contacts` |
| 2 | **ImuGame** — Mini-jeux multijoueurs | `IMPL_IMUGAME.md` | 🔴 P0 | ~6 semaines | `chat`, `socket.io`, `wallet` |
| 3 | **ImuTranslate** — Traduction instantanée | `IMPL_IMUTRANSLATE.md` | 🔴 P0 | ~3 semaines | `chat`, DeepL API |
| 4 | **Smart Recap** — Résumés IA de conversations | `IMPL_SMART_RECAP.md` | 🟠 P1 | ~3 semaines | `chat`, Claude API, `notifications` |
| 5 | **ImuCoach** — Assistants IA spécialisés | `IMPL_IMUCOACH.md` | 🟠 P1 | ~4.5 semaines | Claude API, `wallet`, `gamification` |
| 6 | **Budget Perso** — Gestion finances personnelles | `IMPL_BUDGET_PERSO.md` | 🟠 P1 | ~4.5 semaines | `wallet`, `notifications` |
| 7 | **ImuHealth** — Carnet de santé numérique | `IMPL_IMUHEALTH.md` | 🟡 P2 | ~5 semaines | `notifications`, `events` |

**Durée totale estimée (développement séquentiel) : ~30 semaines**  
**Durée en parallèle (2-3 squads) : ~12-15 semaines**

---

## Ordre de développement recommandé

### Phase 1 — Quick Wins (6-8 semaines, 2 squads)

```
Squad A : ImuTranslate (3 sem) → Smart Recap (3 sem)
Squad B : ImuSplit (4 sem) → Budget Perso (démarrage)
```

**Justification :** ImuTranslate et Smart Recap sont les moins risqués techniquement,
avec un fort impact perçu dès le lancement. ImuSplit crée une vraie raison d'inviter
des amis sur ImuChat (viralité).

### Phase 2 — Engagement (8-10 semaines, 2 squads)

```
Squad A : ImuGame (6 sem)
Squad B : Budget Perso (suite, 4.5 sem) → ImuCoach (démarrage)
```

### Phase 3 — Enrichissement (6-8 semaines)

```
Squad A : ImuCoach (suite, 4.5 sem)
Squad B : ImuHealth (5 sem, avec revue RGPD)
```

---

## Résumé des tables Supabase créées

| Module | Tables créées |
|--------|--------------|
| ImuSplit | `split_groups`, `split_group_members`, `split_expenses`, `split_expense_shares`, `split_settlements` |
| ImuGame | `game_catalog`, `game_sessions`, `game_participants`, `game_actions`, `quiz_questions`, `game_leaderboard` |
| ImuTranslate | `translation_preferences`, `chat_translation_settings`, `translation_cache`, `translation_usage` |
| Smart Recap | `chat_recaps`, `recap_preferences`, `chat_recap_settings`, `recap_feedback` |
| ImuCoach | `coach_catalog`, `coach_sessions`, `coach_messages`, `coach_goals`, `coach_insights`, `coach_daily_usage` |
| Budget Perso | `budget_categories`, `budget_accounts`, `budget_transactions`, `budget_limits`, `budget_savings_goals` |
| ImuHealth | `health_profiles`, `health_symptoms`, `health_treatments`, `health_reminders`, `health_appointments`, `health_vaccinations`, `health_shares`, `health_audit_log` |

**Total : 35 nouvelles tables Supabase**

---

## APIs externes utilisées

| Service | Modules | Type | Coût estimé |
|---------|---------|------|------------|
| **DeepL API** | ImuTranslate | Traduction | ~€5/1M chars (free tier : 500K/mois) |
| **Google Translate** | ImuTranslate (fallback) | Traduction | €20/1M chars |
| **Claude API (Anthropic)** | Smart Recap, ImuCoach | IA | ~$3/1M tokens (Sonnet) |
| **Socket.IO** | ImuGame | Temps réel | Déjà intégré dans ImuChat |

---

## Points d'attention transversaux

### 🔐 Sécurité
- **ImuHealth** : chiffrement AES-256 applicatif obligatoire + audit log RGPD
- **ImuSplit** : règlement via `transfer_imucoins()` atomique pour éviter les races conditions
- **ImuCoach** : quota journalier côté serveur pour éviter l'abus de l'API Claude

### ⚡ Performance
- **ImuGame** : Socket.IO rooms isolées par session, garbage collect après fin de partie
- **Smart Recap** : génération asynchrone (ne pas bloquer l'UI) + mise en cache Supabase
- **ImuTranslate** : double cache (IndexedDB client + `translation_cache` Supabase)

### 🌍 Internationalisation
- Tous les modules supportent `fr`, `en`, `ja` dès le lancement (clés i18n à ajouter)
- ImuTranslate : les messages de l'interface UI sont eux-mêmes traduits

### 📱 Mobile-first
- Tous les composants sont conçus responsive (Tailwind)
- ImuGame : Canvas API avec support touch pour SketchIt
- ImuHealth : BodyMapPicker adapté au tactile

---

*Index généré le 11 mars 2026 — ImuChat New Modules Docs*
