/**
 * Logger unifié pour ImuChat Mobile
 *
 * Centralise tous les logs avec :
 * - Niveaux : debug, info, warn, error
 * - Préfixe module (ex: [Chat], [StreamVideo])
 * - Suppression automatique en production (__DEV__)
 * - Timestamps
 * - Collecte optionnelle pour crash reporting
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
    level: LogLevel;
    module: string;
    message: string;
    data?: unknown;
    timestamp: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// En production, on ne log que warn + error
const MIN_LEVEL: LogLevel = __DEV__ ? "debug" : "warn";

// Buffer circulaire pour crash reporting (garde les N derniers logs)
const LOG_BUFFER_SIZE = 100;
const logBuffer: LogEntry[] = [];

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LEVEL];
}

function formatPrefix(module: string, level: LogLevel): string {
    const now = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
    return `[${now}] [${level.toUpperCase()}] [${module}]`;
}

function pushToBuffer(entry: LogEntry): void {
    logBuffer.push(entry);
    if (logBuffer.length > LOG_BUFFER_SIZE) {
        logBuffer.shift();
    }
}

function log(
    level: LogLevel,
    module: string,
    message: string,
    data?: unknown,
): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
        level,
        module,
        message,
        data,
        timestamp: new Date().toISOString(),
    };

    pushToBuffer(entry);

    const prefix = formatPrefix(module, level);
    const consoleMethod = level === "debug" ? "log" : level;

    if (data !== undefined) {
        console[consoleMethod](`${prefix} ${message}`, data);
    } else {
        console[consoleMethod](`${prefix} ${message}`);
    }
}

/**
 * Crée un logger scopé à un module.
 *
 * @example
 * const log = createLogger('Chat');
 * log.info('Message envoyé', { id: '123' });
 * log.error('Échec envoi', error);
 */
export function createLogger(module: string) {
    return {
        debug: (message: string, data?: unknown) =>
            log("debug", module, message, data),
        info: (message: string, data?: unknown) =>
            log("info", module, message, data),
        warn: (message: string, data?: unknown) =>
            log("warn", module, message, data),
        error: (message: string, data?: unknown) =>
            log("error", module, message, data),
    };
}

/**
 * Récupère les derniers logs pour crash reporting / diagnostics.
 */
export function getRecentLogs(): ReadonlyArray<LogEntry> {
    return [...logBuffer];
}

/**
 * Vide le buffer de logs.
 */
export function clearLogBuffer(): void {
    logBuffer.length = 0;
}

// Logger par défaut (module "App")
const defaultLogger = createLogger("App");
export default defaultLogger;
