'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, EmojiPack } from '@/lib/api';

export default function HomePage() {
  const [packs, setPacks] = useState<EmojiPack[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.getPacks().then(data => {
      setPacks(data);
      setLoading(false);
    });
  }, []);
  
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slack-purple to-slack-blue text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </main>
    );
  }
  
  const featuredPacks = packs.filter(p => p.featured);
  const totalEmojis = packs.reduce((sum, p) => sum + p.emojiCount, 0);
  
  const REPO_BASE = 'https://raw.githubusercontent.com/AsyncSite/slack-emoji-packs/main';
  
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slack-purple to-slack-blue text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              One-Click Slack Emoji Pack Installation
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Transform your Slack workspace with curated emoji packs. 
              No more adding emojis one by one.
            </p>
            <div className="flex gap-4 justify-center mb-8">
              <Link href="/packs" className="btn-secondary">
                Browse {packs.length} Emoji Packs
              </Link>
              <Link href="/studio" className="btn-secondary">
                ✨ Create Your Own
              </Link>
              <Link href="#how-it-works" className="bg-white text-slack-purple px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200">
                How It Works
              </Link>
            </div>
            <div className="flex gap-6 justify-center text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {packs.length} Packs Available
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {totalEmojis} Total Emojis
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                100% Free
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" id="how-it-works">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why SlackDori?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Instant Installation</h3>
              <p className="text-gray-600">
                Add entire emoji packs to your Slack workspace with just one click
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Curated Collections</h3>
              <p className="text-gray-600">
                Hand-picked emoji packs for developers, designers, and teams
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Simple</h3>
              <p className="text-gray-600">
                Official Slack OAuth integration with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packs Section */}
      <section className="py-16 bg-gray-100">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Emoji Packs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPacks.map(pack => (
              <div key={pack.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{pack.name}</h3>
                  <span className="text-sm bg-slack-purple text-white px-2 py-1 rounded">
                    {pack.emojiCount} emojis
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {pack.description}
                </p>
                <div className="flex gap-2 mb-4 items-center">
                  {pack.preview.slice(0, 4).map(emojiFile => {
                    // Preview now includes file extension
                    const imgSrc = `${REPO_BASE}/images/${pack.id}/${emojiFile}`;
                    const emojiName = emojiFile.replace(/\.(png|gif)$/, '');
                    
                    return (
                      <img
                        key={emojiFile}
                        src={imgSrc}
                        alt={emojiName}
                        className="w-10 h-10"
                        loading="lazy"
                      />
                    );
                  })}
                  {pack.emojiCount > 4 && (
                    <span className="text-gray-400">+{pack.emojiCount - 4}</span>
                  )}
                </div>
                <Link href={`/packs/${pack.id}`} className="block">
                  <button className="w-full btn-primary">
                    View Pack
                  </button>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/packs" className="btn-secondary inline-block">
              Browse All Packs →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slack-purple text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Browse Emoji Packs</h3>
                  <p className="text-gray-600">
                    Explore our curated collection of emoji packs for every team and occasion
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slack-purple text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Connect Your Slack</h3>
                  <p className="text-gray-600">
                    Securely authenticate with Slack using official OAuth (admin permissions required)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slack-purple text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">One-Click Install</h3>
                  <p className="text-gray-600">
                    Click install and watch as all emojis are added to your workspace automatically
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slack-purple text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Slack Workspace?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams using SlackDori to enhance their communication
          </p>
          <Link href="/packs" className="btn-secondary text-lg px-8 py-4 inline-block">
            Get Started Free
          </Link>
        </div>
      </section>
    </main>
  );
}