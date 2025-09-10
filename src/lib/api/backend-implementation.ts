/**
 * Backend API Implementation
 * Uses actual backend service at localhost:8084
 */

import type { ISlackDoriAPI } from './interface';
import type {
  EmojiPack,
  PackDetails,
  SlackAuth,
  SlackWorkspace,
  InstallResult,
  InstallJob,
} from './types';

export class BackendAPI implements ISlackDoriAPI {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    // Check for existing session in localStorage
    if (typeof window !== 'undefined') {
      this.sessionId = localStorage.getItem('slackdori_session');
    }
  }

  // Pack Data Methods
  async getPacks(): Promise<EmojiPack[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/slack-emoji/v1/packs`);
      if (!response.ok) throw new Error('Failed to fetch packs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching packs:', error);
      return [];
    }
  }

  async getPackDetails(packId: string): Promise<PackDetails | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/slack-emoji/v1/packs/${packId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching pack details:', error);
      return null;
    }
  }

  async getFeaturedPacks(): Promise<EmojiPack[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/slack-emoji/v1/packs/featured`);
      if (!response.ok) throw new Error('Failed to fetch featured packs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured packs:', error);
      return [];
    }
  }

  async searchPacks(query: string): Promise<EmojiPack[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/slack-emoji/v1/packs/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search packs');
      return await response.json();
    } catch (error) {
      console.error('Error searching packs:', error);
      return [];
    }
  }

  async getPacksByCategory(category: string): Promise<EmojiPack[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/slack-emoji/v1/packs/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch packs by category');
      return await response.json();
    } catch (error) {
      console.error('Error fetching packs by category:', error);
      return [];
    }
  }

  // Authentication
  async initiateSlackOAuth(): Promise<{ authUrl: string }> {
    // Redirect to backend OAuth endpoint (public route through Gateway)
    const authUrl = `${this.baseUrl}/api/public/slack-emoji/v1/slack/auth`;
    return { authUrl };
  }

  async handleOAuthCallback(code: string): Promise<SlackAuth> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/slack-emoji/v1/slack/callback?code=${code}`);
      if (!response.ok) throw new Error('OAuth callback failed');
      
      const data = await response.json();
      if (data.sessionId) {
        this.sessionId = data.sessionId;
        localStorage.setItem('slackdori_session', data.sessionId);
      }
      
      // Mock SlackAuth for now
      return {
        accessToken: 'mock-token',
        teamId: 'T123456',
        teamName: 'Mock Team',
        userId: 'U123456',
        userName: 'Mock User',
        isAdmin: true
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  async getCurrentAuth(): Promise<SlackAuth | null> {
    // Check if we have a session
    if (!this.sessionId) return null;
    
    // Mock for now
    return {
      accessToken: 'mock-token',
      teamId: 'T123456',
      teamName: 'Mock Team',
      userId: 'U123456',
      userName: 'Mock User',
      isAdmin: true
    };
  }

  async logout(): Promise<void> {
    this.sessionId = null;
    localStorage.removeItem('slackdori_session');
  }

  // Workspace Management
  async getWorkspaces(): Promise<SlackWorkspace[]> {
    // Mock for now
    return [{
      id: '1',
      teamId: 'T123456',
      teamName: 'Mock Workspace',
      teamDomain: 'mock-workspace',
      isAdmin: true
    }];
  }

  async selectWorkspace(workspaceId: string): Promise<void> {
    // Store selected workspace
    localStorage.setItem('selected_workspace', workspaceId);
  }

  // Installation
  async installPack(packId: string, _workspaceId: string): Promise<InstallResult> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (this.sessionId) {
        headers['X-Session-Id'] = this.sessionId;
      }
      
      const response = await fetch(`${this.baseUrl}/api/slack-emoji/v1/install/${packId}`, {
        method: 'POST',
        headers
      });
      
      if (!response.ok) throw new Error('Installation failed');
      return await response.json();
    } catch (error) {
      console.error('Installation error:', error);
      return {
        jobId: '',
        status: 'error',
        message: 'Failed to start installation'
      };
    }
  }

  async getInstallStatus(jobId: string): Promise<InstallJob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/slack-emoji/v1/install/status/${jobId}`);
      if (!response.ok) throw new Error('Failed to get install status');
      
      const data = await response.json();
      return {
        id: data.jobId,
        packId: data.packId || '',
        workspaceId: data.workspaceId || '',
        status: data.status,
        progress: data.progress || 0,
        total: data.total || 0,
        startedAt: data.startedAt || new Date().toISOString(),
        completedAt: data.completedAt
      };
    } catch (error) {
      console.error('Error getting install status:', error);
      throw error;
    }
  }

  async getInstallHistory(): Promise<InstallJob[]> {
    // Mock for now
    return [];
  }

  // User Preferences
  async getFavorites(): Promise<string[]> {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  }

  async addFavorite(packId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(packId)) {
      favorites.push(packId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  async removeFavorite(packId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter(id => id !== packId);
    localStorage.setItem('favorites', JSON.stringify(filtered));
  }
}