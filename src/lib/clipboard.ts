/**
 * Clipboard utility functions for emoji operations
 */

import { Emoji } from './api';

/**
 * Copy emoji code to clipboard (e.g., :emoji_name:)
 */
export async function copyEmojiCode(emoji: Emoji): Promise<void> {
  const code = `:${emoji.name}:`;
  await navigator.clipboard.writeText(code);
}

/**
 * Copy emoji image URL to clipboard
 */
export async function copyEmojiUrl(emoji: Emoji): Promise<void> {
  // Convert relative URL to absolute URL if needed
  const url = emoji.imageUrl.startsWith('http') 
    ? emoji.imageUrl 
    : `${window.location.origin}${emoji.imageUrl}`;
  await navigator.clipboard.writeText(url);
}

/**
 * Copy emoji image itself to clipboard (as image data)
 * This allows pasting the actual image in other applications
 */
export async function copyEmojiImage(emoji: Emoji): Promise<void> {
  try {
    const response = await fetch(emoji.imageUrl);
    const blob = await response.blob();
    
    // Check if the browser supports clipboard API for images
    if ('ClipboardItem' in window) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
    } else {
      throw new Error('Browser does not support copying images to clipboard');
    }
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    throw error;
  }
}

/**
 * Copy markdown format for the emoji
 */
export async function copyEmojiMarkdown(emoji: Emoji): Promise<void> {
  const markdown = `![${emoji.name}](${emoji.imageUrl})`;
  await navigator.clipboard.writeText(markdown);
}

/**
 * Check if clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return typeof navigator !== 'undefined' && 
         'clipboard' in navigator && 
         'writeText' in navigator.clipboard;
}

/**
 * Check if clipboard supports image copying
 */
export function isImageCopyAvailable(): boolean {
  return isClipboardAvailable() && 
         'ClipboardItem' in window && 
         'write' in navigator.clipboard;
}