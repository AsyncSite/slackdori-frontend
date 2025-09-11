# Technical Decisions Log

## 2025-09-11: Installer Path Split (Enterprise vs Non‑Enterprise)

### Decision
- Backend server path (Slack Admin API) is Enterprise-only and will be decommissioned in production for now.
- Default installer for non‑enterprise users is a Chrome Extension-based client installer.

### Why
- Slack server-side emoji APIs for adding custom emojis require Enterprise Grid and org-admin user tokens (`user_scope=admin.emoji:write`).
- Most users (including current account) are non‑enterprise; server path leads to `invalid_scope`.

### Trade-offs
- Server features (queue/worker/progress) not used for non‑enterprise immediately.
- Client installer must handle page automation and throttling.

### Revisit When
- We have an Enterprise Grid org with proper admin tokens.
- Demand for server-driven installation resurfaces.

---

## 2024-01-10: Simplified Project Structure

### Decision
Remove all unnecessary complexity from initial setup.

### Why
- 952-line documentation but only 200 lines of code
- Over-engineered ESLint rules blocking development
- Premature optimization causing redirect loops

### Changes
- Reduced CLAUDE.md from 952 to 91 lines
- Simplified ESLint (warnings only, no blocking)
- Removed 20+ unused dependencies
- Simplified Next.js config from 232 to 18 lines

### Result
- Faster development velocity
- Clearer codebase
- Easier onboarding

---

## 2024-01-10: TypeScript Strict Mode OFF

### Decision
Disabled TypeScript strict mode for MVP phase.

### Why
- Slows down prototyping
- Not needed for MVP validation
- Can enable later when codebase stabilizes

### Trade-off
- Less type safety → Faster iteration
- Will revisit after product-market fit

---

## 2024-01-10: No Testing Framework (Yet)

### Decision
Removed Jest, Playwright, and testing infrastructure.

### Why
- No users yet = no need for regression testing
- Manual testing sufficient for MVP
- Setup time better spent on features

### When to Add
- After first paying customer
- When bug reports become frequent
- When team grows beyond 2 developers

---
*Purpose: Document the "why" behind technical choices*
*Rule: Every major technical decision gets an entry*