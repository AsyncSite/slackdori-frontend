/**
 * API Interface - Contract for data fetching
 * Implementations can be GitHub-based or Backend API-based
 */

import type {
  EmojiPack,
  PackDetails,
  SlackAuth,
  SlackWorkspace,
  InstallResult,
  InstallJob
} from './types';

export interface ISlackDoriAPI {
  // Pack Data
  getPacks(): Promise<EmojiPack[]>;
  getPackDetails(packId: string): Promise<PackDetails | null>;
  getFeaturedPacks(): Promise<EmojiPack[]>;
  searchPacks(query: string): Promise<EmojiPack[]>;
  getPacksByCategory(category: string): Promise<EmojiPack[]>;
  
  // Authentication (will be implemented with backend)
  initiateSlackOAuth(): Promise<{ authUrl: string }>;
  handleOAuthCallback(code: string): Promise<SlackAuth>;
  getCurrentAuth(): Promise<SlackAuth | null>;
  logout(): Promise<void>;
  
  // Workspace Management
  getWorkspaces(): Promise<SlackWorkspace[]>;
  selectWorkspace(workspaceId: string): Promise<void>;
  
  // Installation
  installPack(packId: string, workspaceId: string): Promise<InstallResult>;
  getInstallStatus(jobId: string): Promise<InstallJob>;
  getInstallHistory(): Promise<InstallJob[]>;
  
  // User Preferences (stored locally for now)
  getFavorites(): Promise<string[]>;
  addFavorite(packId: string): Promise<void>;
  removeFavorite(packId: string): Promise<void>;
}