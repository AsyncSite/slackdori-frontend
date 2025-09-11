'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Emoji } from '@/lib/api/types';
import { downloadEmoji, toggleFavorite, isFavorite, getEmojiId } from '@/lib/emoji-utils';
import { copyEmojiCode, copyEmojiUrl, copyEmojiImage, isImageCopyAvailable } from '@/lib/clipboard';

interface EmojiModalProps {
  emoji: Emoji | null;
  packId: string;
  isOpen: boolean;
  onClose: () => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function EmojiModal({ emoji, packId, isOpen, onClose, onToast }: EmojiModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageScale, setImageScale] = useState(2);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (emoji) {
      setIsFav(isFavorite(getEmojiId(packId, emoji.name)));
    }
  }, [emoji, packId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleDownload = useCallback(async () => {
    if (!emoji) return;
    setIsDownloading(true);
    try {
      await downloadEmoji(emoji);
      onToast?.(`Downloaded ${emoji.name}.png`, 'success');
    } catch (error) {
      onToast?.('Failed to download emoji', 'error');
    } finally {
      setIsDownloading(false);
    }
  }, [emoji, onToast]);

  const handleCopyCode = useCallback(async () => {
    if (!emoji) return;
    try {
      await copyEmojiCode(emoji);
      onToast?.(`Copied :${emoji.name}: to clipboard`, 'success');
    } catch (error) {
      onToast?.('Failed to copy emoji code', 'error');
    }
  }, [emoji, onToast]);

  const handleCopyUrl = useCallback(async () => {
    if (!emoji) return;
    try {
      await copyEmojiUrl(emoji);
      onToast?.('Copied image URL to clipboard', 'success');
    } catch (error) {
      onToast?.('Failed to copy URL', 'error');
    }
  }, [emoji, onToast]);

  const handleCopyImage = useCallback(async () => {
    if (!emoji) return;
    try {
      await copyEmojiImage(emoji);
      onToast?.('Copied image to clipboard', 'success');
    } catch (error) {
      onToast?.('Your browser doesn\'t support copying images', 'error');
    }
  }, [emoji, onToast]);

  const handleToggleFavorite = useCallback(() => {
    if (!emoji) return;
    const newFavStatus = toggleFavorite(getEmojiId(packId, emoji.name));
    setIsFav(newFavStatus);
    onToast?.(
      newFavStatus ? `Added ${emoji.name} to favorites` : `Removed ${emoji.name} from favorites`,
      'success'
    );
  }, [emoji, packId, onToast]);

  if (!mounted || !isOpen || !emoji) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Emoji Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gray-100 rounded-xl p-8 mb-4">
              <img
                src={emoji.imageUrl}
                alt={emoji.name}
                className="object-contain transition-all duration-200"
                style={{
                  width: `${64 * imageScale}px`,
                  height: `${64 * imageScale}px`
                }}
              />
            </div>
            
            {/* Size Controls */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Size:</span>
              <button
                onClick={() => setImageScale(1)}
                className={`px-3 py-1 rounded ${imageScale === 1 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
              >
                1x
              </button>
              <button
                onClick={() => setImageScale(2)}
                className={`px-3 py-1 rounded ${imageScale === 2 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
              >
                2x
              </button>
              <button
                onClick={() => setImageScale(4)}
                className={`px-3 py-1 rounded ${imageScale === 4 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
              >
                4x
              </button>
            </div>
          </div>

          {/* Emoji Info */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Name</h3>
              <p className="text-lg font-mono">:{emoji.name}:</p>
            </div>

            {emoji.aliases && emoji.aliases.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Aliases</h3>
                <p className="text-lg font-mono">
                  {emoji.aliases.map(a => `:${a}:`).join(', ')}
                </p>
              </div>
            )}

            {emoji.unicode && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Unicode</h3>
                <p className="text-2xl">{emoji.unicode}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isFav 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              {isFav ? 'Favorited' : 'Favorite'}
            </button>

            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Code
            </button>

            <button
              onClick={handleCopyUrl}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy URL
            </button>

            {isImageCopyAvailable() && (
              <button
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors col-span-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Copy Image
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use in Slack:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Download the image or copy the code</li>
              <li>2. Go to your Slack workspace settings</li>
              <li>3. Navigate to &quot;Customize Workspace&quot; → &quot;Emoji&quot;</li>
              <li>4. Click &quot;Add Custom Emoji&quot; and upload the image</li>
              <li>5. Use the emoji name: <code className="bg-blue-100 px-1 rounded">:{emoji.name}:</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}