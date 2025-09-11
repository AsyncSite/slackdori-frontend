/**
 * Emoji utility functions
 */

import { Emoji } from './api';

/**
 * Download a single emoji as PNG file
 */
export async function downloadEmoji(emoji: Emoji): Promise<void> {
  try {
    const response = await fetch(emoji.imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${emoji.name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download emoji:', error);
    throw new Error('Failed to download emoji');
  }
}

/**
 * Check if an emoji is in favorites
 */
export function isFavorite(emojiId: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(emojiId);
}

/**
 * Get all favorite emoji IDs
 */
export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('slackdori_favorites');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Toggle favorite status for an emoji
 */
export function toggleFavorite(emojiId: string): boolean {
  const favorites = getFavorites();
  let newFavorites: string[];
  let isNowFavorite: boolean;
  
  if (favorites.includes(emojiId)) {
    newFavorites = favorites.filter(id => id !== emojiId);
    isNowFavorite = false;
  } else {
    newFavorites = [...favorites, emojiId];
    isNowFavorite = true;
  }
  
  localStorage.setItem('slackdori_favorites', JSON.stringify(newFavorites));
  
  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('favoritesChanged', { 
    detail: { emojiId, isFavorite: isNowFavorite } 
  }));
  
  return isNowFavorite;
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  localStorage.removeItem('slackdori_favorites');
  window.dispatchEvent(new CustomEvent('favoritesChanged', { 
    detail: { cleared: true } 
  }));
}

/**
 * Get unique emoji ID (combines pack ID and emoji name)
 */
export function getEmojiId(packId: string, emojiName: string): string {
  return `${packId}__${emojiName}`;
}