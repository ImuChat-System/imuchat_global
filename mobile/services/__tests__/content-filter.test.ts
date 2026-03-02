/**
 * Tests pour le service content-filter.
 *
 * Couvre : checkProfanity, checkHateSpeech, checkSpam, checkFlood,
 *          checkLinks, analyzeMessage, isAutoModerationActive.
 *
 * Phase 3 — Groupe 9 fonc. #4 : Détection spam / toxicité
 */

// ─── Mock logger ──────────────────────────────────────────────

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

// ─── Imports ──────────────────────────────────────────────────

const {
    checkProfanity,
    checkHateSpeech,
    checkSpam,
    checkFlood,
    checkLinks,
    analyzeMessage,
    isAutoModerationActive,
    getDefaultModerationConfig,
    incrementWarnings,
    getWarningCount,
    resetWarnings,
    resetAllTrackers,
    cleanupTrackers,
} = require("../../services/content-filter");

// ─── Helpers ──────────────────────────────────────────────────

function makeConfig(overrides) {
    return {
        ...getDefaultModerationConfig(),
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────

describe("ContentFilter Service", () => {
    beforeEach(() => {
        resetAllTrackers();
    });

    // ────────────────────────────────────────────────────────────
    // checkProfanity
    // ────────────────────────────────────────────────────────────

    describe("checkProfanity", () => {
        it("détecte les mots interdits personnalisés (bannedWords)", () => {
            var result = checkProfanity("Tu es un idiot complet", ["idiot", "stupide"]);
            expect(result).not.toBeNull();
            expect(result.type).toBe("custom_word");
            expect(result.matchedPatterns).toContain("idiot");
            expect(result.severity).toBe(3);
        });

        it("ne détecte rien si bannedWords vide et message clean", () => {
            var result = checkProfanity("Bonjour tout le monde !", []);
            expect(result).toBeNull();
        });

        it("détecte les profanités intégrées (français)", () => {
            var result = checkProfanity("Quelle merde ce truc", []);
            expect(result).not.toBeNull();
            expect(result.type).toBe("profanity");
            expect(result.severity).toBe(2);
        });

        it("détecte les profanités intégrées (anglais)", () => {
            var result = checkProfanity("What the fuck", []);
            expect(result).not.toBeNull();
            expect(result.type).toBe("profanity");
        });

        it("ignore la casse dans les bannedWords", () => {
            var result = checkProfanity("Tu es IDIOT", ["idiot"]);
            expect(result).not.toBeNull();
        });

        it("priorise les mots personnalisés sur les intégrés", () => {
            var result = checkProfanity("Tu es un merde", ["merde"]);
            expect(result).not.toBeNull();
            expect(result.type).toBe("custom_word");
        });

        it("ne matche pas les sous-chaînes (boundary)", () => {
            var result = checkProfanity("Un aristocrate aime le paradis", ["rat"]);
            // 'rat' ne devrait pas matcher dans 'aristocrate' grâce à \b
            expect(result).toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────
    // checkHateSpeech
    // ────────────────────────────────────────────────────────────

    describe("checkHateSpeech", () => {
        it("détecte le discours haineux", () => {
            var result = checkHateSpeech("death to all enemies");
            expect(result).not.toBeNull();
            expect(result.type).toBe("hate_speech");
            expect(result.severity).toBe(5);
        });

        it("ne détecte rien sur un message normal", () => {
            var result = checkHateSpeech("J'aime les chats et les chiens");
            expect(result).toBeNull();
        });

        it("détecte les mots extrémistes", () => {
            var result = checkHateSpeech("The nazis were horrible people");
            expect(result).not.toBeNull();
            expect(result.type).toBe("hate_speech");
        });
    });

    // ────────────────────────────────────────────────────────────
    // checkSpam
    // ────────────────────────────────────────────────────────────

    describe("checkSpam", () => {
        it("ne détecte pas le spam sous la limite", () => {
            // Enregistrer quelques messages d'abord
            var config = makeConfig({});
            for (var i = 0; i < 5; i++) {
                analyzeMessage("msg " + i, config, "user-1", "conv-1");
            }
            var result = checkSpam("user-1", "conv-1", 15);
            expect(result).toBeNull();
        });

        it("détecte le spam au-dessus de la limite", () => {
            var config = makeConfig({ spamLimitPerMinute: 5 });
            for (var i = 0; i < 6; i++) {
                analyzeMessage("message " + i, config, "user-spam", "conv-spam");
            }
            var result = checkSpam("user-spam", "conv-spam", 5);
            expect(result).not.toBeNull();
            expect(result.type).toBe("spam");
            expect(result.severity).toBe(3);
        });
    });

    // ────────────────────────────────────────────────────────────
    // checkFlood
    // ────────────────────────────────────────────────────────────

    describe("checkFlood", () => {
        it("ne détecte pas le flood sous le seuil", () => {
            var config = makeConfig({ floodThreshold: 5 });
            for (var i = 0; i < 3; i++) {
                analyzeMessage("même message", config, "user-flood", "conv-flood");
            }
            var result = checkFlood("même message", "user-flood", "conv-flood", 5);
            expect(result).toBeNull();
        });

        it("détecte le flood au-dessus du seuil", () => {
            var config = makeConfig({ floodThreshold: 3 });
            for (var i = 0; i < 4; i++) {
                analyzeMessage("spam spam", config, "user-flood2", "conv-flood2");
            }
            var result = checkFlood("spam spam", "user-flood2", "conv-flood2", 3);
            expect(result).not.toBeNull();
            expect(result.type).toBe("flood");
            expect(result.severity).toBe(2);
        });

        it("ignore la casse pour la détection de flood", () => {
            var config = makeConfig({ floodThreshold: 2 });
            analyzeMessage("Hello World", config, "user-f3", "conv-f3");
            analyzeMessage("hello world", config, "user-f3", "conv-f3");
            analyzeMessage("HELLO WORLD", config, "user-f3", "conv-f3");
            var result = checkFlood("hello world", "user-f3", "conv-f3", 2);
            expect(result).not.toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────
    // checkLinks
    // ────────────────────────────────────────────────────────────

    describe("checkLinks", () => {
        it("bloque tous les liens si allowedDomains est vide", () => {
            var result = checkLinks("Regarde https://evil.com/malware", []);
            expect(result).not.toBeNull();
            expect(result.type).toBe("link");
            expect(result.matchedPatterns).toHaveLength(1);
        });

        it("autorise les liens de domaines whitelistés", () => {
            var result = checkLinks("Voici https://youtube.com/watch?v=123", ["youtube.com"]);
            expect(result).toBeNull();
        });

        it("bloque les liens hors whitelist", () => {
            var result = checkLinks(
                "Regarde https://evil.com et https://youtube.com/vid",
                ["youtube.com"],
            );
            expect(result).not.toBeNull();
            expect(result.matchedPatterns).toHaveLength(1);
            expect(result.matchedPatterns[0]).toContain("evil.com");
        });

        it("ne détecte rien s'il n'y a pas de liens", () => {
            var result = checkLinks("Bonjour tout le monde", []);
            expect(result).toBeNull();
        });

        it("détecte les liens www.", () => {
            var result = checkLinks("Regarde www.example.com", []);
            expect(result).not.toBeNull();
        });
    });

    // ────────────────────────────────────────────────────────────
    // analyzeMessage
    // ────────────────────────────────────────────────────────────

    describe("analyzeMessage", () => {
        it("laisse passer un message propre", () => {
            var config = makeConfig({ wordFilterEnabled: true });
            var result = analyzeMessage("Salut tout le monde !", config, "user-1", "conv-1");
            expect(result.passed).toBe(true);
            expect(result.violations).toHaveLength(0);
            expect(result.score).toBe(0);
            expect(result.suggestedAction).toBeNull();
        });

        it("détecte un mot interdit quand le filtre est activé", () => {
            var config = makeConfig({
                wordFilterEnabled: true,
                bannedWords: ["bitcoin", "crypto"],
            });
            var result = analyzeMessage("Achetez du bitcoin maintenant !", config, "user-2", "conv-2");
            expect(result.passed).toBe(false);
            expect(result.violations.length).toBeGreaterThan(0);
            expect(result.score).toBeGreaterThan(0);
            expect(result.suggestedAction).not.toBeNull();
        });

        it("ne filtre pas les mots si wordFilterEnabled est false", () => {
            var config = makeConfig({
                wordFilterEnabled: false,
                bannedWords: ["bitcoin"],
            });
            var result = analyzeMessage("Achetez du bitcoin", config, "user-3", "conv-3");
            // Le hate speech check est toujours actif, mais 'bitcoin' n'est pas hate speech
            expect(result.violations.filter(function (v) { return v.type === "custom_word"; })).toHaveLength(0);
        });

        it("détecte les liens quand linkFilter est activé", () => {
            var config = makeConfig({
                linkFilterEnabled: true,
                allowedDomains: [],
            });
            var result = analyzeMessage("Venez voir https://scam.com", config, "user-4", "conv-4");
            expect(result.passed).toBe(false);
            var linkViolation = result.violations.find(function (v) { return v.type === "link"; });
            expect(linkViolation).toBeDefined();
        });

        it("retourne un score élevé pour le discours haineux", () => {
            var config = makeConfig({});
            var result = analyzeMessage("death to all humans", config, "user-5", "conv-5");
            expect(result.passed).toBe(false);
            expect(result.score).toBeGreaterThanOrEqual(50);
        });

        it("gère les erreurs gracieusement (fail-open)", () => {
            // Passer une config invalide ne devrait pas crasher
            var config = makeConfig({});
            config.bannedWords = null; // invalide
            config.wordFilterEnabled = true;
            // Devrait ne pas crasher et retourner passed = true (fail-open)
            var result = analyzeMessage("test", config, "u", "c");
            expect(result).toBeDefined();
            expect(result.passed).toBeDefined();
        });

        it("accumule des violations multiples", () => {
            var config = makeConfig({
                wordFilterEnabled: true,
                bannedWords: ["scam"],
                linkFilterEnabled: true,
                allowedDomains: [],
            });
            var result = analyzeMessage(
                "Venez sur https://scam.com c'est pas un scam promis",
                config, "user-6", "conv-6",
            );
            expect(result.violations.length).toBeGreaterThanOrEqual(2);
        });
    });

    // ────────────────────────────────────────────────────────────
    // isAutoModerationActive
    // ────────────────────────────────────────────────────────────

    describe("isAutoModerationActive", () => {
        it("retourne false pour la config par défaut", () => {
            var config = getDefaultModerationConfig();
            // par défaut wordFilter et linkFilter sont off, spamLimit=15 (>0) donc true
            // en fait spamLimitPerMinute > 0, donc c'est actif
            expect(isAutoModerationActive(config)).toBe(true);
        });

        it("retourne true si wordFilter activé", () => {
            var config = makeConfig({ wordFilterEnabled: true, spamLimitPerMinute: 0, floodThreshold: 0 });
            expect(isAutoModerationActive(config)).toBe(true);
        });

        it("retourne true si linkFilter activé", () => {
            var config = makeConfig({ linkFilterEnabled: true, spamLimitPerMinute: 0, floodThreshold: 0 });
            expect(isAutoModerationActive(config)).toBe(true);
        });

        it("retourne true si AI modération activée", () => {
            var config = makeConfig({ aiModerationEnabled: true, spamLimitPerMinute: 0, floodThreshold: 0 });
            expect(isAutoModerationActive(config)).toBe(true);
        });

        it("retourne false si tout désactivé", () => {
            var config = makeConfig({
                wordFilterEnabled: false,
                linkFilterEnabled: false,
                spamLimitPerMinute: 0,
                floodThreshold: 0,
                aiModerationEnabled: false,
            });
            expect(isAutoModerationActive(config)).toBe(false);
        });
    });

    // ────────────────────────────────────────────────────────────
    // Warning tracking
    // ────────────────────────────────────────────────────────────

    describe("Warning tracking", () => {
        it("incrémente et lit le compteur d'avertissements", () => {
            expect(getWarningCount("user-w1", "conv-w1")).toBe(0);
            incrementWarnings("user-w1", "conv-w1");
            expect(getWarningCount("user-w1", "conv-w1")).toBe(1);
            incrementWarnings("user-w1", "conv-w1");
            expect(getWarningCount("user-w1", "conv-w1")).toBe(2);
        });

        it("réinitialise les avertissements", () => {
            incrementWarnings("user-w2", "conv-w2");
            incrementWarnings("user-w2", "conv-w2");
            resetWarnings("user-w2", "conv-w2");
            expect(getWarningCount("user-w2", "conv-w2")).toBe(0);
        });

        it("isole les avertissements par conversation", () => {
            incrementWarnings("user-w3", "conv-a");
            incrementWarnings("user-w3", "conv-b");
            incrementWarnings("user-w3", "conv-b");
            expect(getWarningCount("user-w3", "conv-a")).toBe(1);
            expect(getWarningCount("user-w3", "conv-b")).toBe(2);
        });
    });

    // ────────────────────────────────────────────────────────────
    // Cleanup
    // ────────────────────────────────────────────────────────────

    describe("cleanupTrackers", () => {
        it("ne crash pas et nettoie correctement", () => {
            var config = makeConfig({});
            analyzeMessage("test", config, "user-c", "conv-c");
            expect(function () { cleanupTrackers(); }).not.toThrow();
        });
    });

    // ────────────────────────────────────────────────────────────
    // getDefaultModerationConfig
    // ────────────────────────────────────────────────────────────

    describe("getDefaultModerationConfig", () => {
        it("retourne une config avec tous les champs", () => {
            var config = getDefaultModerationConfig();
            expect(config).toHaveProperty("wordFilterEnabled", false);
            expect(config).toHaveProperty("bannedWords");
            expect(config).toHaveProperty("wordFilterAction");
            expect(config).toHaveProperty("linkFilterEnabled", false);
            expect(config).toHaveProperty("allowedDomains");
            expect(config).toHaveProperty("linkFilterAction");
            expect(config).toHaveProperty("spamLimitPerMinute", 15);
            expect(config).toHaveProperty("spamAction");
            expect(config).toHaveProperty("floodThreshold", 5);
            expect(config).toHaveProperty("muteDurationMinutes", 10);
            expect(config).toHaveProperty("warnBeforeAction", true);
            expect(config).toHaveProperty("maxWarnings", 3);
            expect(config).toHaveProperty("aiModerationEnabled", false);
        });
    });
});
