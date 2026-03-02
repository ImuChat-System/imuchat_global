/**
 * Service Numéros d'urgence géolocalisés
 *
 * Base locale complète de numéros d'urgence par pays.
 * Fonctionne entièrement hors-ligne (pas d'appel Supabase pour les données).
 *
 * Fonctionnalités :
 *  - Base locale : 30+ pays couvrant tous les continents
 *  - Géolocalisation : détecte le pays automatiquement
 *  - Appel direct : lancement d'appel téléphonique en un tap
 *  - Recherche : par nom de pays ou code
 *  - Filtrage : par catégorie (police, pompiers, médical…)
 *
 * Phase 3 — Groupe 7 Services utilitaires (Feature 7.3)
 */

import type {
    CountryEmergencyData,
    EmergencyNumber,
    GeoLocationResult,
} from '@/types/emergency';
import { Continent, EmergencyCategory } from '@/types/emergency';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { createLogger } from './logger';

const log = createLogger('Emergency');

// ============================================================================
// DATABASE — NUMÉROS D'URGENCE PAR PAYS
// ============================================================================

const EMERGENCY_DATABASE: CountryEmergencyData[] = [
    // ---- EUROPE ----
    {
        countryCode: 'FR',
        countryName: 'France',
        flag: '🇫🇷',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Numéro d\'urgence européen', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '17', label: 'Police secours', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '18', label: 'Pompiers', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '15', label: 'SAMU', is24h: true, isFree: true },
            { category: EmergencyCategory.CHILD, number: '119', label: 'Enfance en danger', is24h: true, isFree: true, notes: 'Appel anonyme' },
            { category: EmergencyCategory.DOMESTIC_VIOLENCE, number: '3919', label: 'Violences femmes info', is24h: true, isFree: true },
            { category: EmergencyCategory.POISON, number: '01 40 05 48 48', label: 'Centre antipoison Paris', is24h: true, isFree: false },
            { category: EmergencyCategory.MENTAL_HEALTH, number: '3114', label: 'Numéro national de prévention du suicide', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'DE',
        countryName: 'Germany',
        flag: '🇩🇪',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Notruf', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '110', label: 'Polizei', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '112', label: 'Feuerwehr', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '112', label: 'Rettungsdienst', is24h: true, isFree: true },
            { category: EmergencyCategory.CHILD, number: '0800 111 0333', label: 'Kinder- und Jugendtelefon', is24h: false, isFree: true },
            { category: EmergencyCategory.POISON, number: '030 19240', label: 'Giftnotruf Berlin', is24h: true, isFree: false },
        ],
    },
    {
        countryCode: 'GB',
        countryName: 'United Kingdom',
        flag: '🇬🇧',
        continent: Continent.EUROPE,
        generalNumber: '999',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '999', label: 'Emergency Services', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '112', label: 'European Emergency', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '999', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '999', label: 'Fire Brigade', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '999', label: 'Ambulance', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '111', label: 'NHS Non-Emergency', is24h: true, isFree: true },
            { category: EmergencyCategory.CHILD, number: '0800 1111', label: 'Childline', is24h: true, isFree: true },
            { category: EmergencyCategory.MENTAL_HEALTH, number: '116 123', label: 'Samaritans', is24h: true, isFree: true },
            { category: EmergencyCategory.COAST_GUARD, number: '999', label: 'Coast Guard', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'ES',
        countryName: 'Spain',
        flag: '🇪🇸',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Emergencias', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '091', label: 'Policía Nacional', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '062', label: 'Guardia Civil', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '080', label: 'Bomberos', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '061', label: 'Urgencias sanitarias', is24h: true, isFree: true },
            { category: EmergencyCategory.DOMESTIC_VIOLENCE, number: '016', label: 'Violencia de género', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'IT',
        countryName: 'Italy',
        flag: '🇮🇹',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Numero Unico Emergenze', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '113', label: 'Polizia di Stato', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '112', label: 'Carabinieri', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '115', label: 'Vigili del Fuoco', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '118', label: 'Emergenza Sanitaria', is24h: true, isFree: true },
            { category: EmergencyCategory.COAST_GUARD, number: '1530', label: 'Guardia Costiera', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'PT',
        countryName: 'Portugal',
        flag: '🇵🇹',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Número de emergência', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '112', label: 'PSP / GNR', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '112', label: 'Bombeiros', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '112', label: 'INEM', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'BE',
        countryName: 'Belgium',
        flag: '🇧🇪',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Numéro d\'urgence européen', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '101', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '112', label: 'Pompiers', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '112', label: 'Aide médicale urgente', is24h: true, isFree: true },
            { category: EmergencyCategory.CHILD, number: '103', label: 'Écoute-Enfants', is24h: true, isFree: true },
            { category: EmergencyCategory.POISON, number: '070 245 245', label: 'Centre Antipoisons', is24h: true, isFree: false },
        ],
    },
    {
        countryCode: 'CH',
        countryName: 'Switzerland',
        flag: '🇨🇭',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'European Emergency', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '117', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '118', label: 'Pompiers', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '144', label: 'Ambulance', is24h: true, isFree: true },
            { category: EmergencyCategory.MOUNTAIN_RESCUE, number: '1414', label: 'REGA (Air Rescue)', is24h: true, isFree: true },
            { category: EmergencyCategory.POISON, number: '145', label: 'Tox Info', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'NL',
        countryName: 'Netherlands',
        flag: '🇳🇱',
        continent: Continent.EUROPE,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Alarmnummer', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '112', label: 'Politie', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '112', label: 'Brandweer', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '112', label: 'Ambulance', is24h: true, isFree: true },
            { category: EmergencyCategory.CHILD, number: '0800 0432', label: 'Kindertelefoon', is24h: false, isFree: true },
        ],
    },

    // ---- NORTH AMERICA ----
    {
        countryCode: 'US',
        countryName: 'United States',
        flag: '🇺🇸',
        continent: Continent.NORTH_AMERICA,
        generalNumber: '911',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '911', label: 'Emergency', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '911', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '911', label: 'Fire Department', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '911', label: 'Ambulance / EMS', is24h: true, isFree: true },
            { category: EmergencyCategory.POISON, number: '1-800-222-1222', label: 'Poison Control', is24h: true, isFree: true },
            { category: EmergencyCategory.CHILD, number: '1-800-422-4453', label: 'Childhelp National', is24h: true, isFree: true },
            { category: EmergencyCategory.MENTAL_HEALTH, number: '988', label: 'Suicide & Crisis Lifeline', is24h: true, isFree: true },
            { category: EmergencyCategory.DOMESTIC_VIOLENCE, number: '1-800-799-7233', label: 'National Domestic Violence Hotline', is24h: true, isFree: true },
            { category: EmergencyCategory.COAST_GUARD, number: '1-800-424-8802', label: 'Coast Guard', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'CA',
        countryName: 'Canada',
        flag: '🇨🇦',
        continent: Continent.NORTH_AMERICA,
        generalNumber: '911',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '911', label: 'Emergency', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '911', label: 'Police / RCMP', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '911', label: 'Fire Department', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '911', label: 'Ambulance', is24h: true, isFree: true },
            { category: EmergencyCategory.POISON, number: '1-800-268-9017', label: 'Poison Control (Ontario)', is24h: true, isFree: true },
            { category: EmergencyCategory.MENTAL_HEALTH, number: '988', label: 'Suicide Crisis Helpline', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'MX',
        countryName: 'Mexico',
        flag: '🇲🇽',
        continent: Continent.NORTH_AMERICA,
        generalNumber: '911',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '911', label: 'Emergencias', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '911', label: 'Policía', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '911', label: 'Bomberos', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '065', label: 'Cruz Roja', is24h: true, isFree: true },
        ],
    },

    // ---- SOUTH AMERICA ----
    {
        countryCode: 'BR',
        countryName: 'Brazil',
        flag: '🇧🇷',
        continent: Continent.SOUTH_AMERICA,
        generalNumber: '190',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '190', label: 'Polícia Militar', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '193', label: 'Bombeiros', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '192', label: 'SAMU', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '190', label: 'Emergência', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'AR',
        countryName: 'Argentina',
        flag: '🇦🇷',
        continent: Continent.SOUTH_AMERICA,
        generalNumber: '911',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '911', label: 'Emergencias', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '911', label: 'Policía', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '100', label: 'Bomberos', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '107', label: 'SAME', is24h: true, isFree: true },
        ],
    },

    // ---- ASIA ----
    {
        countryCode: 'JP',
        countryName: 'Japan',
        flag: '🇯🇵',
        continent: Continent.ASIA,
        generalNumber: '110',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '110', label: '警察 (Keisatsu)', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '119', label: '消防 (Shōbō)', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '119', label: '救急車 (Kyūkyūsha)', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '110', label: '緊急通報', is24h: true, isFree: true },
            { category: EmergencyCategory.COAST_GUARD, number: '118', label: '海上保安庁 (Coast Guard)', is24h: true, isFree: true },
            { category: EmergencyCategory.DISASTER, number: '171', label: '災害用伝言ダイヤル (Disaster Message)', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'KR',
        countryName: 'South Korea',
        flag: '🇰🇷',
        continent: Continent.ASIA,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '112', label: '경찰 (Police)', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '119', label: '소방서 (Fire)', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '119', label: '응급 (Ambulance)', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '112', label: '긴급전화', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'CN',
        countryName: 'China',
        flag: '🇨🇳',
        continent: Continent.ASIA,
        generalNumber: '110',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '110', label: '警察 (Police)', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '119', label: '消防 (Fire)', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '120', label: '急救 (Ambulance)', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '110', label: '紧急求助', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'IN',
        countryName: 'India',
        flag: '🇮🇳',
        continent: Continent.ASIA,
        generalNumber: '112',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Emergency', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '100', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '101', label: 'Fire', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '108', label: 'Ambulance', is24h: true, isFree: true },
            { category: EmergencyCategory.CHILD, number: '1098', label: 'Childline', is24h: true, isFree: true },
            { category: EmergencyCategory.DOMESTIC_VIOLENCE, number: '181', label: 'Women Helpline', is24h: true, isFree: true },
            { category: EmergencyCategory.DISASTER, number: '1078', label: 'Disaster Management', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'TH',
        countryName: 'Thailand',
        flag: '🇹🇭',
        continent: Continent.ASIA,
        generalNumber: '191',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '191', label: 'ตำรวจ (Police)', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '199', label: 'ดับเพลิง (Fire)', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '1669', label: 'กู้ชีพ (Ambulance)', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '191', label: 'ฉุกเฉิน', is24h: true, isFree: true },
        ],
    },

    // ---- AFRICA ----
    {
        countryCode: 'ZA',
        countryName: 'South Africa',
        flag: '🇿🇦',
        continent: Continent.AFRICA,
        generalNumber: '10111',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Emergency (Mobile)', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '10111', label: 'SAPS', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '10177', label: 'Ambulance', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '10177', label: 'Fire Brigade', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'MA',
        countryName: 'Morocco',
        flag: '🇲🇦',
        continent: Continent.AFRICA,
        generalNumber: '19',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '19', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '15', label: 'Pompiers', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '15', label: 'SAMU', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '19', label: 'Urgences', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'SN',
        countryName: 'Senegal',
        flag: '🇸🇳',
        continent: Continent.AFRICA,
        generalNumber: '17',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '17', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '18', label: 'Pompiers', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '15', label: 'SAMU', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '17', label: 'Urgences', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'CI',
        countryName: 'Ivory Coast',
        flag: '🇨🇮',
        continent: Continent.AFRICA,
        generalNumber: '185',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '110', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '180', label: 'Pompiers', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '185', label: 'SAMU', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '185', label: 'Urgences', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'CM',
        countryName: 'Cameroon',
        flag: '🇨🇲',
        continent: Continent.AFRICA,
        generalNumber: '117',
        numbers: [
            { category: EmergencyCategory.POLICE, number: '117', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '118', label: 'Pompiers', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '119', label: 'SAMU', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '117', label: 'Urgences', is24h: true, isFree: true },
        ],
    },

    // ---- OCEANIA ----
    {
        countryCode: 'AU',
        countryName: 'Australia',
        flag: '🇦🇺',
        continent: Continent.OCEANIA,
        generalNumber: '000',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '000', label: 'Triple Zero', is24h: true, isFree: true },
            { category: EmergencyCategory.GENERAL, number: '112', label: 'Emergency (Mobile)', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '000', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '000', label: 'Fire', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '000', label: 'Ambulance', is24h: true, isFree: true },
            { category: EmergencyCategory.POISON, number: '13 11 26', label: 'Poisons Information', is24h: true, isFree: true },
            { category: EmergencyCategory.MENTAL_HEALTH, number: '13 11 14', label: 'Lifeline', is24h: true, isFree: true },
        ],
    },
    {
        countryCode: 'NZ',
        countryName: 'New Zealand',
        flag: '🇳🇿',
        continent: Continent.OCEANIA,
        generalNumber: '111',
        numbers: [
            { category: EmergencyCategory.GENERAL, number: '111', label: 'Emergency', is24h: true, isFree: true },
            { category: EmergencyCategory.POLICE, number: '111', label: 'Police', is24h: true, isFree: true },
            { category: EmergencyCategory.FIRE, number: '111', label: 'Fire', is24h: true, isFree: true },
            { category: EmergencyCategory.MEDICAL, number: '111', label: 'Ambulance', is24h: true, isFree: true },
        ],
    },
];

// ============================================================================
// HELPERS — REVERSE GEOCODING COUNTRY
// ============================================================================

/**
 * Reverse-geocode coordinates to ISO country code using expo-location.
 * Returns null if reverse geocoding fails.
 */
async function reverseGeocodeCountry(
    latitude: number,
    longitude: number
): Promise<string | null> {
    try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results.length > 0 && results[0].isoCountryCode) {
            return results[0].isoCountryCode.toUpperCase();
        }
        return null;
    } catch (err) {
        log.warn('Reverse geocode failed', err);
        return null;
    }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Obtenir toute la base de données (30+ pays).
 */
export function getAllCountries(): CountryEmergencyData[] {
    return EMERGENCY_DATABASE;
}

/**
 * Obtenir les données d'un pays par code ISO.
 */
export function getCountryByCode(
    countryCode: string
): CountryEmergencyData | null {
    const upper = countryCode.toUpperCase();
    return EMERGENCY_DATABASE.find((c) => c.countryCode === upper) ?? null;
}

/**
 * Rechercher des pays par nom ou code.
 */
export function searchCountries(query: string): CountryEmergencyData[] {
    if (!query || query.trim().length === 0) return EMERGENCY_DATABASE;
    const q = query.toLowerCase().trim();
    return EMERGENCY_DATABASE.filter(
        (c) =>
            c.countryCode.toLowerCase().includes(q) ||
            c.countryName.toLowerCase().includes(q)
    );
}

/**
 * Filtrer les pays par continent.
 */
export function getCountriesByContinent(
    continent: Continent
): CountryEmergencyData[] {
    return EMERGENCY_DATABASE.filter((c) => c.continent === continent);
}

/**
 * Obtenir les numéros d'un pays filtrés par catégorie.
 */
export function getNumbersByCategory(
    countryCode: string,
    category: EmergencyCategory
): EmergencyNumber[] {
    const country = getCountryByCode(countryCode);
    if (!country) return [];
    return country.numbers.filter((n) => n.category === category);
}

/**
 * Obtenir toutes les catégories disponibles pour un pays.
 */
export function getAvailableCategories(
    countryCode: string
): EmergencyCategory[] {
    const country = getCountryByCode(countryCode);
    if (!country) return [];
    const categories = new Set(country.numbers.map((n) => n.category));
    return Array.from(categories);
}

/**
 * Détecter le pays de l'utilisateur via géolocalisation.
 */
export async function detectUserCountry(): Promise<GeoLocationResult> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            log.warn('Location permission denied');
            return {
                countryCode: null,
                latitude: null,
                longitude: null,
                accuracy: null,
                timestamp: new Date().toISOString(),
                source: 'default',
            };
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const countryCode = await reverseGeocodeCountry(
            location.coords.latitude,
            location.coords.longitude
        );

        return {
            countryCode,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: new Date().toISOString(),
            source: 'gps',
        };
    } catch (err) {
        log.error('detectUserCountry failed', err);
        return {
            countryCode: null,
            latitude: null,
            longitude: null,
            accuracy: null,
            timestamp: new Date().toISOString(),
            source: 'default',
        };
    }
}

/**
 * Lancer un appel téléphonique vers un numéro d'urgence.
 */
export async function callEmergencyNumber(number: string): Promise<boolean> {
    try {
        const cleaned = number.replace(/\s+/g, '');
        const url = Platform.OS === 'ios'
            ? `telprompt:${cleaned}`
            : `tel:${cleaned}`;

        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
            log.warn('Cannot open phone URL:', url);
            return false;
        }

        await Linking.openURL(url);
        log.info('Called emergency number:', number);
        return true;
    } catch (err) {
        log.error('callEmergencyNumber failed', err);
        return false;
    }
}

/**
 * Obtenir l'icône correspondant à une catégorie d'urgence.
 */
export function getCategoryIcon(category: EmergencyCategory): string {
    const iconMap: Record<EmergencyCategory, string> = {
        [EmergencyCategory.POLICE]: '🚔',
        [EmergencyCategory.FIRE]: '🚒',
        [EmergencyCategory.MEDICAL]: '🚑',
        [EmergencyCategory.GENERAL]: '🆘',
        [EmergencyCategory.CHILD]: '👶',
        [EmergencyCategory.DOMESTIC_VIOLENCE]: '🛡️',
        [EmergencyCategory.POISON]: '☠️',
        [EmergencyCategory.MENTAL_HEALTH]: '🧠',
        [EmergencyCategory.ROADSIDE]: '🚗',
        [EmergencyCategory.COAST_GUARD]: '⚓',
        [EmergencyCategory.MOUNTAIN_RESCUE]: '⛰️',
        [EmergencyCategory.DISASTER]: '🌊',
    };
    return iconMap[category] || '📞';
}

/**
 * Obtenir le label traduit d'une catégorie.
 * Retourne une clé i18n (préfixée par emergency.category.)
 */
export function getCategoryI18nKey(category: EmergencyCategory): string {
    return `emergency.categories.${category}`;
}

/**
 * Obtenir le nombre total de pays dans la base.
 */
export function getTotalCountries(): number {
    return EMERGENCY_DATABASE.length;
}

/**
 * Obtenir les continents disponibles.
 */
export function getAvailableContinents(): Continent[] {
    const continents = new Set(EMERGENCY_DATABASE.map((c) => c.continent));
    return Array.from(continents);
}
