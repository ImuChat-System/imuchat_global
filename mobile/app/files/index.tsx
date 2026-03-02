/**
 * Files Index (Drive Browser) — DEV-020
 *
 * Écran principal du drive : navigation dossiers, grille/liste de fichiers,
 * recherche, filtres, tri, breadcrumbs, sélection multiple, FAB upload.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useI18n } from '@/providers/I18nProvider';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { useToast } from '@/providers/ToastProvider';
import { useFiles } from '@/hooks/useFiles';

// ─── Category filter chips ──────────────────────────────────

const CATEGORY_FILTERS = [
    { key: 'all', label: 'all', icon: 'apps-outline' },
    { key: 'image', label: 'images', icon: 'image-outline' },
    { key: 'video', label: 'videos', icon: 'videocam-outline' },
    { key: 'audio', label: 'audio', icon: 'musical-notes-outline' },
    { key: 'document', label: 'documents', icon: 'document-text-outline' },
    { key: 'pdf', label: 'pdf', icon: 'reader-outline' },
    { key: 'archive', label: 'archives', icon: 'archive-outline' },
] as const;

export default function FilesIndexScreen() {
    const { t } = useI18n();
    const colors = useColors();
    const spacing = useSpacing();
    const router = useRouter();
    const { showToast } = useToast();
    const {
        files,
        folders,
        breadcrumbs,
        filteredFiles,
        recentFiles,
        favoriteFiles,
        fileCounts,
        isLoading,
        isInitialized,
        searchQuery,
        searchResults,
        viewMode,
        sortBy,
        filterCategory,
        selectedFileIds,
        hasSelection,
        selectionCount,
        usageFormatted,
        usagePercentage,
        searchFiles,
        navigateToFolder,
        openFile,
        moveToTrash,
        toggleFavorite,
        toggleSelection,
        clearSelection,
        setViewMode,
        setSortBy,
        setFilterCategory,
        createFolder,
        formatFileSize,
        getFileIcon,
        getFileColor,
    } = useFiles();

    const [showSearch, setShowSearch] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);

    // ─── Handlers ────────────────────────────────────────────

    const handleFilePress = useCallback((fileId: string) => {
        if (hasSelection) {
            toggleSelection(fileId);
        } else {
            openFile(fileId);
            router.push({ pathname: '/files/preview', params: { id: fileId } });
        }
    }, [hasSelection, toggleSelection, openFile, router]);

    const handleFileLongPress = useCallback((fileId: string) => {
        toggleSelection(fileId);
    }, [toggleSelection]);

    const handleFolderPress = useCallback((folderId: string) => {
        navigateToFolder(folderId);
    }, [navigateToFolder]);

    const handleBreadcrumbPress = useCallback((folderId: string | null) => {
        navigateToFolder(folderId);
    }, [navigateToFolder]);

    const handleCreateFolder = useCallback(async () => {
        setShowCreateMenu(false);
        const folder = await createFolder(t('files.newFolder'));
        showToast(t('files.folderCreated'), 'success');
    }, [createFolder, showToast, t]);

    const handleTrashSelected = useCallback(async () => {
        for (const id of selectedFileIds) {
            await moveToTrash(id);
        }
        clearSelection();
        showToast(t('files.movedToTrash'), 'success');
    }, [selectedFileIds, moveToTrash, clearSelection, showToast, t]);

    // ─── Display files ───────────────────────────────────────

    const displayFiles = showSearch && searchQuery ? searchResults : filteredFiles;

    // ─── Styles ──────────────────────────────────────────────

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.xl + 20,
            paddingBottom: spacing.sm,
        },
        headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
        headerActions: { flexDirection: 'row', gap: spacing.sm },
        headerBtn: { padding: spacing.xs },
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginHorizontal: spacing.md,
            marginBottom: spacing.sm,
            paddingHorizontal: spacing.sm,
        },
        searchInput: { flex: 1, padding: spacing.sm, color: colors.text, fontSize: 15 },
        breadcrumbRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xs,
        },
        breadcrumb: { flexDirection: 'row', alignItems: 'center' },
        breadcrumbText: { fontSize: 13, color: colors.primary },
        breadcrumbSep: { fontSize: 13, color: colors.textSecondary, marginHorizontal: 4 },
        breadcrumbActive: { fontSize: 13, fontWeight: '600', color: colors.text },
        filtersRow: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.sm,
        },
        chip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: colors.surface,
            marginRight: spacing.xs,
            gap: 4,
        },
        chipActive: { backgroundColor: colors.primary },
        chipText: { fontSize: 12, color: colors.textSecondary },
        chipTextActive: { fontSize: 12, color: '#FFF', fontWeight: '600' },
        toolbarRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xs,
        },
        toolbarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
        countText: { fontSize: 12, color: colors.textSecondary },
        selectionBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
        },
        selectionText: { color: '#FFF', fontWeight: '600' },
        selectionActions: { flexDirection: 'row', gap: spacing.md },
        section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
        sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
        foldersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
        folderCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing.sm,
            gap: spacing.sm,
            width: '48%',
        },
        folderIcon: {
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        folderName: { fontSize: 13, fontWeight: '500', color: colors.text, flex: 1 },
        folderCount: { fontSize: 11, color: colors.textSecondary },
        // Grid view
        gridItem: {
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing.sm,
            margin: spacing.xs,
            alignItems: 'center',
            minHeight: 120,
        },
        gridItemSelected: { borderWidth: 2, borderColor: colors.primary },
        gridIcon: {
            width: 48,
            height: 48,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.xs,
        },
        gridName: { fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '500' },
        gridSize: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
        gridFav: { position: 'absolute', top: 6, right: 6 },
        // List view
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 10,
            padding: spacing.sm,
            marginHorizontal: spacing.md,
            marginBottom: spacing.xs,
            gap: spacing.sm,
        },
        listItemSelected: { borderWidth: 2, borderColor: colors.primary },
        listIcon: {
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        listInfo: { flex: 1 },
        listName: { fontSize: 14, fontWeight: '500', color: colors.text },
        listMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
        empty: { alignItems: 'center', paddingTop: 60 },
        emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.md },
        fab: {
            position: 'absolute',
            bottom: 30,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
        },
        fabMenu: {
            position: 'absolute',
            bottom: 100,
            right: 20,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing.xs,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        fabMenuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.sm,
            gap: spacing.sm,
        },
        fabMenuText: { fontSize: 14, color: colors.text },
        usageBar: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            gap: spacing.sm,
        },
        usageTrack: {
            flex: 1,
            height: 4,
            backgroundColor: colors.surface,
            borderRadius: 2,
        },
        usageFill: {
            height: 4,
            backgroundColor: colors.primary,
            borderRadius: 2,
        },
        usageText: { fontSize: 11, color: colors.textSecondary },
    }), [colors, spacing]);

    // ─── Render Helpers ──────────────────────────────────────

    const renderBreadcrumbs = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.breadcrumbRow}>
            {breadcrumbs.map((crumb, idx) => (
                <View key={crumb.id || 'root'} style={styles.breadcrumb}>
                    {idx > 0 && <Text style={styles.breadcrumbSep}>/</Text>}
                    {idx === breadcrumbs.length - 1 ? (
                        <Text style={styles.breadcrumbActive}>{crumb.name}</Text>
                    ) : (
                        <Pressable onPress={() => handleBreadcrumbPress(crumb.id)}>
                            <Text style={styles.breadcrumbText}>{crumb.name}</Text>
                        </Pressable>
                    )}
                </View>
            ))}
        </ScrollView>
    );

    const renderGridItem = ({ item }: { item: typeof displayFiles[0] }) => {
        const isSelected = selectedFileIds.includes(item.id);
        return (
            <Pressable
                style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                onPress={() => handleFilePress(item.id)}
                onLongPress={() => handleFileLongPress(item.id)}
            >
                <View style={[styles.gridIcon, { backgroundColor: getFileColor(item.category) + '20' }]}>
                    <Ionicons name={getFileIcon(item.category) as any} size={24} color={getFileColor(item.category)} />
                </View>
                <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.gridSize}>{formatFileSize(item.size)}</Text>
                {item.is_favorite && (
                    <View style={styles.gridFav}>
                        <Ionicons name="star" size={14} color="#FFB300" />
                    </View>
                )}
            </Pressable>
        );
    };

    const renderListItem = ({ item }: { item: typeof displayFiles[0] }) => {
        const isSelected = selectedFileIds.includes(item.id);
        const date = new Date(item.updated_at).toLocaleDateString();
        return (
            <Pressable
                style={[styles.listItem, isSelected && styles.listItemSelected]}
                onPress={() => handleFilePress(item.id)}
                onLongPress={() => handleFileLongPress(item.id)}
            >
                <View style={[styles.listIcon, { backgroundColor: getFileColor(item.category) + '20' }]}>
                    <Ionicons name={getFileIcon(item.category) as any} size={22} color={getFileColor(item.category)} />
                </View>
                <View style={styles.listInfo}>
                    <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.listMeta}>{formatFileSize(item.size)} · {date}</Text>
                </View>
                {item.is_favorite && <Ionicons name="star" size={16} color="#FFB300" />}
                <Pressable onPress={() => toggleFavorite(item.id)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
                </Pressable>
            </Pressable>
        );
    };

    // ─── Render ──────────────────────────────────────────────

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].name : t('files.myDrive')}
                </Text>
                <View style={styles.headerActions}>
                    <Pressable style={styles.headerBtn} onPress={() => setShowSearch(!showSearch)}>
                        <Ionicons name={showSearch ? 'close' : 'search'} size={22} color={colors.text} />
                    </Pressable>
                    <Pressable style={styles.headerBtn} onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={22} color={colors.text} />
                    </Pressable>
                    <Pressable style={styles.headerBtn} onPress={() => router.push('/files/trash')}>
                        <Ionicons name="trash-outline" size={22} color={colors.text} />
                    </Pressable>
                    <Pressable style={styles.headerBtn} onPress={() => router.push('/files/storage')}>
                        <Ionicons name="pie-chart-outline" size={22} color={colors.text} />
                    </Pressable>
                </View>
            </View>

            {/* Search */}
            {showSearch && (
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('files.searchPlaceholder')}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={searchFiles}
                        autoFocus
                    />
                </View>
            )}

            {/* Selection bar */}
            {hasSelection && (
                <View style={styles.selectionBar}>
                    <Pressable onPress={clearSelection}>
                        <Text style={styles.selectionText}>{selectionCount} {t('files.selected')}</Text>
                    </Pressable>
                    <View style={styles.selectionActions}>
                        <Pressable onPress={handleTrashSelected}>
                            <Ionicons name="trash-outline" size={22} color="#FFF" />
                        </Pressable>
                        <Pressable onPress={() => router.push('/files/share')}>
                            <Ionicons name="share-outline" size={22} color="#FFF" />
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && renderBreadcrumbs()}

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={{ paddingRight: spacing.md }}>
                {CATEGORY_FILTERS.map(({ key, label, icon }) => {
                    const active = filterCategory === key;
                    const count = fileCounts[key] || 0;
                    return (
                        <Pressable
                            key={key}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => setFilterCategory(key as any)}
                        >
                            <Ionicons name={icon as any} size={14} color={active ? '#FFF' : colors.textSecondary} />
                            <Text style={active ? styles.chipTextActive : styles.chipText}>
                                {t(`files.filter_${label}`)} {count > 0 ? `(${count})` : ''}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* Toolbar */}
            <View style={styles.toolbarRow}>
                <View style={styles.toolbarLeft}>
                    <Text style={styles.countText}>{displayFiles.length} {t('files.items')}</Text>
                </View>
                <Pressable onPress={() => {
                    const options: FileSortOption[] = ['updated', 'name', 'size', 'type', 'created'];
                    const nextIdx = (options.indexOf(sortBy) + 1) % options.length;
                    setSortBy(options[nextIdx]);
                }}>
                    <Ionicons name="swap-vertical" size={18} color={colors.textSecondary} />
                </Pressable>
            </View>

            {/* Storage usage bar */}
            <View style={styles.usageBar}>
                <View style={styles.usageTrack}>
                    <View style={[styles.usageFill, { width: `${Math.min(usagePercentage, 100)}%` }]} />
                </View>
                <Text style={styles.usageText}>{usageFormatted}</Text>
            </View>

            {/* Folders */}
            {folders.length > 0 && !showSearch && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('files.folders')}</Text>
                    <View style={styles.foldersRow}>
                        {folders.map(folder => (
                            <Pressable
                                key={folder.id}
                                style={styles.folderCard}
                                onPress={() => handleFolderPress(folder.id)}
                            >
                                <View style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}>
                                    <Ionicons name={folder.icon as any} size={20} color={folder.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.folderName} numberOfLines={1}>{folder.name}</Text>
                                    <Text style={styles.folderCount}>{folder.file_count} {t('files.items')}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}

            {/* Files Grid / List */}
            {displayFiles.length > 0 ? (
                viewMode === 'grid' ? (
                    <FlatList
                        data={displayFiles}
                        keyExtractor={item => item.id}
                        renderItem={renderGridItem}
                        numColumns={2}
                        contentContainerStyle={{ paddingHorizontal: spacing.sm, paddingBottom: 100 }}
                    />
                ) : (
                    <FlatList
                        data={displayFiles}
                        keyExtractor={item => item.id}
                        renderItem={renderListItem}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )
            ) : (
                <View style={styles.empty}>
                    <Ionicons name="cloud-outline" size={64} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>
                        {isLoading ? t('files.loading') : t('files.emptyFolder')}
                    </Text>
                </View>
            )}

            {/* FAB */}
            <Pressable style={styles.fab} onPress={() => setShowCreateMenu(!showCreateMenu)}>
                <Ionicons name={showCreateMenu ? 'close' : 'add'} size={28} color="#FFF" />
            </Pressable>

            {showCreateMenu && (
                <View style={styles.fabMenu}>
                    <Pressable style={styles.fabMenuItem} onPress={handleCreateFolder}>
                        <Ionicons name="folder-outline" size={20} color={colors.primary} />
                        <Text style={styles.fabMenuText}>{t('files.newFolder')}</Text>
                    </Pressable>
                    <Pressable style={styles.fabMenuItem} onPress={() => { setShowCreateMenu(false); showToast(t('files.uploadComingSoon'), 'info'); }}>
                        <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                        <Text style={styles.fabMenuText}>{t('files.uploadFile')}</Text>
                    </Pressable>
                    <Pressable style={styles.fabMenuItem} onPress={() => { setShowCreateMenu(false); showToast(t('files.cameraComingSoon'), 'info'); }}>
                        <Ionicons name="camera-outline" size={20} color={colors.primary} />
                        <Text style={styles.fabMenuText}>{t('files.takePhoto')}</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

type FileSortOption = 'name' | 'updated' | 'created' | 'size' | 'type';
