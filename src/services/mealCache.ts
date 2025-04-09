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
  private static CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  private cache: Map<string, CachedMeal> = new Map();
  private history: MealHistory[] = [];

  constructor() {
    this.loadCache();
    this.loadHistory();
  }

  private loadCache() {
    try {
      const cached = localStorage.getItem(MealCacheService.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }

  private loadHistory() {
    try {
      const history = localStorage.getItem(MealCacheService.HISTORY_KEY);
      if (history) {
        this.history = JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  private saveCache() {
    try {
      const serialized = JSON.stringify(Object.fromEntries(this.cache));
      localStorage.setItem(MealCacheService.CACHE_KEY, serialized);
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

  cacheMeal(description: string, meal: CachedMeal) {
    const normalizedDesc = description.toLowerCase().trim();
    this.cache.set(normalizedDesc, meal);
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