/**
 * API Factory - Returns appropriate API implementation based on environment
 */

import { ISlackDoriAPI } from './interface';
import { GitHubAPI } from './github-implementation';
import { BackendAPI } from './backend-implementation';

export * from './types';
export type { ISlackDoriAPI } from './interface';

let apiInstance: ISlackDoriAPI | null = null;

/**
 * Get API instance - singleton pattern
 * Returns BackendAPI when NEXT_PUBLIC_USE_BACKEND=true
 */
export function getAPI(): ISlackDoriAPI {
  if (!apiInstance) {
    // Check environment variable for API source
    const useBackend = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';
    
    if (useBackend) {
      apiInstance = new BackendAPI(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:13084');
    } else {
      apiInstance = new GitHubAPI();
    }
  }
  
  return apiInstance;
}

// Export convenience methods
export const api = getAPI();