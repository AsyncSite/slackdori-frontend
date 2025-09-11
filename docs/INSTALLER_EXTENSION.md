# Chrome Extension-based Installer (Non‑Enterprise)

## Summary
- Automates emoji uploads on Slack's customize page client-side.
- No backend server required for non‑enterprise users.

## How It Works
- Content script runs on `https://*.slack.com/customize/emoji`.
- Background worker fetches pack JSON/images (from GitHub Slack Emoji Packs) and streams blobs to content script.
- Content simulates drag&drop upload, fills name/aliases, submits, tracks progress.

## Permissions (Manifest V3)
```json
{
  "manifest_version": 3,
  "name": "SlackDori Emoji Installer",
  "version": "0.1.0",
  "permissions": ["storage"],
  "host_permissions": [
    "https://*.slack.com/customize/emoji*",
    "https://raw.githubusercontent.com/AsyncSite/slack-emoji-packs/*"
  ],
  "action": { "default_title": "Install Emoji Pack" },
  "background": { "service_worker": "background.js" },
  "content_scripts": [{
    "matches": ["https://*.slack.com/customize/emoji*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }]]
}
```

## Upload Loop (Pseudo)
```js
// background.js
async function fetchPack(packId) {
  const meta = await fetch(`${REPO}/packs/${packId}/pack.json`).then(r => r.json());
  const files = await Promise.all(meta.emojis.map(async e => ({
    name: e.name,
    aliases: e.aliases || [],
    blob: await fetch(`${REPO}${e.imageUrl}`).then(r => r.blob())
  })));
  return { meta, files };
}

// content.js
function simulateDrop(file) {
  const dt = new DataTransfer();
  dt.items.add(new File([file.blob], `${file.name}.png`, { type: file.blob.type || 'image/png' }));
  const target = document.querySelector('[data-qa="customize_emoji_drop_zone"]') || document.body;
  const ev = new DragEvent('drop', { dataTransfer: dt, bubbles: true });
  target.dispatchEvent(ev);
}
```

## UX
- Overlay progress bar, success/skip/fail counters, cancel button.
- Re-try with exponential backoff on UI throttles.

## Roadmap
- Bookmarklet fallback
- OffscreenCanvas resize for >128KB images
- Messaging from SlackDori site to extension (optional)
