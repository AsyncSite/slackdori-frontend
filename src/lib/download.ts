import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { PackDetails } from './api/types';

/**
 * Download emoji pack as ZIP file
 */
export async function downloadPackAsZip(pack: PackDetails) {
  const zip = new JSZip();
  
  // Create pack info JSON
  const packInfo = {
    name: pack.name,
    description: pack.description,
    author: pack.author,
    version: pack.version,
    emojiCount: pack.emojiCount,
    emojis: pack.emojis.map(e => ({
      name: e.name,
      aliases: e.aliases || []
    }))
  };
  
  // Add pack info file
  zip.file('pack-info.json', JSON.stringify(packInfo, null, 2));
  
  // Add README
  const readme = `# ${pack.name}

${pack.description}

## Contents
- ${pack.emojiCount} emojis
- Author: ${pack.author}
- Version: ${pack.version}

## How to Install
1. Go to your Slack workspace
2. Navigate to Settings → Customize Workspace → Emoji
3. Click "Add Custom Emoji"
4. Upload each image and set its name (use the emoji name from the filename)

## Emoji List
${pack.emojis.map(e => `- :${e.name}: ${e.aliases ? `(aliases: ${e.aliases.join(', ')})` : ''}`).join('\n')}

---
Downloaded from SlackDori - https://slackdori.asyncsite.com
`;
  
  zip.file('README.md', readme);
  
  // Create images folder
  const imgFolder = zip.folder('images');
  
  // Download and add each emoji image
  const downloadPromises = pack.emojis.map(async (emoji) => {
    try {
      const response = await fetch(emoji.imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        imgFolder?.file(`${emoji.name}.png`, blob);
      }
    } catch (error) {
      console.error(`Failed to download ${emoji.name}:`, error);
    }
  });
  
  // Wait for all downloads
  await Promise.all(downloadPromises);
  
  // Generate ZIP and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${pack.id}-emoji-pack.zip`);
}