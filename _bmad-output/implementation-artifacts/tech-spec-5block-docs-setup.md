---
title: '5BLOCK Documentation Setup'
slug: '5block-docs-setup'
created: '2026-01-31'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - Docusaurus 3.9.2
  - TypeScript 5.6
  - React 19
  - '@docusaurus/theme-mermaid'
files_to_modify:
  - documentation/docusaurus.config.ts
  - documentation/sidebars.ts
  - documentation/package.json
  - documentation/docs/intro.md
code_patterns:
  - TypeScript config files
  - MDX/Markdown docs with frontmatter (id, slug, title, sidebar_position)
  - Static assets in static/img/
test_patterns: []
---

# Tech-Spec: 5BLOCK Documentation Setup

**Created:** 2026-01-31

## Overview

### Problem Statement

The 5BLOCK project lacks comprehensive documentation. The current intro page mixes project presentation with setup instructions, and there's no structured content covering the tech stack, infrastructure, smart contracts, or features. The branding also uses a generic logo instead of the project's favicon.

### Solution

Restructure the Docusaurus documentation site with:
1. Proper branding using `favicon.webp` as the navbar logo
2. Rewritten intro as a project vision/presentation page
3. Organized technical documentation with Mermaid diagrams
4. Feature documentation for each app capability

### Scope

**In Scope:**
- Update navbar logo to `favicon.webp`
- Rewrite `intro.md` as project presentation (decentralization, ownership, scarcity, security vs. centralized systems)
- Create pages: Running the Project, Tech Stack, Technical Infrastructure, Sepolia Network, Smart Contracts & Tests
- Create Features category: Catalog, Inventory, Trade, History
- Update sidebar structure
- Add Mermaid diagrams in technical docs
- Install and configure `@docusaurus/theme-mermaid`

**Out of Scope:**
- Blog/news section
- Custom React components
- Deployment/hosting setup
- API reference generation

## Context for Development

### Codebase Patterns

- Docusaurus config uses TypeScript (`docusaurus.config.ts`)
- Sidebar config in `sidebars.ts` with `SidebarsConfig` type
- Docs use frontmatter: `id`, `slug`, `title`, `sidebar_position`
- Static assets in `static/img/`
- Current logo: `img/logo.svg` → replace with `img/favicon.webp`

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `documentation/docusaurus.config.ts` | Main config - logo, theme, navbar |
| `documentation/sidebars.ts` | Sidebar navigation structure |
| `documentation/package.json` | Dependencies - add Mermaid |
| `documentation/docs/intro.md` | Current intro - to be rewritten |
| `documentation/static/img/favicon.webp` | New logo asset (exists) |
| `contracts/PokemonCards.sol` | ERC721 NFT contract - content source |
| `contracts/TradeMarket.sol` | Marketplace contract - content source |
| `CLAUDE.md` | Project overview - content source |

### Technical Decisions

1. **Logo**: Use `favicon.webp` for navbar (single asset for both themes)
2. **Mermaid**: Install `@docusaurus/theme-mermaid` for diagrams
3. **Structure**: Categories for Getting Started, Technical, and Features

## Implementation Plan

### Tasks

- [ ] **Task 1: Install Mermaid dependency**
  - File: `documentation/package.json`
  - Action: Run `pnpm add @docusaurus/theme-mermaid` in documentation folder
  - Notes: Required for diagram rendering

- [ ] **Task 2: Update Docusaurus config**
  - File: `documentation/docusaurus.config.ts`
  - Action:
    - Change `navbar.logo.src` from `img/logo.svg` to `img/favicon.webp`
    - Add `markdown: { mermaid: true }` to config
    - Add `themes: ['@docusaurus/theme-mermaid']` to config
  - Notes: Enables Mermaid + updates branding

- [ ] **Task 3: Create directory structure**
  - Action: Create folders:
    - `documentation/docs/getting-started/`
    - `documentation/docs/technical/`
    - `documentation/docs/features/`
  - Notes: Organizes documentation by category

- [ ] **Task 4: Rewrite intro.md as project vision**
  - File: `documentation/docs/intro.md`
  - Action: Replace content with project presentation:
    - What is 5BLOCK
    - Problem with centralized Pokemon card trading
    - Solution: decentralization, true ownership, scarcity, security
    - Key value propositions
  - Notes: Remove all setup instructions (moved to running-the-project.md)

- [ ] **Task 5: Create Running the Project page**
  - File: `documentation/docs/getting-started/running-the-project.md`
  - Action: Create with frontmatter `id: running-the-project`, content:
    - Prerequisites (Node.js, pnpm, MetaMask)
    - Installation steps
    - Running local blockchain
    - Deploying contracts
    - Starting frontend
    - MetaMask configuration
    - Available commands table
  - Notes: Content adapted from current intro.md

- [ ] **Task 6: Create Tech Stack page**
  - File: `documentation/docs/technical/tech-stack.md`
  - Action: Create with frontmatter `id: tech-stack`, content:
    - Frontend stack (Next.js 14, TypeScript, wagmi, shadcn/ui, TanStack Query)
    - Blockchain stack (Solidity, OpenZeppelin, Hardhat)
    - External services (Pinata, PokeAPI, QuickNode)
  - Notes: Reference CLAUDE.md for accurate versions

- [ ] **Task 7: Create Infrastructure page with Mermaid diagram**
  - File: `documentation/docs/technical/infrastructure.md`
  - Action: Create with frontmatter `id: infrastructure`, content:
    - System architecture overview
    - Mermaid diagram showing: User → Frontend → Smart Contracts, Frontend → PokeAPI, Frontend → Pinata/IPFS
    - Component responsibilities
  - Notes: Keep diagram simple and readable

- [ ] **Task 8: Create Sepolia Network page**
  - File: `documentation/docs/technical/sepolia.md`
  - Action: Create with frontmatter `id: sepolia`, content:
    - Why Sepolia (Ethereum testnet, free ETH, production-like)
    - Network details (chainId: 11155111)
    - How to get Sepolia ETH (faucets)
    - MetaMask configuration for Sepolia
    - RPC endpoints used (QuickNode, public fallbacks)
  - Notes: Practical guide for developers

- [ ] **Task 9: Create Smart Contracts page with Mermaid diagrams**
  - File: `documentation/docs/technical/smart-contracts.md`
  - Action: Create with frontmatter `id: smart-contracts`, content:
    - PokemonCards.sol overview:
      - Constants table (MAX_CARDS, LOCK_DURATION, etc.)
      - Key functions (mint, getCardMeta, etc.)
      - Events
      - Mermaid: mint flow diagram
    - TradeMarket.sol overview:
      - Constants (COOLDOWN_DURATION)
      - Key functions (createOffer, acceptOffer, etc.)
      - Events
      - Mermaid: trade sequence diagram
    - Testing section (test files location, coverage target)
  - Notes: Keep concise, link to source files

- [ ] **Task 10: Create Catalog feature page**
  - File: `documentation/docs/features/catalog.md`
  - Action: Create with frontmatter `id: catalog`, content:
    - Feature purpose (browse and mint Pokemon cards)
    - How it works (PokeAPI data, rarity calculation)
    - Rarity tiers table
    - User flow
  - Notes: Reference rarity calculation from CLAUDE.md

- [ ] **Task 11: Create Inventory feature page**
  - File: `documentation/docs/features/inventory.md`
  - Action: Create with frontmatter `id: inventory`, content:
    - Feature purpose (view owned cards)
    - Max 4 cards limit explanation
    - Card metadata displayed
    - Lock status indicator
  - Notes: Explain the 4-card limit rationale

- [ ] **Task 12: Create Trade feature page with Mermaid diagram**
  - File: `documentation/docs/features/trade.md`
  - Action: Create with frontmatter `id: trade`, content:
    - Feature purpose (peer-to-peer card trading)
    - How offers work
    - Cooldown mechanism (5 min between actions)
    - Lock mechanism (10 min after acquisition)
    - Mermaid: offer lifecycle flowchart (Open → Accepted/Cancelled)
  - Notes: Explain why cooldowns exist (prevent spam)

- [ ] **Task 13: Create History feature page**
  - File: `documentation/docs/features/history.md`
  - Action: Create with frontmatter `id: history`, content:
    - Feature purpose (view transaction history)
    - Previous owners tracking (provenance)
    - Events displayed (CardMinted, CardTransferred, etc.)
  - Notes: Emphasize provenance as value-add

- [ ] **Task 14: Update sidebars.ts**
  - File: `documentation/sidebars.ts`
  - Action: Replace content with new structure:
    ```typescript
    const sidebars: SidebarsConfig = {
      tutorialSidebar: [
        { type: 'doc', id: 'intro', label: 'Introduction' },
        {
          type: 'category',
          label: 'Getting Started',
          items: ['getting-started/running-the-project'],
        },
        {
          type: 'category',
          label: 'Technical',
          items: [
            'technical/tech-stack',
            'technical/infrastructure',
            'technical/sepolia',
            'technical/smart-contracts',
          ],
        },
        {
          type: 'category',
          label: 'Features',
          items: [
            'features/catalog',
            'features/inventory',
            'features/trade',
            'features/history',
          ],
        },
      ],
    };
    ```
  - Notes: Categories collapsed by default

- [ ] **Task 15: Test build**
  - Action: Run `cd documentation && pnpm build`
  - Notes: Verify no broken links, Mermaid renders, logo displays

### Acceptance Criteria

- [ ] **AC 1**: Given the docs site is running, when viewing the navbar, then the favicon.webp logo is displayed instead of logo.svg
- [ ] **AC 2**: Given the intro page is loaded, when reading content, then it presents the project vision without setup instructions
- [ ] **AC 3**: Given the Running the Project page exists, when following the instructions, then a developer can successfully run the project locally
- [ ] **AC 4**: Given the Technical section exists, when navigating to it, then all 4 pages (tech-stack, infrastructure, sepolia, smart-contracts) are accessible
- [ ] **AC 5**: Given the Features section exists, when navigating to it, then all 4 pages (catalog, inventory, trade, history) are accessible
- [ ] **AC 6**: Given a page with Mermaid diagrams, when the page loads, then the diagrams render correctly
- [ ] **AC 7**: Given the sidebar, when expanded, then it shows Introduction, Getting Started, Technical, and Features categories in order
- [ ] **AC 8**: Given the project, when running `pnpm build` in documentation folder, then the build succeeds with no errors

## Additional Context

### Dependencies

- `@docusaurus/theme-mermaid` - Required for Mermaid diagram support

### Testing Strategy

1. **Build test**: Run `pnpm build` - must succeed
2. **Visual verification**:
   - Logo displays correctly in navbar
   - Mermaid diagrams render
   - Sidebar structure is correct
3. **Link check**: No broken internal links
4. **Content review**: All pages have meaningful content, no placeholders

### Notes

- **Content sources**: CLAUDE.md, PokemonCards.sol, TradeMarket.sol
- **Rarity formula**: Score = HP + Attack + Defense
- **Networks**: Hardhat local (31337), Sepolia (11155111)
- **External services**: Pinata (IPFS), PokeAPI, QuickNode (RPC)
- **Future consideration**: API reference auto-generation from contracts (out of scope)
