/**
 * Tests — Gamification Store
 *
 * Couvre toutes les actions du store Zustand Gamification :
 * - XP & niveaux
 * - Badges
 * - Missions
 * - Classements
 * - Boutique & skins
 * - Récompenses
 * - UI state + reset
 *
 * Phase 3 — DEV-032
 */

import { useGamificationStore } from "../gamification-store";

// ---------------------------------------------------------------------------
// Helpers & fixtures
// ---------------------------------------------------------------------------

function resetStore() {
    useGamificationStore.getState().resetGamification();
}

beforeEach(resetStore);

// ---------------------------------------------------------------------------
// XP & Niveaux
// ---------------------------------------------------------------------------

describe("XP & Niveaux", () => {
    it("should start with default level 1 and 0 XP", () => {
        const s = useGamificationStore.getState();
        expect(s.userLevel.level).toBe(1);
        expect(s.userLevel.currentXP).toBe(0);
        expect(s.userLevel.totalXP).toBe(0);
    });

    it("addXP should increase currentXP and totalXP", () => {
        const { addXP } = useGamificationStore.getState();
        addXP({ id: "xp1", action: "Send message", xp: 10, timestamp: "2025-01-01T00:00:00Z" });

        const s = useGamificationStore.getState();
        expect(s.userLevel.currentXP).toBe(10);
        expect(s.userLevel.totalXP).toBe(10);
        expect(s.xpHistory).toHaveLength(1);
        expect(s.xpHistory[0].action).toBe("Send message");
    });

    it("addXP accumulates multiple events", () => {
        const { addXP } = useGamificationStore.getState();
        addXP({ id: "xp1", action: "A", xp: 25, timestamp: "2025-01-01T00:00:00Z" });
        addXP({ id: "xp2", action: "B", xp: 50, timestamp: "2025-01-01T00:01:00Z" });

        const s = useGamificationStore.getState();
        expect(s.userLevel.currentXP).toBe(75);
        expect(s.userLevel.totalXP).toBe(75);
        expect(s.xpHistory).toHaveLength(2);
    });

    it("setUserLevel replaces userLevel", () => {
        const { setUserLevel } = useGamificationStore.getState();
        setUserLevel({
            level: 5,
            currentXP: 30,
            xpForNextLevel: 200,
            totalXP: 930,
            title: "Expert",
        });

        const s = useGamificationStore.getState();
        expect(s.userLevel.level).toBe(5);
        expect(s.userLevel.title).toBe("Expert");
    });
});

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

const makeBadge = (overrides = {}) => ({
    id: "b1",
    name: "First Steps",
    description: "Send your first message",
    icon: "🌟",
    rarity: "common" as const,
    category: "social" as const,
    progress: 0,
    unlocked: false,
    requirement: "Send 1 message",
    ...overrides,
});

describe("Badges", () => {
    it("setBadges sets the badge list", () => {
        const { setBadges } = useGamificationStore.getState();
        setBadges([makeBadge(), makeBadge({ id: "b2", name: "Chatter" })]);

        expect(useGamificationStore.getState().badges).toHaveLength(2);
    });

    it("unlockBadge marks badge as unlocked with timestamp", () => {
        const { setBadges, unlockBadge } = useGamificationStore.getState();
        setBadges([makeBadge()]);
        unlockBadge("b1");

        const b = useGamificationStore.getState().badges[0];
        expect(b.unlocked).toBe(true);
        expect(b.progress).toBe(100);
        expect(b.unlockedAt).toBeDefined();
    });

    it("updateBadgeProgress clamps at 100", () => {
        const { setBadges, updateBadgeProgress } = useGamificationStore.getState();
        setBadges([makeBadge()]);
        updateBadgeProgress("b1", 150);

        expect(useGamificationStore.getState().badges[0].progress).toBe(100);
    });

    it("updateBadgeProgress sets intermediate progress", () => {
        const { setBadges, updateBadgeProgress } = useGamificationStore.getState();
        setBadges([makeBadge()]);
        updateBadgeProgress("b1", 42);

        expect(useGamificationStore.getState().badges[0].progress).toBe(42);
    });
});

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

const makeMission = (overrides = {}) => ({
    id: "m1",
    title: "Daily Login",
    description: "Log in today",
    frequency: "daily" as const,
    status: "available" as const,
    progress: 0,
    target: 1,
    current: 0,
    reward: { type: "xp" as const, amount: 50, label: "+50 XP" },
    ...overrides,
});

describe("Missions", () => {
    it("setMissions sets the missions list", () => {
        const { setMissions } = useGamificationStore.getState();
        setMissions([makeMission(), makeMission({ id: "m2" })]);

        expect(useGamificationStore.getState().missions).toHaveLength(2);
    });

    it("updateMissionProgress updates current and progress %", () => {
        const { setMissions, updateMissionProgress } = useGamificationStore.getState();
        setMissions([makeMission({ target: 10, current: 0 })]);
        updateMissionProgress("m1", 7);

        const m = useGamificationStore.getState().missions[0];
        expect(m.current).toBe(7);
        expect(m.progress).toBe(70);
    });

    it("updateMissionProgress auto-completes when target reached", () => {
        const { setMissions, updateMissionProgress } = useGamificationStore.getState();
        setMissions([makeMission({ target: 5, current: 0 })]);
        updateMissionProgress("m1", 5);

        const m = useGamificationStore.getState().missions[0];
        expect(m.status).toBe("completed");
        expect(m.completedAt).toBeDefined();
        expect(m.progress).toBe(100);
    });

    it("updateMissionProgress clamps at target", () => {
        const { setMissions, updateMissionProgress } = useGamificationStore.getState();
        setMissions([makeMission({ target: 3 })]);
        updateMissionProgress("m1", 100);

        expect(useGamificationStore.getState().missions[0].current).toBe(3);
    });

    it("updateMissionStatus changes mission status", () => {
        const { setMissions, updateMissionStatus } = useGamificationStore.getState();
        setMissions([makeMission()]);
        updateMissionStatus("m1", "in-progress");

        expect(useGamificationStore.getState().missions[0].status).toBe("in-progress");
    });

    it("claimMissionReward changes completed → claimed", () => {
        const { setMissions, claimMissionReward } = useGamificationStore.getState();
        setMissions([makeMission({ status: "completed" })]);
        claimMissionReward("m1");

        expect(useGamificationStore.getState().missions[0].status).toBe("claimed");
    });

    it("claimMissionReward does nothing if not completed", () => {
        const { setMissions, claimMissionReward } = useGamificationStore.getState();
        setMissions([makeMission({ status: "available" })]);
        claimMissionReward("m1");

        expect(useGamificationStore.getState().missions[0].status).toBe("available");
    });
});

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

describe("Leaderboard", () => {
    const sampleLeaderboard = {
        scope: "global" as const,
        period: "weekly" as const,
        entries: [
            {
                rank: 1,
                userId: "u1",
                username: "Alice",
                xp: 5000,
                level: 10,
                tier: "gold" as const,
                isCurrentUser: false,
            },
        ],
        lastUpdated: "2025-01-01T00:00:00Z",
    };

    it("setLeaderboard sets the leaderboard", () => {
        const { setLeaderboard } = useGamificationStore.getState();
        setLeaderboard(sampleLeaderboard);

        const s = useGamificationStore.getState();
        expect(s.leaderboard).not.toBeNull();
        expect(s.leaderboard!.entries).toHaveLength(1);
    });

    it("setLeaderboard can be set to null", () => {
        const { setLeaderboard } = useGamificationStore.getState();
        setLeaderboard(sampleLeaderboard);
        setLeaderboard(null);

        expect(useGamificationStore.getState().leaderboard).toBeNull();
    });

    it("setLeaderboardFilter updates scope and period", () => {
        const { setLeaderboard, setLeaderboardFilter } = useGamificationStore.getState();
        setLeaderboard(sampleLeaderboard);
        setLeaderboardFilter("friends", "monthly");

        const lb = useGamificationStore.getState().leaderboard!;
        expect(lb.scope).toBe("friends");
        expect(lb.period).toBe("monthly");
    });

    it("setLeaderboardFilter does nothing if leaderboard is null", () => {
        const { setLeaderboardFilter } = useGamificationStore.getState();
        setLeaderboardFilter("friends", "daily");

        expect(useGamificationStore.getState().leaderboard).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Shop & Skins
// ---------------------------------------------------------------------------

const makeSkin = (overrides = {}) => ({
    id: "s1",
    name: "Cool Hair",
    description: "A cool hairstyle",
    preview: "https://example.com/skin.png",
    category: "hair" as const,
    rarity: "rare" as const,
    price: 100,
    currency: "coins" as const,
    owned: false,
    equipped: false,
    releasedAt: "2025-01-01T00:00:00Z",
    ...overrides,
});

describe("Shop & Skins", () => {
    it("setShopSections sets shop sections", () => {
        const { setShopSections } = useGamificationStore.getState();
        setShopSections([{ id: "sec1", title: "Hair", items: [makeSkin()] }]);

        expect(useGamificationStore.getState().shopSections).toHaveLength(1);
    });

    it("purchaseSkin marks a skin as owned", () => {
        const { setShopSections, purchaseSkin } = useGamificationStore.getState();
        setShopSections([{ id: "sec1", title: "Hair", items: [makeSkin()] }]);
        purchaseSkin("s1");

        const item = useGamificationStore.getState().shopSections[0].items[0];
        expect(item.owned).toBe(true);
    });

    it("equipSkin equips a skin and updates equippedSkins map", () => {
        const { setShopSections, equipSkin } = useGamificationStore.getState();
        setShopSections([
            { id: "sec1", title: "Hair", items: [makeSkin({ owned: true })] },
        ]);
        equipSkin("hair", "s1");

        const s = useGamificationStore.getState();
        expect(s.equippedSkins.hair).toBe("s1");
        expect(s.shopSections[0].items[0].equipped).toBe(true);
    });

    it("equipSkin with null unequips", () => {
        const { setShopSections, equipSkin } = useGamificationStore.getState();
        setShopSections([
            { id: "sec1", title: "Hair", items: [makeSkin({ owned: true, equipped: true })] },
        ]);
        equipSkin("hair", "s1");
        equipSkin("hair", null);

        expect(useGamificationStore.getState().equippedSkins.hair).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------

const makeReward = (overrides = {}) => ({
    id: "r1",
    type: "xp" as const,
    label: "+100 XP",
    amount: 100,
    source: "Mission",
    claimedAt: "2025-01-01T00:00:00Z",
    ...overrides,
});

describe("Rewards", () => {
    it("addReward prepends to history", () => {
        const { addReward } = useGamificationStore.getState();
        addReward(makeReward());
        addReward(makeReward({ id: "r2", label: "+50 XP" }));

        const h = useGamificationStore.getState().rewardHistory;
        expect(h).toHaveLength(2);
        expect(h[0].id).toBe("r2"); // most recent first
    });

    it("setRewardHistory replaces history", () => {
        const { addReward, setRewardHistory } = useGamificationStore.getState();
        addReward(makeReward());
        setRewardHistory([makeReward({ id: "r5" })]);

        const h = useGamificationStore.getState().rewardHistory;
        expect(h).toHaveLength(1);
        expect(h[0].id).toBe("r5");
    });
});

// ---------------------------------------------------------------------------
// UI State
// ---------------------------------------------------------------------------

describe("UI State", () => {
    it("setLoading toggles loading", () => {
        const { setLoading } = useGamificationStore.getState();
        setLoading(true);
        expect(useGamificationStore.getState().loading).toBe(true);
        setLoading(false);
        expect(useGamificationStore.getState().loading).toBe(false);
    });

    it("setError sets and clears error", () => {
        const { setError } = useGamificationStore.getState();
        setError("Something went wrong");
        expect(useGamificationStore.getState().error).toBe("Something went wrong");
        setError(null);
        expect(useGamificationStore.getState().error).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

describe("Reset", () => {
    it("resetGamification restores initial state", () => {
        const store = useGamificationStore.getState();

        // Mutate various parts of state
        store.addXP({ id: "xp1", action: "test", xp: 999, timestamp: "2025-01-01T00:00:00Z" });
        store.setBadges([makeBadge()]);
        store.setMissions([makeMission()]);
        store.setLoading(true);
        store.setError("err");

        // Reset
        store.resetGamification();

        const s = useGamificationStore.getState();
        expect(s.userLevel.level).toBe(1);
        expect(s.userLevel.currentXP).toBe(0);
        expect(s.badges).toHaveLength(0);
        expect(s.missions).toHaveLength(0);
        expect(s.loading).toBe(false);
        expect(s.error).toBeNull();
    });
});
