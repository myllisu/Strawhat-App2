import { AppState, FarmPlot, HarvestedFruit, MonitoredItem, ExtraMinuteGrant, DailyUsageRecord, ContentCategoryRule, UrlTestRecord } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';

const STORAGE_KEY = 'STRAWHAT_APP_DATA_V1';

export const DEFAULT_CONTENT_CATEGORIES: ContentCategoryRule[] = [
  {
    id: 'cat_gambling',
    name: 'Jogos de Azar & Apostas',
    description: 'Bloqueia cassinos, casas de apostas (bets), poker e jogos de azar.',
    icon: '🎰',
    active: true,
    defaultKeywords: ['aposta', 'bet', 'cassino', 'casino', 'poker', 'blaze', 'tigrinho', 'jackpot'],
  },
  {
    id: 'cat_adult',
    name: 'Conteúdo Adulto',
    description: 'Bloqueia sites pornográficos, materiais NSFW e conteúdo impróprio para menores.',
    icon: '🔞',
    active: true,
    defaultKeywords: ['porn', 'xx', 'adulto', 'nsfw', 'xvideos', 'pornhub', 'onlyfans'],
  },
  {
    id: 'cat_gore',
    name: 'Gore & Violência',
    description: 'Bloqueia fóruns e mídias contendo violência explícita, gore e automutilação.',
    icon: '⚠️',
    active: true,
    defaultKeywords: ['gore', 'mutilacao', 'sangue', 'execucao', 'shock'],
  },
  {
    id: 'cat_doomscroll',
    name: 'Doomscrolling & Vício em Shorts',
    description: 'Restringe plataformas focadas em rolagem infinita compulsiva.',
    icon: '📱',
    active: false,
    defaultKeywords: ['tiktok', 'reels', 'shorts', 'doomscroll'],
  },
];

export function getInitialWeeklyHistory(): Record<string, DailyUsageRecord> {
  const result: Record<string, DailyUsageRecord> = {};
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + diffToMonday);

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const isToday = d.toDateString() === today.toDateString();
    const isPast = d < today && !isToday;

    let timeUsed = 0;
    let limit = isWeekend ? 90 : 60;
    let hasRealData = isToday || isPast;

    if (isToday) {
      timeUsed = 70;
      limit = 75;
    } else if (isPast) {
      if (dayOfWeek === 1) { timeUsed = 45; limit = 60; }
      else if (dayOfWeek === 2) { timeUsed = 50; limit = 60; }
      else if (dayOfWeek === 3) { timeUsed = 65; limit = 60; }
      else if (dayOfWeek === 4) { timeUsed = 40; limit = 60; }
      else if (dayOfWeek === 5) { timeUsed = 80; limit = 90; }
    } else {
      hasRealData = false;
    }

    result[dateStr] = {
      date: dateStr,
      dayOfWeek,
      dayName: dayNames[dayOfWeek],
      timeUsedMinutes: timeUsed,
      dailyLimitMinutes: limit,
      hasRealData,
      appsBreakdown: hasRealData ? [
        { name: 'Instagram', minutes: Math.round(timeUsed * 0.5) },
        { name: 'TikTok', minutes: Math.round(timeUsed * 0.3) },
        { name: 'YouTube', minutes: Math.round(timeUsed * 0.2) },
      ] : [],
    };
  }

  return result;
}

export const INITIAL_STATE: AppState = {
  version: '1.0',
  tutorialCompleted: false,
  streakDays: 5,
  coins: 150,
  tickets: 2,
  activeThemeId: 'morango',
  themeMode: 'light',
  unlockedThemeIds: ['morango'],
  plots: [
    {
      id: 1,
      unlocked: true,
      priceCoins: 0,
      plant: {
        stage: 'fruto_maduro',
        plantedAt: Date.now() - 36 * 3600 * 1000,
        accumulatedHours: 36,
        plantName: 'Morango Doce',
        icon: '🍓',
      },
    },
    {
      id: 2,
      unlocked: false,
      priceCoins: 100,
    },
    {
      id: 3,
      unlocked: false,
      priceCoins: 400,
    },
    {
      id: 4,
      unlocked: false,
      priceCoins: 900,
    },
  ],
  inventory: [
    { id: 'f1', name: 'Morango Comum', rarity: 'comum', coinValue: 10, harvestedAt: Date.now() - 3600000, icon: '🍓' },
    { id: 'f2', name: 'Morango Grande', rarity: 'grande', coinValue: 20, harvestedAt: Date.now() - 1800000, icon: '🍓' },
  ],
  extraMinutesList: [
    {
      id: 'em1',
      minutes: 10,
      source: 'Lootbox de Recompensa',
      obtainedAt: Date.now() - 86400000,
      expiresAt: Date.now() + 6 * 86400000, // 6 days remaining
      used: false,
    },
  ],
  monitoredItems: GAME_CONFIG.DEFAULT_MONITORED_ITEMS.map((item) => ({
    ...item,
    baseWeekendLimit: item.weekendLimit,
    weekendBoostEnabled: false,
  })),
  stats: [],
  userStats: {
    streakDays: 5,
    maxStreakDays: 7,
    totalFocusHours: 42,
    totalHarvestsCount: 8,
    totalFruitsSold: 6,
    totalCoinsEarned: 180,
    totalCoinsSpent: 30,
    unlockedPlotsCount: 1,
    violationsCount: 1,
  },
  salesHistory: [
    { id: 's1', fruitName: 'Morango Comum', rarity: 'comum', quantity: 3, totalCoins: 30, timestamp: Date.now() - 86400000 },
  ],
  violationsHistory: [],
  purchaseHistory: [],
  // Steps 2, 4, 5, 6 initial values
  dailyUsageHistory: getInitialWeeklyHistory(),
  customKeywords: ['aposta', 'casino', 'gore'],
  contentCategories: DEFAULT_CONTENT_CATEGORIES,
  urlTestHistory: [
    {
      id: 'ut1',
      url: 'https://cassino-online-exemplo.com/bets',
      status: 'blocked',
      matchedRule: 'Palavra-chave: aposta',
      timestamp: Date.now() - 3600000,
    },
  ],
  blockedAccessCount: 3,
  claimedStreakMilestones: [3], // 3 days milestone claimed
};

export class StorageService {
  public static loadState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        StorageService.saveState(INITIAL_STATE);
        return INITIAL_STATE;
      }
      const data: AppState = JSON.parse(raw);
      // Basic fallback check
      if (!data.version || !data.plots) {
        StorageService.saveState(INITIAL_STATE);
        return INITIAL_STATE;
      }

      // Merge defaults for missing properties
      const merged: AppState = {
        ...INITIAL_STATE,
        ...data,
        monitoredItems: (data.monitoredItems || INITIAL_STATE.monitoredItems).map((item) => ({
          ...item,
          baseWeekendLimit: item.baseWeekendLimit ?? item.weekendLimit,
          weekendBoostEnabled: item.weekendBoostEnabled ?? false,
        })),
        dailyUsageHistory: data.dailyUsageHistory || INITIAL_STATE.dailyUsageHistory,
        customKeywords: data.customKeywords || INITIAL_STATE.customKeywords,
        contentCategories: data.contentCategories || INITIAL_STATE.contentCategories,
        urlTestHistory: data.urlTestHistory || INITIAL_STATE.urlTestHistory,
        blockedAccessCount: data.blockedAccessCount ?? INITIAL_STATE.blockedAccessCount,
        claimedStreakMilestones: data.claimedStreakMilestones || INITIAL_STATE.claimedStreakMilestones,
      };

      return merged;
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      return INITIAL_STATE;
    }
  }

  public static saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  public static clearAllData(): AppState {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = { ...INITIAL_STATE, tutorialCompleted: false };
    StorageService.saveState(fresh);
    return fresh;
  }

  public static resetFarmProgress(currentState: AppState): AppState {
    const resetPlots: FarmPlot[] = [
      {
        id: 1,
        unlocked: true,
        priceCoins: 0,
        plant: {
          stage: 'broto',
          plantedAt: Date.now(),
          accumulatedHours: 6,
          plantName: 'Morango Doce',
          icon: '🌱',
        },
      },
      { id: 2, unlocked: false, priceCoins: 100 },
      { id: 3, unlocked: false, priceCoins: 400 },
      { id: 4, unlocked: false, priceCoins: 900 },
    ];

    const updated: AppState = {
      ...currentState,
      plots: resetPlots,
      streakDays: 0,
      claimedStreakMilestones: [], // Reset claimed milestones on streak reset
      userStats: {
        ...currentState.userStats,
        streakDays: 0,
      },
    };
    StorageService.saveState(updated);
    return updated;
  }

  public static exportJSON(state: AppState): string {
    return JSON.stringify(state, null, 2);
  }

  public static importJSON(jsonString: string): AppState | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.version && Array.isArray(parsed.plots)) {
        StorageService.saveState(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Invalid JSON import format:', e);
    }
    return null;
  }
}

