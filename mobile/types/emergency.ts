/**
 * Types pour le module Numéros d'urgence géolocalisés
 *
 * Base locale de numéros d'urgence par pays/région :
 *  - Numéros par catégorie (police, pompiers, médical, etc.)
 *  - Détection automatique du pays par géolocalisation
 *  - Mode hors-ligne complet
 *  - Appel direct en un tap
 *
 * Phase 3 — Groupe 7 Services utilitaires (Feature 7.3)
 */

// ============================================================================
// ENUMS
// ============================================================================

/** Catégorie de service d'urgence */
export enum EmergencyCategory {
    POLICE = 'police',
    FIRE = 'fire',
    MEDICAL = 'medical',
    GENERAL = 'general',
    CHILD = 'child',
    DOMESTIC_VIOLENCE = 'domestic_violence',
    POISON = 'poison',
    MENTAL_HEALTH = 'mental_health',
    ROADSIDE = 'roadside',
    COAST_GUARD = 'coast_guard',
    MOUNTAIN_RESCUE = 'mountain_rescue',
    DISASTER = 'disaster',
}

/** Continent pour filtrage */
export enum Continent {
    EUROPE = 'europe',
    NORTH_AMERICA = 'north_america',
    SOUTH_AMERICA = 'south_america',
    ASIA = 'asia',
    AFRICA = 'africa',
    OCEANIA = 'oceania',
}

// ============================================================================
// INTERFACES — NUMÉROS D'URGENCE
// ============================================================================

/** Un numéro d'urgence individuel */
export interface EmergencyNumber {
    /** Catégorie du service */
    category: EmergencyCategory;
    /** Numéro de téléphone */
    number: string;
    /** Nom du service (ex: "SAMU", "Police secours") */
    label: string;
    /** Description optionnelle */
    description?: string;
    /** Disponible 24/7 */
    is24h: boolean;
    /** Numéro gratuit */
    isFree: boolean;
    /** Notes additionnelles (ex: "SMS disponible pour sourds/malentendants") */
    notes?: string;
}

/** Données d'urgence pour un pays */
export interface CountryEmergencyData {
    /** Code pays ISO 3166-1 alpha-2 (ex: "FR", "US", "JP") */
    countryCode: string;
    /** Nom du pays en anglais */
    countryName: string;
    /** Emoji drapeau */
    flag: string;
    /** Continent */
    continent: Continent;
    /** Numéro d'urgence général (ex: 112, 911) */
    generalNumber: string;
    /** Liste des numéros d'urgence */
    numbers: EmergencyNumber[];
}

/** Résultat de la géolocalisation */
export interface GeoLocationResult {
    /** Code pays détecté */
    countryCode: string | null;
    /** Latitude */
    latitude: number | null;
    /** Longitude */
    longitude: number | null;
    /** Précision en mètres */
    accuracy: number | null;
    /** Timestamp de la détection */
    timestamp: string;
    /** Source de détection */
    source: 'gps' | 'network' | 'manual' | 'default';
}

/** Pays récent / favori */
export interface FavoriteCountry {
    /** Code pays */
    countryCode: string;
    /** Timestamp du dernier accès */
    lastAccessed: string;
    /** Marqué comme favori manuellement */
    isFavorite: boolean;
}

// ============================================================================
// STORE STATE
// ============================================================================

/** État du store Numéros d'urgence */
export interface EmergencyStoreState {
    // ---- Données ----
    /** Code pays actuellement sélectionné */
    currentCountryCode: string | null;
    /** Résultat de géolocalisation */
    geoLocation: GeoLocationResult | null;
    /** Pays récents / favoris */
    favorites: FavoriteCountry[];
    /** Catégorie filtrée (null = toutes) */
    selectedCategory: EmergencyCategory | null;
    /** Recherche active */
    searchQuery: string;

    // ---- UI State ----
    /** Chargement géolocalisation en cours */
    isLocating: boolean;
    /** Erreur éventuelle */
    error: string | null;

    // ---- Actions ----
    /** Détecter le pays via géolocalisation */
    detectCountry: () => Promise<void>;
    /** Sélectionner manuellement un pays */
    selectCountry: (countryCode: string) => void;
    /** Filtrer par catégorie */
    setCategory: (category: EmergencyCategory | null) => void;
    /** Rechercher un pays */
    setSearchQuery: (query: string) => void;
    /** Ajouter / retirer un pays favori */
    toggleFavorite: (countryCode: string) => void;
    /** Enregistrer un accès récent */
    recordAccess: (countryCode: string) => void;
    /** Réinitialiser */
    reset: () => void;
}
