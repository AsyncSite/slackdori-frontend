/**
 * Emoji data fetching from GitHub repository
 * Uses AsyncSite/slack-emoji-packs as the data source
 */

const REPO_BASE = 'https://raw.githubusercontent.com/AsyncSite/slack-emoji-packs/main';

export interface EmojiPack {
  id: string;
  name: string;
  description: string;
  category: string;
  emojiCount: number;
  author: string;
  tags: string[];
  preview: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Emoji {
  name: string;
  aliases?: string[];
  imageUrl: string;
  unicode?: string;
}

export interface PackDetails {
  id: string;
  name: string;
  description: string;
  version: string;
  emojis: Emoji[];
}

/**
 * Fetch all available emoji packs
 */
export async function getEmojiPacks(): Promise<EmojiPack[]> {
  try {
    const response = await fetch(`${REPO_BASE}/packs.json`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch emoji packs');
    }
    
    const data = await response.json();
    return data.packs;
  } catch (error) {
    console.error('Error fetching emoji packs:', error);
    return [];
  }
}

/**
 * Fetch details for a specific emoji pack
 */
export async function getPackDetails(packId: string): Promise<PackDetails | null> {
  try {
    const response = await fetch(`${REPO_BASE}/packs/${packId}/pack.json`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pack details for ${packId}`);
    }
    
    const data = await response.json();
    
    // Transform image URLs to use GitHub raw content
    const emojisWithFullUrls = data.emojis.map((emoji: Emoji) => ({
      ...emoji,
      imageUrl: `${REPO_BASE}${emoji.imageUrl}`
    }));
    
    return {
      ...data,
      emojis: emojisWithFullUrls
    };
  } catch (error) {
    console.error(`Error fetching pack details for ${packId}:`, error);
    return null;
  }
}

/**
 * Get featured packs for homepage
 */
export async function getFeaturedPacks(): Promise<EmojiPack[]> {
  const packs = await getEmojiPacks();
  return packs.filter(pack => pack.featured);
}

/**
 * Search packs by query
 */
export async function searchPacks(query: string): Promise<EmojiPack[]> {
  const packs = await getEmojiPacks();
  const lowerQuery = query.toLowerCase();
  
  return packs.filter(pack => 
    pack.name.toLowerCase().includes(lowerQuery) ||
    pack.description.toLowerCase().includes(lowerQuery) ||
    pack.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get packs by category
 */
export async function getPacksByCategory(category: string): Promise<EmojiPack[]> {
  const packs = await getEmojiPacks();
  return packs.filter(pack => pack.category === category);
}

/**
 * Get preview image URLs for a pack
 */
export function getPreviewImages(packId: string, emojiNames: string[]): string[] {
  return emojiNames.map(name => 
    `${REPO_BASE}/images/${packId}/${name}.png`
  );
}