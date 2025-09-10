/**
 * API Types - Shared between frontend and future backend
 */

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

export interface PackDetails extends EmojiPack {
  version: string;
  emojis: Emoji[];
}

export interface SlackWorkspace {
  id: string;
  teamId: string;
  teamName: string;
  teamDomain: string;
  isAdmin: boolean;
}

export interface SlackAuth {
  accessToken: string;
  teamId: string;
  teamName: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
}

export interface InstallJob {
  id: string;
  packId: string;
  workspaceId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  errors?: string[];
  startedAt: string;
  completedAt?: string;
}

export interface InstallResult {
  jobId: string;
  status: 'started' | 'error';
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}