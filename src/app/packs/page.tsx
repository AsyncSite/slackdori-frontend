import { Metadata } from 'next';
import { api } from '@/lib/api';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Slack Emoji Packs - Free Bulk Install | SlackDori',
  description: 'Browse and install curated Slack emoji packs with one click. Developer emojis, Korean culture, reactions, and more. Free bulk emoji installation for Slack.',
  keywords: 'slack emoji pack, bulk install slack emojis, free slack emojis, slack emoji download',
  openGraph: {
    title: 'Slack Emoji Packs - One-Click Bulk Install',
    description: 'Install entire emoji packs to your Slack workspace instantly',
    type: 'website',
  }
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PacksPage() {
  const packs = await api.getPacks();
  
  // Group packs by category
  const categories = Array.from(new Set(packs.map(p => p.category)));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Slack Emoji Packs
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Install entire emoji packs to your Slack workspace with one click
          </p>
          <div className="flex gap-4">
            <span className="bg-white/20 px-4 py-2 rounded-full">
              {packs.length} Packs Available
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              {packs.reduce((sum, p) => sum + p.emojiCount, 0)} Total Emojis
            </span>
          </div>
        </div>
      </div>

      {/* Featured Packs */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Packs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {packs.filter(p => p.featured).map(pack => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>

        {/* All Packs by Category */}
        {categories.map(category => {
          const categoryPacks = packs.filter(p => p.category === category);
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
      </div>
    </div>
  );
}

function PackCard({ pack }: { pack: any }) {
  const REPO_BASE = 'https://raw.githubusercontent.com/AsyncSite/slack-emoji-packs/main';
  
  return (
    <Link href={`/packs/${pack.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer">
        {/* Preview Emojis */}
        <div className="flex gap-2 mb-4">
          {pack.preview.slice(0, 4).map((emojiName: string) => (
            <img
              key={emojiName}
              src={`${REPO_BASE}/images/${pack.id}/${emojiName}.png`}
              alt={emojiName}
              className="w-12 h-12"
              loading="lazy"
            />
          ))}
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