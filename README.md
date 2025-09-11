# SlackDori Frontend

One-click Slack emoji pack installation service.

> Important
> - For non‑enterprise Slack workspaces, installation is handled via a Chrome Extension-based client installer. No backend server is required.
> - The server (backend) path is Enterprise-only (requires `admin.emoji:write`). Production server will be taken down for now.

## 🚀 Quick Start

```bash
npm install
npm run dev     # http://localhost:4000
```

## 📁 Project Structure

```
src/app/        # Pages (Next.js App Router)
src/components/ # Reusable components
src/lib/        # Utility functions
public/         # Static assets
```

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) - Project phases and priorities
- [DECISIONS.md](./DECISIONS.md) - Technical decisions log
 - [docs/INSTALLER_EXTENSION.md](./docs/INSTALLER_EXTENSION.md) - Chrome Extension installer (non‑enterprise)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Utilities**: clsx, tailwind-merge
- **Deployment**: Vercel

## 🎯 Current Focus

Building MVP with:
1. Pack listing page
2. Pack detail page  
3. Slack OAuth integration
4. One-click installation

## 🔗 Links

- **Production**: https://slackdori-frontend.vercel.app
- **GitHub**: https://github.com/AsyncSite/slackdori-frontend

## 💡 Philosophy

> "Build it right, ship it fast"

Balance between best practices and rapid iteration.