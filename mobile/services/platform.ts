/**
 * Platform Integration Service - Mobile
 * Initialise tous les modules platform-core pour l'app mobile
 */

import {
    ChatEngineModule,
    EventBus,
    ModuleRegistry,
    SupabaseAuthModule
} from '@imuchat/platform-core';

class PlatformService {
    private registry: ModuleRegistry;
    private eventBus: EventBus;
    private authModule: SupabaseAuthModule;
    private chatModule: ChatEngineModule;
    private _initialized = false;
    private _initPromise: Promise<boolean> | null = null;
    private _started = false;
    private _startPromise: Promise<boolean> | null = null;

    constructor() {
        this.eventBus = new EventBus();
        this.registry = new ModuleRegistry();

        // Configuration Supabase (depuis .env)
        const supabaseConfig = {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
            enableEmailVerification: true,
            sessionExpirationHours: 24 * 7, // 7 jours
        };

        // Initialiser modules MVP
        this.authModule = new SupabaseAuthModule({
            description: 'Supabase Authentication Module for ImuChat',
            category: 'core',
            permissions: { network: true, storage: true },
            dependencies: [],
            platforms: ['ios', 'android'],
            removable: false,
            priority: 0,
        }, supabaseConfig, this.eventBus);
        this.chatModule = new ChatEngineModule(this.eventBus, {});

        // Enregistrer modules
        this.registry.register(this.authModule);
        this.registry.register(this.chatModule);
    }

    async initialize() {
        // Prevent multiple initializations
        if (this._initialized) {
            console.log('[PlatformService] Already initialized, skipping');
            return true;
        }

        // If initialization is in progress, wait for it
        if (this._initPromise) {
            console.log('[PlatformService] Initialization already in progress, waiting...');
            return this._initPromise;
        }

        this._initPromise = this._doInitialize();
        return this._initPromise;
    }

    private async _doInitialize(): Promise<boolean> {
        console.log('[PlatformService] Initializing modules...');

        try {
            // Initialiser chaque module
            await this.registry.initialize(this.authModule.config.id);
            await this.registry.initialize(this.chatModule.config.id);

            this._initialized = true;
            console.log('[PlatformService] All modules initialized successfully');
            return true;
        } catch (error) {
            console.error('[PlatformService] Module initialization failed:', error);
            this._initPromise = null; // Reset to allow retry
            return false;
        }
    }

    async start() {
        // Prevent multiple starts
        if (this._started) {
            console.log('[PlatformService] Already started, skipping');
            return true;
        }

        // If start is in progress, wait for it
        if (this._startPromise) {
            console.log('[PlatformService] Start already in progress, waiting...');
            return this._startPromise;
        }

        this._startPromise = this._doStart();
        return this._startPromise;
    }

    private async _doStart(): Promise<boolean> {
        console.log('[PlatformService] Starting modules...');

        try {
            await this.registry.startAll();
            this._started = true;
            console.log('[PlatformService] All modules started successfully');
            return true;
        } catch (error) {
            console.error('[PlatformService] Module start failed:', error);
            this._startPromise = null; // Reset to allow retry
            return false;
        }
    }

    async stop() {
        console.log('[PlatformService] Stopping modules...');
        await this.registry.stopAll();
        this._started = false;
        this._startPromise = null;
    }

    // Getters pour accès aux modules
    get auth() {
        return this.authModule;
    }

    get chat() {
        return this.chatModule;
    }

    get events() {
        return this.eventBus;
    }

    get modules() {
        return this.registry;
    }
}

// Singleton instance
let platformInstance: PlatformService | null = null;

export function usePlatform(): PlatformService {
    if (!platformInstance) {
        platformInstance = new PlatformService();
    }
    return platformInstance;
}

// Exports for direct use
export type { SupabaseAuthAPI } from '@imuchat/platform-core';
export { PlatformService };

