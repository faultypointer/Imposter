/**
 * Custom hook for managing custom word categories
 * Uses expo-sqlite/kv-store for persistent storage
 */

import type { Category } from '@/data/game-data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'imposter_custom_categories';

export function useCustomCategories() {
    const [customCategories, setCustomCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load custom categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCustomCategories(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load custom categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveCategories = async (categories: Category[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
            setCustomCategories(categories);
        } catch (error) {
            console.error('Failed to save custom categories:', error);
        }
    };

    const addCategory = useCallback(async (name: string, words: string[]) => {
        const newCategory: Category = {
            id: `custom_${Date.now()}`,
            name,
            icon: '✨',
            words,
            isCustom: true,
        };

        const updated = [...customCategories, newCategory];
        await saveCategories(updated);
        return newCategory;
    }, [customCategories]);

    const updateCategory = useCallback(async (id: string, updates: Partial<Pick<Category, 'name' | 'words'>>) => {
        const updated = customCategories.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
        );
        await saveCategories(updated);
    }, [customCategories]);

    const removeCategory = useCallback(async (id: string) => {
        const updated = customCategories.filter(cat => cat.id !== id);
        await saveCategories(updated);
    }, [customCategories]);

    return {
        customCategories,
        isLoading,
        addCategory,
        updateCategory,
        removeCategory,
        refreshCategories: loadCategories,
    };
}
