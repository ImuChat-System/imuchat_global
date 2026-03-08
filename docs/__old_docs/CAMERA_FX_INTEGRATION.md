# 🔌 Intégration Camera FX - Guide Technique

## 🎯 Vue d'ensemble de l'Intégration

Ce document détaille comment le **Module Camera FX** s'intègre techniquement avec l'écosystème ImuChat existant, en respectant l'architecture modulaire et les patterns établis.

## 🏗️ Architecture d'Intégration

### 📱 Relation avec les Modules Core

```text
┌─────────────────────────────────────────────────────────────┐
│                     ImuChat Core App                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Chat     │  │   Stories   │  │Media Handler│ (Core)  │
│  │   Module    │  │   Module    │  │    Core     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Camera FX Module                       │   │
│  │                 (Store Optional)                    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│            Module Registry & Event Bus                     │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Pattern d'Intégration

#### 1. **Module Registry Pattern**

```typescript
// Module Registration
export class CameraFXModule implements ImuModule {
  static readonly MODULE_ID = 'camera-fx';
  static readonly VERSION = '1.0.0';
  static readonly DEPENDENCIES = ['media-handler-core'];
  
  async initialize(registry: ModuleRegistry): Promise<void> {
    // Enregistrement des services
    registry.registerService('camera-fx', new CameraFXService());
    registry.registerHook('useCameraFX', useCameraFX);
    
    // Intégration avec autres modules
    this.integrateWithChat(registry);
    this.integrateWithStories(registry);
    this.integrateWithMediaHandler(registry);
  }
  
  async cleanup(): Promise<void> {
    // Nettoyage des ressources GPU
    await FilterEngine.cleanup();
    await FaceDetectionService.cleanup();
  }
}
```

#### 2. **Event Bus Integration**

```typescript
// Communication inter-modules via Event Bus
export class CameraFXEventIntegration {
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Écouter les événements des autres modules
    this.eventBus.subscribe('chat:compose:media-request', this.handleChatMediaRequest);
    this.eventBus.subscribe('stories:create:start', this.handleStoriesCreateStart);
    this.eventBus.subscribe('media:capture:request', this.handleMediaCaptureRequest);
  }
  
  private handleChatMediaRequest = async (event: ChatMediaRequestEvent) => {
    if (this.isAvailable()) {
      // Proposer Camera FX comme option
      this.eventBus.emit('camera-fx:option:available', {
        source: 'chat',
        conversationId: event.conversationId,
        context: event.context
      });
    }
  };
}
```

### 🔌 Points d'Intégration Spécifiques

#### 📬 Intégration Chat Module

```typescript
// Extension du MessageInput avec Camera FX
export const MessageInputWithCameraFX = ({ conversationId }: Props) => {
  const { isAvailable, openCameraFX } = useCameraFX();
  const { sendMessage } = useMessageSender(conversationId);
  
  const cameraOptions = useMemo(() => {
    const baseOptions = [
      { id: 'basic', label: 'Photo/Vidéo', icon: 'camera' }
    ];
    
    if (isAvailable) {
      baseOptions.push(
        { id: 'fx', label: 'Effets', icon: 'magic-wand' },
        { id: 'ar', label: 'AR', icon: 'sparkles' }
      );
    }
    
    return baseOptions;
  }, [isAvailable]);
  
  const handleCameraOption = async (optionId: string) => {
    switch (optionId) {
      case 'fx':
        const result = await openCameraFX({
          mode: 'chat',
          presets: ['beauty-subtle', 'color-enhance'],
          onCapture: (media) => sendMessage(media.uri, { type: 'media' })
        });
        break;
        
      case 'ar':
        await openCameraFX({
          mode: 'chat',
          enableAR: true,
          filters: ['face-masks', 'animations'],
          onCapture: (media) => sendMessage(media.uri, { type: 'media' })
        });
        break;
        
      default:
        // Fallback vers caméra basique
        openBasicCamera();
    }
  };
};
```

#### 📸 Intégration Stories Module

```typescript
// Extension StoryCreator avec Camera FX
export const StoryCreatorWithCameraFX = () => {
  const { isAvailable, hasAdvancedFeatures } = useCameraFX();
  
  const creationModes = useMemo(() => [
    { 
      id: 'quick', 
      label: 'Rapide',
      description: 'Photo/vidéo simple',
      available: true 
    },
    { 
      id: 'enhanced', 
      label: 'Amélioré',
      description: 'Avec filtres et effets',
      available: isAvailable,
      premium: false
    },
    { 
      id: 'professional', 
      label: 'Pro',
      description: 'AR avancé, édition complète',
      available: hasAdvancedFeatures,
      premium: true
    }
  ], [isAvailable, hasAdvancedFeatures]);
  
  const handleModeSelect = async (mode: string) => {
    switch (mode) {
      case 'enhanced':
        return openCameraFX({
          mode: 'story',
          aspectRatio: '9:16',
          filters: 'story-optimized',
          maxDuration: 60
        });
        
      case 'professional':
        return openCameraFX({
          mode: 'story',
          aspectRatio: '9:16',
          enableAllFeatures: true,
          editingMode: true,
          maxDuration: 120
        });
    }
  };
};
```

#### 🎥 Intégration Media Handler Core

```typescript
// Extension du Media Handler existant
export class MediaHandlerCameraFXIntegration {
  private mediaHandler: MediaHandlerCore;
  private cameraFX: CameraFXService;
  
  constructor(mediaHandler: MediaHandlerCore, cameraFX: CameraFXService) {
    this.mediaHandler = mediaHandler;
    this.cameraFX = cameraFX;
  }
  
  async captureMedia(options: CaptureOptions): Promise<CaptureResult> {
    // Décision intelligente : basic vs FX
    if (this.shouldUseCameraFX(options)) {
      return await this.cameraFX.capture({
        ...options,
        fallback: () => this.mediaHandler.captureBasic(options)
      });
    }
    
    return await this.mediaHandler.captureBasic(options);
  }
  
  private shouldUseCameraFX(options: CaptureOptions): boolean {
    return (
      this.cameraFX.isAvailable() &&
      (options.enhancementsRequested || 
       options.context === 'story' ||
       options.userPreference === 'enhanced')
    );
  }
}
```

## 🛠️ Installation et Activation

### 📦 Processus d'Installation Store

```typescript
// Installation via Store Module
export class CameraFXInstallation {
  async install(): Promise<InstallResult> {
    try {
      // 1. Vérification compatibilité
      const compatibility = await this.checkDeviceCompatibility();
      if (!compatibility.isSupported) {
        throw new Error(`Device not compatible: ${compatibility.reason}`);
      }
      
      // 2. Téléchargement assets de base
      await this.downloadBaseAssets();
      
      // 3. Initialisation services
      await this.initializeServices();
      
      // 4. Enregistrement dans Module Registry
      await ModuleRegistry.register(CameraFXModule);
      
      // 5. Notification aux autres modules
      EventBus.emit('module:installed', { moduleId: 'camera-fx' });
      
      return { success: true, moduleId: 'camera-fx' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private async checkDeviceCompatibility(): Promise<CompatibilityResult> {
    const device = await DeviceInfo.getDeviceInfo();
    
    return {
      isSupported: (
        device.totalMemory >= 3 * 1024 * 1024 * 1024 && // 3GB RAM
        device.supportsOpenGLES >= 3.0 &&
        device.cameraAvailable
      ),
      reason: !device.cameraAvailable ? 'Camera not available' : 
              device.totalMemory < 3e9 ? 'Insufficient RAM' : 
              'OpenGL ES 3.0+ required'
    };
  }
}
```

### 🔄 Activation Dynamique

```typescript
// Hook pour activation dynamique
export const useCameraFXActivation = () => {
  const [status, setStatus] = useState<'inactive' | 'loading' | 'active' | 'error'>('inactive');
  
  const activate = useCallback(async () => {
    if (status === 'active') return true;
    
    setStatus('loading');
    try {
      // Vérifier si installé
      if (!ModuleRegistry.isInstalled('camera-fx')) {
        throw new Error('Module not installed');
      }
      
      // Vérifier permissions
      const permissions = await PermissionsManager.requestAllRequired();
      if (!permissions.allGranted) {
        throw new Error('Required permissions not granted');
      }
      
      // Initialiser services
      await CameraFXService.initialize();
      await FilterEngine.warmup();
      
      setStatus('active');
      return true;
    } catch (error) {
      setStatus('error');
      console.error('Failed to activate Camera FX:', error);
      return false;
    }
  }, [status]);
  
  return { status, activate };
};
```

## 🎯 Strategies de Fallback

### 🔄 Dégradation Gracieuse

```typescript
export class CameraFXFallbackManager {
  async handleCameraRequest(config: CameraConfig): Promise<CaptureResult> {
    try {
      // Tentative Camera FX
      if (this.isCameraFXAvailable()) {
        return await this.openCameraFX(config);
      }
    } catch (error) {
      console.warn('Camera FX failed, falling back to basic camera:', error);
    }
    
    // Fallback vers caméra basique
    return await this.openBasicCamera(config);
  }
  
  private isCameraFXAvailable(): boolean {
    return (
      ModuleRegistry.isInstalled('camera-fx') &&
      ModuleRegistry.isActive('camera-fx') &&
      PermissionsManager.hasRequiredPermissions()
    );
  }
  
  private async openBasicCamera(config: CameraConfig): Promise<CaptureResult> {
    // Utilisation du Media Handler Core
    return await MediaHandlerCore.captureBasic({
      type: config.type,
      quality: config.quality || 'medium',
      aspectRatio: config.aspectRatio || 'square'
    });
  }
}
```

### 📱 Interface Adaptative

```typescript
// Composant qui s'adapte selon disponibilité Camera FX
export const AdaptiveCameraButton = ({ onCapture, mode }: Props) => {
  const { isAvailable, isLoading } = useCameraFX();
  const fallbackManager = useFallbackManager();
  
  const handlePress = async () => {
    const result = await fallbackManager.handleCameraRequest({
      mode,
      preferEnhanced: true,
      onCapture
    });
  };
  
  const getButtonLabel = () => {
    if (isLoading) return 'Chargement...';
    if (isAvailable) return 'Caméra Pro';
    return 'Caméra';
  };
  
  const getButtonIcon = () => {
    return isAvailable ? 'magic-wand' : 'camera';
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Icon name={getButtonIcon()} />
      <Text>{getButtonLabel()}</Text>
    </TouchableOpacity>
  );
};
```

## ⚡ Optimisations d'Intégration

### 🚀 Lazy Loading Intelligent

```typescript
export class CameraFXLazyLoader {
  private static instance: CameraFXService | null = null;
  private static loadingPromise: Promise<CameraFXService> | null = null;
  
  static async getInstance(): Promise<CameraFXService> {
    if (this.instance) {
      return this.instance;
    }
    
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = this.loadModule();
    this.instance = await this.loadingPromise;
    this.loadingPromise = null;
    
    return this.instance;
  }
  
  private static async loadModule(): Promise<CameraFXService> {
    // Chargement dynamique du module
    const module = await import('@/modules/camera-fx');
    await module.CameraFXService.initialize();
    return module.CameraFXService;
  }
}
```

### 💾 Cache Partagé

```typescript
// Cache partagé entre modules pour éviter duplication
export class SharedMediaCache {
  private static cache = new Map<string, CachedMedia>();
  
  static async getCachedMedia(id: string): Promise<CachedMedia | null> {
    const cached = this.cache.get(id);
    
    if (cached && !this.isExpired(cached)) {
      return cached;
    }
    
    return null;
  }
  
  static setCachedMedia(id: string, media: CachedMedia): void {
    // Nettoyage automatique si cache trop volumineux
    if (this.cache.size > 50) {
      this.cleanupOldEntries();
    }
    
    this.cache.set(id, {
      ...media,
      timestamp: Date.now()
    });
  }
  
  static clearCacheForModule(moduleId: string): void {
    for (const [key, value] of this.cache.entries()) {
      if (value.sourceModule === moduleId) {
        this.cache.delete(key);
      }
    }
  }
}
```

## 🔒 Sécurité d'Intégration

### 🛡️ Isolation des Modules

```typescript
// Sandbox pour isoler Camera FX des autres modules
export class CameraFXSandbox {
  private allowedAPIs: Set<string>;
  private secureContext: SecureContext;
  
  constructor() {
    this.allowedAPIs = new Set([
      'camera',
      'microphone',
      'storage',
      'gpu',
      'face-detection'
    ]);
  }
  
  async executeInSandbox<T>(
    operation: () => Promise<T>,
    requiredAPIs: string[]
  ): Promise<T> {
    // Vérification permissions
    this.validateAPIAccess(requiredAPIs);
    
    // Execution sécurisée
    try {
      return await this.secureContext.run(operation);
    } catch (error) {
      // Log sécurisé sans exposer d'informations sensibles
      this.logSecureError(error);
      throw new Error('Operation failed in secure context');
    }
  }
  
  private validateAPIAccess(apis: string[]): void {
    for (const api of apis) {
      if (!this.allowedAPIs.has(api)) {
        throw new Error(`Unauthorized API access: ${api}`);
      }
    }
  }
}
```

## 📊 Monitoring d'Intégration

### 📈 Métriques Inter-modules

```typescript
export class IntegrationMetrics {
  static trackModuleInteraction(
    sourceModule: string, 
    targetModule: string, 
    action: string, 
    success: boolean
  ): void {
    const metric = {
      timestamp: Date.now(),
      sourceModule,
      targetModule,
      action,
      success,
      sessionId: SessionManager.getCurrentSessionId()
    };
    
    // Envoi asynchrone pour ne pas bloquer UI
    this.sendMetricAsync(metric);
  }
  
  static getIntegrationHealth(): IntegrationHealthReport {
    return {
      cameraFXAvailability: ModuleRegistry.isActive('camera-fx'),
      chatIntegrationStatus: this.checkChatIntegration(),
      storiesIntegrationStatus: this.checkStoriesIntegration(),
      performanceMetrics: this.getPerformanceMetrics(),
      errorRate: this.calculateErrorRate()
    };
  }
}
```

---

## 🎯 Conclusion

Cette architecture d'intégration garantit que le **Module Camera FX** s'intègre de manière transparente et robuste avec l'écosystème ImuChat existant, tout en maintenant :

- ✅ **Modularité** : Indépendance et capacité de désinstallation
- ✅ **Performance** : Optimisations et dégradation gracieuse  
- ✅ **Sécurité** : Isolation et contrôle d'accès
- ✅ **Expérience** : Interface adaptative et fallbacks intelligents
- ✅ **Maintenabilité** : Patterns clairs et monitoring complet

Le module peut ainsi enrichir l'expérience utilisateur sans compromettre la stabilité ou les performances de l'application principale.
