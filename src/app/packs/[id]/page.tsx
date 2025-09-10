import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const pack = await api.getPackDetails(params.id);
  
  if (!pack) {
    return {
      title: 'Pack Not Found | SlackDori'
    };
  }
  
  return {
    title: `${pack.name} - Slack Emoji Pack | SlackDori`,
    description: `${pack.description} Install ${pack.emojiCount} emojis to your Slack workspace with one click.`,
    keywords: `${pack.name}, slack emoji, ${pack.tags.join(', ')}`,
    openGraph: {
      title: `${pack.name} - ${pack.emojiCount} Slack Emojis`,
      description: pack.description,
      images: pack.emojis.slice(0, 4).map(e => e.imageUrl),
    }
  };
}

export default async function PackDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const pack = await api.getPackDetails(params.id);
  
  if (!pack) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <Link href="/packs" className="text-white/80 hover:text-white mb-4 inline-block">
            ← Back to Packs
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {pack.name}
          </h1>
          <p className="text-xl opacity-90 mb-6">
            {pack.description}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <span className="bg-white/20 px-4 py-2 rounded-full">
              {pack.emojiCount} emojis
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              by {pack.author}
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              v{pack.version}
            </span>
          </div>
          
          {/* Install Button */}
          <InstallButton packId={pack.id} />
        </div>
      </div>
      
      {/* Emoji Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Emojis in this pack</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {pack.emojis.map(emoji => (
            <div 
              key={emoji.name}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={emoji.imageUrl}
                alt={emoji.name}
                className="w-16 h-16 mx-auto mb-2"
                loading="lazy"
              />
              <p className="text-center text-sm font-mono">:{emoji.name}:</p>
              {emoji.aliases && emoji.aliases.length > 0 && (
                <p className="text-center text-xs text-gray-500 mt-1">
                  {emoji.aliases.map(a => `:${a}:`).join(' ')}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {/* Installation Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">How to Install</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Option 1: One-Click Install (Coming Soon)</h3>
              <p className="text-gray-600 mb-3">
                We're working on automatic installation. Soon you'll be able to install all emojis with just one click!
              </p>
              <button 
                className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Option 2: Manual Installation</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Download the emoji pack as a ZIP file</li>
                <li>Go to your Slack workspace</li>
                <li>Navigate to Settings → Customize Workspace → Emoji</li>
                <li>Click "Add Custom Emoji"</li>
                <li>Upload each emoji image and set its name</li>
              </ol>
              <button 
                className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => downloadPack(pack)}
              >
                Download Pack (.zip)
              </button>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {pack.tags.map(tag => (
              <Link 
                key={tag}
                href={`/search?q=${tag}`}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InstallButton({ packId }: { packId: string }) {
  return (
    <div className="flex gap-4">
      <button 
        className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
        onClick={() => {
          // This will trigger OAuth flow when backend is ready
          alert(`Slack authentication coming soon! Pack ID: ${packId}. For now, please use manual installation.`);
        }}
      >
        Install to Slack
      </button>
      <button 
        className="bg-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors"
        onClick={() => {
          // Add to favorites (will use packId when backend is ready)
          alert(`Added ${packId} to favorites!`);
        }}
      >
        ⭐ Save Pack
      </button>
    </div>
  );
}

async function downloadPack(pack: any) {
  // In a real implementation, this would create a ZIP file
  // For now, we'll just alert the user
  alert(`Download feature for "${pack.name}" coming soon! You can manually save the images from the grid below.`);
}