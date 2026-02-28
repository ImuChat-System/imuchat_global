/**
 * modules-api.ts — Service d'accès aux modules via Supabase (mobile).
 *
 * Adapté depuis web-app/src/services/modules-api.ts pour React Native.
 * Utilise le même schéma Supabase (tables `modules` et `user_modules`).
 */

import { createLogger } from '@/services/logger';
import { getCurrentUser, supabase } from '@/services/supabase';
import type { StoredModuleManifest, UserInstalledModule } from '@/types/modules';

const logger = createLogger('ModulesAPI');

// ─── Catalogue (table `modules`) ──────────────────────────

/**
 * Récupérer tous les modules publiés du catalogue.
 */
export async function fetchModuleCatalog(): Promise<StoredModuleManifest[]> {
    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .order('download_count', { ascending: false });

    if (error) {
        logger.error('Failed to fetch module catalog:', error.message);
        throw new Error(`Failed to fetch module catalog: ${error.message}`);
    }
    logger.info(`Fetched ${data?.length ?? 0} modules from catalog`);
    return (data ?? []) as StoredModuleManifest[];
}

/**
 * Récupérer un module par son ID.
 */
export async function fetchModuleById(moduleId: string): Promise<StoredModuleManifest | null> {
    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // not found
        logger.error(`Failed to fetch module ${moduleId}:`, error.message);
        throw new Error(`Failed to fetch module ${moduleId}: ${error.message}`);
    }
    return data as StoredModuleManifest;
}

/**
 * Récupérer les modules par catégorie.
 */
export async function fetchModulesByCategory(category: string): Promise<StoredModuleManifest[]> {
    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .eq('category', category)
        .order('rating', { ascending: false });

    if (error) {
        logger.error(`Failed to fetch modules by category ${category}:`, error.message);
        throw new Error(`Failed to fetch modules by category: ${error.message}`);
    }
    return (data ?? []) as StoredModuleManifest[];
}

/**
 * Rechercher des modules par nom (ilike).
 */
export async function searchModules(query: string): Promise<StoredModuleManifest[]> {
    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .ilike('name', `%${query}%`)
        .order('download_count', { ascending: false })
        .limit(20);

    if (error) {
        logger.error('Failed to search modules:', error.message);
        throw new Error(`Failed to search modules: ${error.message}`);
    }
    return (data ?? []) as StoredModuleManifest[];
}

/**
 * Récupérer les modules core (natifs).
 */
export async function fetchCoreModules(): Promise<StoredModuleManifest[]> {
    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_core', true)
        .eq('is_published', true);

    if (error) {
        logger.error('Failed to fetch core modules:', error.message);
        throw new Error(`Failed to fetch core modules: ${error.message}`);
    }
    return (data ?? []) as StoredModuleManifest[];
}

/**
 * Récupérer les modules activés par défaut (hors core).
 */
export async function fetchDefaultEnabledModules(): Promise<StoredModuleManifest[]> {
    const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('default_enabled', true)
        .eq('is_core', false)
        .eq('is_published', true);

    if (error) {
        logger.error('Failed to fetch default modules:', error.message);
        throw new Error(`Failed to fetch default modules: ${error.message}`);
    }
    return (data ?? []) as StoredModuleManifest[];
}

// ─── Auto-install ─────────────────────────────────────────────

/**
 * Pré-installer les modules default_enabled pour l'utilisateur courant.
 * Appelle la fonction Supabase 'auto_install_default_modules'.
 * Retourne le nombre de modules installés, ou -1 si l'appel échoue.
 */
export async function autoInstallDefaultModules(): Promise<number> {
    const user = await getCurrentUser();
    if (!user) return -1;

    const { data, error } = await supabase
        .rpc('auto_install_default_modules', { p_user_id: user.id });

    if (error) {
        // Fallback client-side si la fonction RPC n'existe pas encore
        logger.warn('auto_install_default_modules RPC failed, using client fallback:', error.message);
        return autoInstallDefaultModulesClientFallback();
    }

    logger.info(`Auto-installed ${data} default modules`);
    return (data as number) ?? 0;
}

/**
 * Fallback client-side : installe les modules default_enabled manuellement.
 */
async function autoInstallDefaultModulesClientFallback(): Promise<number> {
    const user = await getCurrentUser();
    if (!user) return -1;

    // 1. Récupérer les modules default_enabled non-core
    const defaultModules = await fetchDefaultEnabledModules();
    if (defaultModules.length === 0) return 0;

    // 2. Récupérer les modules déjà installés
    const installedModules = await fetchUserModules();
    const installedIds = new Set(installedModules.map(um => um.module_id));

    // 3. Installer ceux qui manquent
    let count = 0;
    for (const mod of defaultModules) {
        if (!installedIds.has(mod.id)) {
            try {
                await installModule(mod.id, mod.permissions);
                count++;
            } catch {
                logger.warn(`Failed to auto-install ${mod.id}, skipping`);
            }
        }
    }

    logger.info(`Auto-installed ${count} modules (client fallback)`);
    return count;
}

// ─── Modules installés par l'utilisateur (table `user_modules`) ──

/**
 * Récupérer tous les modules installés par l'utilisateur courant.
 * Inclut les données du module via jointure.
 */
export async function fetchUserModules(): Promise<UserInstalledModule[]> {
    const { data, error } = await supabase
        .from('user_modules')
        .select(`
      *,
      module:modules(*)
    `)
        .order('installed_at', { ascending: false });

    if (error) {
        logger.error('Failed to fetch user modules:', error.message);
        throw new Error(`Failed to fetch user modules: ${error.message}`);
    }
    return (data ?? []) as UserInstalledModule[];
}

/**
 * Vérifier si un module est installé par l'utilisateur courant.
 */
export async function isModuleInstalled(moduleId: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    const { count, error } = await supabase
        .from('user_modules')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

    if (error) return false;
    return (count ?? 0) > 0;
}

/**
 * Installer un module pour l'utilisateur courant.
 */
export async function installModule(
    moduleId: string,
    grantedPermissions: string[],
): Promise<UserInstalledModule> {
    // 1. Vérifier que le module existe et est publié
    const module = await fetchModuleById(moduleId);
    if (!module) throw new Error(`Module "${moduleId}" not found`);
    if (!module.is_published) throw new Error(`Module "${moduleId}" is not published`);

    // 2. Récupérer l'utilisateur
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // 3. Insérer dans user_modules (upsert pour éviter le doublon)
    const { data, error } = await supabase
        .from('user_modules')
        .upsert(
            {
                user_id: user.id,
                module_id: moduleId,
                installed_version: module.version,
                is_active: true,
                granted_permissions: grantedPermissions,
            },
            { onConflict: 'user_id,module_id' },
        )
        .select(`
      *,
      module:modules(*)
    `)
        .single();

    if (error) {
        logger.error('Failed to install module:', error.message);
        throw new Error(`Failed to install module: ${error.message}`);
    }

    // 4. Incrémenter le compteur de téléchargements
    await supabase.rpc('increment_download_count', { module_id: moduleId }).match(() => {
        // Non-bloquant si la fonction RPC n'existe pas encore
    });

    logger.info(`Installed module ${moduleId} (v${module.version})`);
    return data as UserInstalledModule;
}

/**
 * Désinstaller un module.
 */
export async function uninstallModule(moduleId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Vérifier que ce n'est pas un module core
    const module = await fetchModuleById(moduleId);
    if (module?.is_core) {
        throw new Error(`Cannot uninstall core module "${moduleId}"`);
    }

    const { error } = await supabase
        .from('user_modules')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

    if (error) {
        logger.error('Failed to uninstall module:', error.message);
        throw new Error(`Failed to uninstall module: ${error.message}`);
    }

    logger.info(`Uninstalled module ${moduleId}`);
}

/**
 * Activer / désactiver un module installé.
 */
export async function setModuleActive(moduleId: string, active: boolean): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('user_modules')
        .update({ is_active: active })
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

    if (error) {
        logger.error('Failed to update module status:', error.message);
        throw new Error(`Failed to update module status: ${error.message}`);
    }

    logger.info(`Module ${moduleId} is now ${active ? 'active' : 'inactive'}`);
}

/**
 * Mettre à jour les permissions accordées pour un module.
 */
export async function updateModulePermissions(
    moduleId: string,
    permissions: string[],
): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('user_modules')
        .update({ granted_permissions: permissions })
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

    if (error) {
        logger.error('Failed to update module permissions:', error.message);
        throw new Error(`Failed to update module permissions: ${error.message}`);
    }
}

/**
 * Mettre à jour les paramètres utilisateur pour un module.
 */
export async function updateModuleSettings(
    moduleId: string,
    settings: Record<string, unknown>,
): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('user_modules')
        .update({ settings })
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

    if (error) {
        logger.error('Failed to update module settings:', error.message);
        throw new Error(`Failed to update module settings: ${error.message}`);
    }
}
