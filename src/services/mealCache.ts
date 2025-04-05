import { AiSuggestion } from '../types';

interface CachedMeal extends AiSuggestion {
  timestamp: number;
}

interface MealHistory {
  description: string;
  result: AiSuggestion;
  timestamp: number;
}

class MealCacheService {
  private static CACHE_KEY = 'meal_cache';
  private static HISTORY_KEY = 'meal_history';
  private static MAX_HISTORY_ITEMS = 50;
  private static CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  private cache: Map<string, CachedMeal>;
  private history: MealHistory[];

  constructor() {
    this.loadCache();
    this.loadHistory();
  }

  private loadCache() {
    try {
      const cached = localStorage.getItem(MealCacheService.CACHE_KEY);
      const parsedCache = cached ? JSON.parse(cached) : {};
      this.cache = new Map(Object.entries(parsedCache));
      
      // Clean expired items
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > MealCacheService.CACHE_EXPIRY) {
          this.cache.delete(key);
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
      this.cache = new Map();
    }
  }

  private loadHistory() {
    try {
      const historyData = localStorage.getItem(MealCacheService.HISTORY_KEY);
      this.history = historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      this.history = [];
    }
  }

  private saveCache() {
    try {
      const cacheObj = Object.fromEntries(this.cache.entries());
      localStorage.setItem(MealCacheService.CACHE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(MealCacheService.HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  getCachedMeal(description: string): AiSuggestion | null {
    const normalizedDesc = description.toLowerCase().trim();
    const cached = this.cache.get(normalizedDesc);
    
    if (cached && Date.now() - cached.timestamp <= MealCacheService.CACHE_EXPIRY) {
      return cached;
    }
    
    return null;
  }

  cacheMeal(description: string, result: AiSuggestion) {
    const normalizedDesc = description.toLowerCase().trim();
    const cachedMeal: CachedMeal = {
      ...result,
      timestamp: Date.now()
    };
    
    this.cache.set(normalizedDesc, cachedMeal);
    this.saveCache();
  }

  addToHistory(description: string, result: AiSuggestion) {
    const historyItem: MealHistory = {
      description,
      result,
      timestamp: Date.now()
    };

    this.history.unshift(historyItem);
    
    // Limit history size
    if (this.history.length > MealCacheService.MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, MealCacheService.MAX_HISTORY_ITEMS);
    }
    
    this.saveHistory();
  }

  getHistory(): MealHistory[] {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  clearCache() {
    this.cache.clear();
    this.saveCache();
  }
}

export const mealCacheService = new MealCacheService(); 