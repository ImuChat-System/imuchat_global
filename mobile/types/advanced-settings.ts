/**
 * Advanced Settings Types
 *
 * Types pour les paramètres avancés globaux :
 * - Notifications granulaires
 * - Son & ambiances
 * - Performance (low mode)
 * - Données mobiles
 * - Accessibilité
 * - Région & fuseau horaire
 * - API & intégrations
 * - Webhooks
 */

// ---------------------------------------------------------------------------
// Notifications granulaires
// ---------------------------------------------------------------------------

export type NotificationChannel =
    | "messages"
    | "mentions"
    | "calls"
    | "groups"
    | "stories"
    | "events"
    | "system"
    | "marketing";

export type NotificationDelivery = "push" | "inApp" | "email" | "sms";

export interface ChannelNotificationConfig {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    /** Delivery methods enabled */
    delivery: NotificationDelivery[];
}

export interface QuietHours {
    enabled: boolean;
    startHour: number; // 0-23
    startMinute: number; // 0-59
    endHour: number;
    endMinute: number;
    /** Days of week (0=Sun, 6=Sat) */
    days: number[];
}

export interface GranularNotificationPrefs {
    channels: Record<NotificationChannel, ChannelNotificationConfig>;
    quietHours: QuietHours;
    /** Group notifications by conversation */
    groupNotifications: boolean;
    /** Show message preview in notifications */
    showPreview: boolean;
}

// ---------------------------------------------------------------------------
// Son & ambiances
// ---------------------------------------------------------------------------

export type AmbientSound =
    | "none"
    | "rain"
    | "forest"
    | "ocean"
    | "cafe"
    | "fireplace"
    | "lofi"
    | "space";

export interface SoundPrefs {
    /** Master volume 0-100 */
    masterVolume: number;
    /** Notification sound enabled */
    notificationSound: boolean;
    /** UI interaction sounds (tap, swipe) */
    uiSounds: boolean;
    /** Call ringtone */
    ringtone: string;
    /** Message tone */
    messageTone: string;
    /** Ambient background sound */
    ambientSound: AmbientSound;
    /** Ambient volume 0-100 */
    ambientVolume: number;
    /** Haptic feedback */
    hapticEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

export type PerformanceMode = "auto" | "high" | "balanced" | "low";

export interface PerformancePrefs {
    mode: PerformanceMode;
    /** Disable animations */
    disableAnimations: boolean;
    /** Reduce image quality */
    reducedImageQuality: boolean;
    /** Disable auto-play videos */
    disableAutoPlayVideos: boolean;
    /** Disable background sync */
    disableBackgroundSync: boolean;
    /** Limit FPS */
    limitFps: boolean;
    /** Cache size limit in MB */
    cacheSizeLimitMb: number;
}

// ---------------------------------------------------------------------------
// Données mobiles
// ---------------------------------------------------------------------------

export type MediaDownloadPolicy = "always" | "wifi" | "never";

export interface DataUsagePrefs {
    /** Auto-download images */
    autoDownloadImages: MediaDownloadPolicy;
    /** Auto-download videos */
    autoDownloadVideos: MediaDownloadPolicy;
    /** Auto-download audio */
    autoDownloadAudio: MediaDownloadPolicy;
    /** Auto-download documents */
    autoDownloadDocuments: MediaDownloadPolicy;
    /** Reduce image upload quality on mobile data */
    compressUploadsOnMobile: boolean;
    /** Sync contacts on wifi only */
    syncContactsWifiOnly: boolean;
    /** Data saver mode */
    dataSaverEnabled: boolean;
    /** Monthly data warning threshold in MB (0 = disabled) */
    dataWarningMb: number;
}

// ---------------------------------------------------------------------------
// Accessibilité
// ---------------------------------------------------------------------------

export type FontSizeScale = "small" | "default" | "large" | "extraLarge";
export type ContrastMode = "default" | "high" | "extraHigh";

export interface AccessibilityPrefs {
    /** Reduce motion / disable animations */
    reduceMotion: boolean;
    /** High contrast mode */
    contrastMode: ContrastMode;
    /** Font size scale */
    fontSizeScale: FontSizeScale;
    /** Bold text */
    boldText: boolean;
    /** Screen reader optimizations */
    screenReaderOptimized: boolean;
    /** Color blind mode */
    colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
    /** Auto-play captions */
    autoPlayCaptions: boolean;
    /** Mono audio */
    monoAudio: boolean;
}

// ---------------------------------------------------------------------------
// Région & fuseau horaire
// ---------------------------------------------------------------------------

export type DateFormatStyle = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type TimeFormatStyle = "12h" | "24h";

export interface RegionPrefs {
    /** IANA timezone */
    timezone: string;
    /** Auto-detect timezone */
    autoTimezone: boolean;
    /** Date format */
    dateFormat: DateFormatStyle;
    /** Time format */
    timeFormat: TimeFormatStyle;
    /** First day of week (0=Sun, 1=Mon) */
    firstDayOfWeek: 0 | 1;
    /** Country code (ISO 3166-1 alpha-2) */
    countryCode: string;
}

// ---------------------------------------------------------------------------
// API & intégrations tierces
// ---------------------------------------------------------------------------

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
    scopes: string[];
    isActive: boolean;
}

export type IntegrationProvider =
    | "github"
    | "gitlab"
    | "slack"
    | "discord"
    | "google"
    | "notion"
    | "trello"
    | "jira"
    | "zapier"
    | "openai"
    | "spotify"
    | "custom";

export interface Integration {
    id: string;
    provider: IntegrationProvider;
    name: string;
    isConnected: boolean;
    connectedAt: string | null;
    scopes: string[];
    avatarUrl: string | null;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export type WebhookEvent =
    | "message.new"
    | "message.updated"
    | "message.edited"
    | "message.deleted"
    | "user.joined"
    | "user.left"
    | "call.started"
    | "call.ended"
    | "story.created"
    | "group.updated"
    | "bot.command"
    | "file.uploaded";

export interface Webhook {
    id: string;
    url: string;
    name: string;
    events: WebhookEvent[];
    secret: string;
    isActive: boolean;
    createdAt: string;
    lastTriggeredAt: string | null;
    failureCount: number;
}

// ---------------------------------------------------------------------------
// Aggregated Advanced Settings State
// ---------------------------------------------------------------------------

export interface AdvancedSettingsState {
    notifications: GranularNotificationPrefs;
    sound: SoundPrefs;
    performance: PerformancePrefs;
    dataUsage: DataUsagePrefs;
    accessibility: AccessibilityPrefs;
    region: RegionPrefs;
    apiKeys: ApiKey[];
    integrations: Integration[];
    webhooks: Webhook[];
}
