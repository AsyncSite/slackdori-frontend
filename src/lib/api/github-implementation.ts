/**
 * GitHub-based API Implementation
 * Uses AsyncSite/slack-emoji-packs repository as data source
 */

import type { ISlackDoriAPI } from './interface';
import type {
  EmojiPack,
  PackDetails,
  SlackAuth,
  SlackWorkspace,
  InstallResult,
  InstallJob,
  Emoji
} from './types';

const REPO_BASE = 'https://raw.githubusercontent.com/AsyncSite/slack-emoji-packs/main';

export class GitHubAPI implements ISlackDoriAPI {
  private packsCache: EmojiPack[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Pack Data Methods
  async getPacks(): Promise<EmojiPack[]> {
    // Use cache if available and fresh
    if (this.packsCache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.packsCache;
    }

    try {
      const response = await fetch(`${REPO_BASE}/packs.json`);
      if (!response.ok) throw new Error('Failed to fetch packs');
      
      const data = await response.json();
      this.packsCache = data.packs;
      this.cacheTimestamp = Date.now();
      
      return data.packs;
    } catch (error) {
      console.error('Error fetching packs:', error);
      return [];
    }
  }

  async getPackDetails(packId: string): Promise<PackDetails | null> {
    try {
      const [packsResponse, detailsResponse] = await Promise.all([
        fetch(`${REPO_BASE}/packs.json`),
        fetch(`${REPO_BASE}/images/${packId}/pack.json`)
      ]);

      if (!packsResponse.ok || !detailsResponse.ok) {
        throw new Error(`Failed to fetch pack details for ${packId}`);
      }

      const packsData = await packsResponse.json();
      const packMeta = packsData.packs.find((p: EmojiPack) => p.id === packId);
      const packDetails = await detailsResponse.json();

      if (!packMeta) return null;

      // Transform image URLs to use GitHub raw content
      const emojisWithFullUrls = packDetails.emojis.map((emoji: any) => {
        // Handle both string array and object array formats
        if (typeof emoji === 'string') {
          return {
            name: emoji.replace(/\.(png|gif)$/, ''),
            imageUrl: `${REPO_BASE}/images/${packId}/${emoji}`
          };
        }
        // Already an object with imageUrl
        return {
          ...emoji,
          imageUrl: `${REPO_BASE}${emoji.imageUrl}`
        };
      });

      return {
        ...packMeta,
        ...packDetails,
        emojis: emojisWithFullUrls
      };
    } catch (error) {
      console.error(`Error fetching pack details for ${packId}:`, error);
      return null;
    }
  }

  async getFeaturedPacks(): Promise<EmojiPack[]> {
    const packs = await this.getPacks();
    return packs.filter(pack => pack.featured);
  }

  async searchPacks(query: string): Promise<EmojiPack[]> {
    const packs = await this.getPacks();
    const lowerQuery = query.toLowerCase();
    
    return packs.filter(pack => 
      pack.name.toLowerCase().includes(lowerQuery) ||
      pack.description.toLowerCase().includes(lowerQuery) ||
      pack.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getPacksByCategory(category: string): Promise<EmojiPack[]> {
    const packs = await this.getPacks();
    return packs.filter(pack => pack.category === category);
  }

  // Authentication Methods (Mock for now)
  async initiateSlackOAuth(): Promise<{ authUrl: string }> {
    // In production, this would return actual Slack OAuth URL
    const mockAuthUrl = 'https://slack.com/oauth/v2/authorize?client_id=MOCK&scope=emoji:write';
    
    // Store state in localStorage for mock
    localStorage.setItem('slack_oauth_state', 'mock_state_' + Date.now());
    
    return { authUrl: mockAuthUrl };
  }

  async handleOAuthCallback(_code: string): Promise<SlackAuth> {
    // Mock implementation - in production, would exchange code for token
    // _code will be used when backend is implemented
    const mockAuth: SlackAuth = {
      accessToken: 'mock_token_' + Date.now(),
      teamId: 'T_MOCK_001',
      teamName: 'Mock Workspace',
      userId: 'U_MOCK_001',
      userName: 'Mock User',
      isAdmin: true
    };
    
    // Store in localStorage
    localStorage.setItem('slack_auth', JSON.stringify(mockAuth));
    
    return mockAuth;
  }

  async getCurrentAuth(): Promise<SlackAuth | null> {
    const stored = localStorage.getItem('slack_auth');
    return stored ? JSON.parse(stored) : null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('slack_auth');
    localStorage.removeItem('slack_workspaces');
  }

  // Workspace Management (Mock)
  async getWorkspaces(): Promise<SlackWorkspace[]> {
    const auth = await this.getCurrentAuth();
    if (!auth) return [];
    
    // Return mock workspaces
    return [
      {
        id: 'ws_1',
        teamId: auth.teamId,
        teamName: auth.teamName,
        teamDomain: 'mock-workspace',
        isAdmin: auth.isAdmin
      }
    ];
  }

  async selectWorkspace(workspaceId: string): Promise<void> {
    localStorage.setItem('selected_workspace', workspaceId);
  }

  // Installation (Mock)
  async installPack(packId: string, workspaceId: string): Promise<InstallResult> {
    const jobId = 'job_' + Date.now();
    
    // Create mock job
    const job: InstallJob = {
      id: jobId,
      packId,
      workspaceId,
      status: 'processing',
      progress: 0,
      total: 25,
      startedAt: new Date().toISOString()
    };
    
    // Store in localStorage
    const jobs = this.getStoredJobs();
    jobs.push(job);
    localStorage.setItem('install_jobs', JSON.stringify(jobs));
    
    // Simulate installation progress
    this.simulateInstallation(jobId);
    
    return {
      jobId,
      status: 'started'
    };
  }

  private simulateInstallation(jobId: string) {
    let progress = 0;
    const total = 25;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      
      if (progress >= total) {
        progress = total;
        this.updateJob(jobId, {
          status: 'completed',
          progress: total,
          completedAt: new Date().toISOString()
        });
        clearInterval(interval);
      } else {
        this.updateJob(jobId, { progress });
      }
    }, 1000);
  }

  private updateJob(jobId: string, updates: Partial<InstallJob>) {
    const jobs = this.getStoredJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
      jobs[jobIndex] = { ...jobs[jobIndex], ...updates };
      localStorage.setItem('install_jobs', JSON.stringify(jobs));
    }
  }

  private getStoredJobs(): InstallJob[] {
    const stored = localStorage.getItem('install_jobs');
    return stored ? JSON.parse(stored) : [];
  }

  async getInstallStatus(jobId: string): Promise<InstallJob> {
    const jobs = this.getStoredJobs();
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    return job;
  }

  async getInstallHistory(): Promise<InstallJob[]> {
    return this.getStoredJobs();
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