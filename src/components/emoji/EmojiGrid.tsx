'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Emoji } from '@/lib/api/types';
import { EmojiCard } from './EmojiCard';
import { EmojiModal } from './EmojiModal';
import { downloadSelectedEmojis } from '@/lib/download';
import { getFavorites } from '@/lib/emoji-utils';

interface EmojiGridProps {
  emojis: Emoji[];
  packId: string;
  packName: string;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function EmojiGrid({ emojis, packId, packName, onToast }: EmojiGridProps) {
  const [selectedEmojis, setSelectedEmojis] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'comfortable' | 'compact'>('comfortable');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [modalEmoji, setModalEmoji] = useState<Emoji | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load favorites and listen for changes
  useEffect(() => {
    const loadFavorites = () => {
      setFavoriteIds(getFavorites());
    };

    loadFavorites();

    const handleFavoritesChange = () => {
      loadFavorites();
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChange);
    };
  }, []);

  // Filter emojis based on filter mode
  const filteredEmojis = useMemo(() => {
    if (filterMode === 'favorites') {
      return emojis.filter(emoji => 
        favoriteIds.includes(`${packId}__${emoji.name}`)
      );
    }
    return emojis;
  }, [emojis, filterMode, favoriteIds, packId]);

  const handleSelectEmoji = useCallback((emoji: Emoji, selected: boolean) => {
    setSelectedEmojis(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(emoji.name);
      } else {
        newSet.delete(emoji.name);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedEmojis.size === filteredEmojis.length) {
      setSelectedEmojis(new Set());
    } else {
      setSelectedEmojis(new Set(filteredEmojis.map(e => e.name)));
    }
  }, [filteredEmojis, selectedEmojis.size]);

  const handleDownloadSelected = useCallback(async () => {
    const selected = filteredEmojis.filter(e => selectedEmojis.has(e.name));
    if (selected.length === 0) {
      onToast?.('No emojis selected', 'info');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadSelectedEmojis(selected, `${packName}-selected`);
      onToast?.(`Downloaded ${selected.length} emojis`, 'success');
      setSelectedEmojis(new Set());
      setSelectionMode(false);
    } catch (error) {
      onToast?.('Failed to download selected emojis', 'error');
    } finally {
      setIsDownloading(false);
    }
  }, [filteredEmojis, selectedEmojis, packName, onToast]);

  const handleDownloadFavorites = useCallback(async () => {
    const favorites = emojis.filter(emoji => 
      favoriteIds.includes(`${packId}__${emoji.name}`)
    );
    
    if (favorites.length === 0) {
      onToast?.('No favorites to download', 'info');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadSelectedEmojis(favorites, 'favorite-emojis');
      onToast?.(`Downloaded ${favorites.length} favorite emojis`, 'success');
    } catch (error) {
      onToast?.('Failed to download favorites', 'error');
    } finally {
      setIsDownloading(false);
    }
  }, [emojis, favoriteIds, packId, onToast]);

  const handleViewDetails = useCallback((emoji: Emoji) => {
    setModalEmoji(emoji);
    setIsModalOpen(true);
  }, []);

  const getGridClass = () => {
    if (viewMode === 'compact') {
      return 'grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2';
    }
    return 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4';
  };

  return (
    <>
      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Selection Mode Toggle */}
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedEmojis(new Set());
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectionMode 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectionMode ? '✓ Selection Mode' : '☐ Select'}
            </button>

            {/* Selection Controls */}
            {selectionMode && (
              <>
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {selectedEmojis.size === filteredEmojis.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedEmojis.size} selected
                </span>
                <button
                  onClick={handleDownloadSelected}
                  disabled={selectedEmojis.size === 0 || isDownloading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? 'Downloading...' : `Download Selected (${selectedEmojis.size})`}
                </button>
              </>
            )}

            {/* Filter Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterMode === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({emojis.length})
              </button>
              <button
                onClick={() => setFilterMode('favorites')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterMode === 'favorites' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⭐ Favorites ({favoriteIds.filter(id => id.startsWith(`${packId}__`)).length})
              </button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Download Favorites */}
            {favoriteIds.filter(id => id.startsWith(`${packId}__`)).length > 0 && (
              <button
                onClick={handleDownloadFavorites}
                disabled={isDownloading}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                ⭐ Download Favorites
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('comfortable')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'comfortable' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Comfortable view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === 'compact' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Compact view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM9 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM9 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM15 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM15 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Grid */}
      {filteredEmojis.length > 0 ? (
        <div className={getGridClass()}>
          {filteredEmojis.map(emoji => (
            <EmojiCard
              key={emoji.name}
              emoji={emoji}
              packId={packId}
              onSelect={handleSelectEmoji}
              isSelected={selectedEmojis.has(emoji.name)}
              selectionMode={selectionMode}
              onViewDetails={handleViewDetails}
              onToast={onToast}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filterMode === 'favorites' 
              ? 'No favorite emojis yet. Click the star on emojis to add them to favorites!'
              : 'No emojis found'}
          </p>
        </div>
      )}

      {/* Emoji Detail Modal */}
      <EmojiModal
        emoji={modalEmoji}
        packId={packId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalEmoji(null);
        }}
        onToast={onToast}
      />
    </>
  );
}