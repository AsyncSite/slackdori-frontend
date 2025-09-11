'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, EmojiPack } from '@/lib/api';

export default function PacksPage() {
  const [packs, setPacks] = useState<EmojiPack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<EmojiPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    api.getPacks().then(data => {
      setPacks(data);
      setFilteredPacks(data);
      setLoading(false);
    });
  }, []);
  
  // Search and filter logic
  useEffect(() => {
    let filtered = packs;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pack => pack.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pack => 
        pack.name.toLowerCase().includes(query) ||
        pack.description.toLowerCase().includes(query) ||
        pack.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredPacks(filtered);
  }, [searchQuery, selectedCategory, packs]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-2xl text-purple-600">Loading emoji packs...</div>
      </div>
    );
  }
  
  // Get unique categories
  const categories = Array.from(new Set(packs.map(p => p.category)));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-slack-purple hover:underline text-sm md:text-base">
              ← Back to Home
            </Link>
            <Link href="/studio" className="text-slack-purple hover:underline text-sm md:text-base">
              Create Emoji →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Slack Emoji Packs
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Install entire emoji packs to your Slack workspace with one click
          </p>
          <div className="flex gap-4 mb-8">
            <span className="bg-white/20 px-4 py-2 rounded-full">
              {filteredPacks.length} of {packs.length} Packs
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              {packs.reduce((sum, p) => sum + p.emojiCount, 0)} Total Emojis
            </span>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search packs by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-900"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="container mx-auto px-4 py-12">
        {searchQuery || selectedCategory !== 'all' ? (
          <>
            <h2 className="text-2xl font-bold mb-8">
              {filteredPacks.length} Results
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </h2>
            {filteredPacks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No packs found matching your criteria.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}
                  className="mt-4 text-purple-600 hover:text-purple-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPacks.map(pack => (
                  <PackCard key={pack.id} pack={pack} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Featured Packs */}
            <h2 className="text-3xl font-bold mb-8">Featured Packs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredPacks.filter(p => p.featured).map(pack => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>

            {/* All Packs by Category */}
            {categories.map(category => {
              const categoryPacks = filteredPacks.filter(p => p.category === category);
              if (categoryPacks.length === 0) return null;
              
              return (
                <div key={category} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 capitalize">
                    {category} Packs
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryPacks.map(pack => (
                      <PackCard key={pack.id} pack={pack} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function PackCard({ pack }: { pack: EmojiPack }) {
  const REPO_BASE = 'https://raw.githubusercontent.com/AsyncSite/slack-emoji-packs/main';
  
  return (
    <Link href={`/packs/${pack.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer">
        {/* Preview Emojis */}
        <div className="flex gap-2 mb-4">
          {pack.preview.slice(0, 4).map((emojiFile: string) => {
            const emojiName = emojiFile.replace(/\.(png|gif)$/, '');
            return (
              <img
                key={emojiFile}
                src={`${REPO_BASE}/images/${pack.id}/${emojiFile}`}
                alt={emojiName}
                className="w-12 h-12"
                loading="lazy"
              />
            );
          })}
        </div>
        
        {/* Pack Info */}
        <h3 className="text-xl font-semibold mb-2">{pack.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{pack.description}</p>
        
        {/* Stats */}
        <div className="flex justify-between items-center">
          <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            {pack.emojiCount} emojis
          </span>
          {pack.featured && (
            <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {pack.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-xs text-gray-500">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}