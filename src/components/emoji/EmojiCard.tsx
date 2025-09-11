'use client';

import { useState, useCallback } from 'react';
import { Emoji } from '@/lib/api/types';
import { downloadEmoji, toggleFavorite, isFavorite, getEmojiId } from '@/lib/emoji-utils';
import { copyEmojiCode, copyEmojiUrl } from '@/lib/clipboard';

interface EmojiCardProps {
  emoji: Emoji;
  packId: string;
  onSelect?: (emoji: Emoji, selected: boolean) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  onViewDetails?: (emoji: Emoji) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function EmojiCard({
  emoji,
  packId,
  onSelect,
  isSelected = false,
  selectionMode = false,
  onViewDetails,
  onToast
}: EmojiCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(() => isFavorite(getEmojiId(packId, emoji.name)));
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await downloadEmoji(emoji);
      onToast?.(`Downloaded ${emoji.name}.png`, 'success');
    } catch (error) {
      onToast?.('Failed to download emoji', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [emoji, onToast]);

  const handleCopyCode = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyEmojiCode(emoji);
      onToast?.(`Copied :${emoji.name}: to clipboard`, 'success');
    } catch (error) {
      onToast?.('Failed to copy emoji code', 'error');
    }
  }, [emoji, onToast]);

  const handleCopyUrl = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyEmojiUrl(emoji);
      onToast?.('Copied image URL to clipboard', 'success');
    } catch (error) {
      onToast?.('Failed to copy URL', 'error');
    }
  }, [emoji, onToast]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavStatus = toggleFavorite(getEmojiId(packId, emoji.name));
    setIsFav(newFavStatus);
    onToast?.(
      newFavStatus ? `Added ${emoji.name} to favorites` : `Removed ${emoji.name} from favorites`,
      'success'
    );
  }, [emoji, packId, onToast]);

  const handleCardClick = useCallback(() => {
    if (selectionMode && onSelect) {
      onSelect(emoji, !isSelected);
    } else if (onViewDetails) {
      onViewDetails(emoji);
    }
  }, [emoji, isSelected, selectionMode, onSelect, onViewDetails]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(emoji, e.target.checked);
  }, [emoji, onSelect]);

  return (
    <div
      className={`
        relative bg-white rounded-lg p-4 shadow-sm transition-all duration-200
        ${isHovered ? 'shadow-lg transform scale-105' : 'hover:shadow-md'}
        ${isSelected ? 'ring-2 ring-purple-500' : ''}
        ${selectionMode ? 'cursor-pointer' : ''}
        group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Favorite Star */}
      <button
        onClick={handleToggleFavorite}
        className={`
          absolute top-2 right-2 z-10
          transition-all duration-200
          ${isFav ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}
        `}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      </button>

      {/* Emoji Image */}
      <div className="flex items-center justify-center mb-3">
        <img
          src={emoji.imageUrl}
          alt={emoji.name}
          className="w-16 h-16 object-contain"
          loading="lazy"
        />
      </div>

      {/* Emoji Name */}
      <p className="text-center text-sm font-mono text-gray-700 mb-1">
        :{emoji.name}:
      </p>

      {/* Aliases */}
      {emoji.aliases && emoji.aliases.length > 0 && (
        <p className="text-center text-xs text-gray-500">
          {emoji.aliases.slice(0, 2).map(a => `:${a}:`).join(' ')}
        </p>
      )}

      {/* Hover Actions */}
      <div className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        flex gap-1 bg-gray-800 rounded-lg p-1 shadow-lg
        transition-all duration-200
        ${isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
      `}>
        {/* View Details */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(emoji);
          }}
          className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
          title="View details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="p-2 text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
          title="Download"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </button>

        {/* Copy Code */}
        <button
          onClick={handleCopyCode}
          className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
          title="Copy emoji code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>

        {/* Copy URL */}
        <button
          onClick={handleCopyUrl}
          className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
          title="Copy image URL"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
      </div>
    </div>
  );
}