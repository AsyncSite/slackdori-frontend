/**
 * Core type definitions for SlackDori
 * These types will be used throughout the application
 */

export interface EmojiPack {
  id: string;
  name: string;
  description: string;
  emojiCount: number;
  category: string;
  tags: string[];
  author: string;
  preview: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Emoji {
  id: string;
  packId: string;
  name: string;
  imageUrl: string;
  aliases?: string[];
}

export interface User {
  id: string;
  email: string;
  slackWorkspaces?: SlackWorkspace[];
}

export interface SlackWorkspace {
  id: string;
  teamId: string;
  teamName: string;
  teamDomain: string;
  isAdmin: boolean;
}

export interface InstallationResult {
  success: boolean;
  installedCount: number;
  failedCount: number;
  errors?: string[];
}

export type PackCategory = 'developer' | 'korean' | 'general' | 'reaction' | 'custom';

export type SortOption = 'popular' | 'recent' | 'alphabetical';