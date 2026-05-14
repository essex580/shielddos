import { ref, watch } from 'vue';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'shield_theme';

const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
export const currentTheme = ref<Theme>(stored || 'dark');

// Apply on load
document.documentElement.setAttribute('data-theme', currentTheme.value);

watch(currentTheme, (val) => {
    document.documentElement.setAttribute('data-theme', val);
    localStorage.setItem(STORAGE_KEY, val);
});

export function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark';
}
