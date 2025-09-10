/**
 * API Factory - Returns appropriate API implementation based on environment
 */

import { ISlackDoriAPI } from './interface';
import { GitHubAPI } from './github-implementation';

export * from './types';
export type { ISlackDoriAPI } from './interface';

let apiInstance: ISlackDoriAPI | null = null;

/**
 * Get API instance - singleton pattern
 * In future, this will return BackendAPI when NEXT_PUBLIC_USE_BACKEND=true
 */
export function getAPI(): ISlackDoriAPI {
  if (!apiInstance) {
    // Check environment variable for API source
    const useBackend = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';
    
    if (useBackend) {
      // TODO: When backend is ready, uncomment this
      // apiInstance = new BackendAPI(process.env.NEXT_PUBLIC_API_URL!);
      apiInstance = new GitHubAPI();
    } else {
      apiInstance = new GitHubAPI();
    }
  }
  
  return apiInstance;
}

// Export convenience methods
export const api = getAPI();