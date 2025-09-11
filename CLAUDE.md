# SlackDori Frontend - Development Guidelines

## 🎯 Project Goal
Build an SEO-optimized Slack emoji pack installation service that ranks #1 for "slack emoji pack".

## 📋 Development Principles
1. **Ship Fast, Iterate Often** - MVP first, perfection later
2. **Measure, Don't Guess** - Use data to drive decisions  
3. **Simple > Complex** - Choose boring technology that works
4. **SEO is Revenue** - Every decision must consider SEO impact

## 🏗️ Tech Stack (Keep It Simple)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (utility-first)
- **State**: React hooks (useState/useContext)
- **Deployment**: Vercel (auto-deploy on push)

## 📁 Project Structure
```
src/app/           # Pages (file-based routing)
src/components/    # Reusable components (create as needed)
src/lib/           # Utilities (create as needed)
public/            # Static assets
```

## ✅ Development Workflow
> Installer path decision (2025-09):
> - Default path is Chrome Extension-based installer for non‑enterprise users.
> - Hide backend OAuth UI by default. Show only when `NEXT_PUBLIC_ENTERPRISE=true`.

### 1. Before Starting
```bash
git pull origin main
npm install
npm run dev
```

### 2. Making Changes
- Write code that works first
- Optimize only when measured performance issues exist
- Follow existing patterns in the codebase

### 3. Before Committing
```bash
npm run build  # Must succeed
git add .
git commit -m "type: brief description"
git push origin main
```

### 4. Commit Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting only
- `refactor:` Code restructuring
- `perf:` Performance improvement
- `test:` Adding tests

## 🚀 SEO Checklist (Every Page)
- [ ] Unique title and description
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Image alt texts
- [ ] Fast loading (< 2 seconds)
- [ ] Mobile responsive

## 📊 Success Metrics
1. **Development Speed**: Ship features daily
2. **SEO Performance**: Improve rankings weekly
3. **User Experience**: < 2s page load, > 90 Lighthouse score
4. **Code Quality**: It works, it's readable, it's maintainable

## ⚠️ Avoid These
- Premature optimization
- Over-engineering
- Perfect code that ships never
- Features without user validation

## 🔧 Quick Commands
```bash
npm run dev        # Development (port 4000)
npm run build      # Production build
npm run lint:fix   # Fix linting issues
```

## 📝 Notes
- Vercel auto-deploys on push to main
- Use GitHub issues for bug tracking
- Keep this document under 100 lines
- Update only when absolutely necessary

---
*Last updated: 2024-01-10*
*Principle: Done is better than perfect*