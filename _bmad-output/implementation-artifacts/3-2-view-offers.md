# Story 3.2: View Offers

Status: review

## Story

As a **user**,
I want **to see all open trade offers**,
So that **I can find an interesting trade**.

## Acceptance Criteria

1. **AC-3.2.1:** The `/trade` page displays list of offers with "Open" status
2. **AC-3.2.2:** Each offer displays: offered card, requested card, maker address
3. **AC-3.2.3:** Card images and names loaded from IPFS
4. **AC-3.2.4:** Indicator shows if user owns the requested card
5. **AC-3.2.5:** "Accept" button visible if user can accept
6. **AC-3.2.6:** Filtering possible by: card type, rarity (deferred - nice to have)
7. **AC-3.2.7:** User's own offers marked "Your offer"
8. **AC-3.2.8:** Skeleton loader displays during loading
9. **AC-3.2.9:** Message if no open offers

## Tasks / Subtasks

- [x] **Task 1:** Implement `useOpenOffers` hook (AC: 3.2.1, 3.2.2, 3.2.3, 3.2.4)
  - [x] Subtask 1.1: Fetch open offers from TradeMarket contract
  - [x] Subtask 1.2: Fetch card details (tokenURI, owner, isLocked) for each card
  - [x] Subtask 1.3: Fetch IPFS metadata for card images and names
  - [x] Subtask 1.4: Calculate `isMyOffer` and `canAccept` flags
  - [x] Subtask 1.5: Return enriched offers with all data

- [x] **Task 2:** Create `OfferCard` component (AC: 3.2.2, 3.2.3, 3.2.5, 3.2.7)
  - [x] Subtask 2.1: Display offer ID and badges ("Your Offer", "Can Accept")
  - [x] Subtask 2.2: Display maker's card (image, name, "Offered" label)
  - [x] Subtask 2.3: Display taker's card (image, name, "Requested" label)
  - [x] Subtask 2.4: Display arrow between cards for visual flow
  - [x] Subtask 2.5: Display maker address and created timestamp
  - [x] Subtask 2.6: Add "Accept" button if `canAccept` is true
  - [x] Subtask 2.7: Add "Cancel" button if `isMyOffer` is true

- [x] **Task 3:** Create `OfferCardSkeleton` component (AC: 3.2.8)
  - [x] Subtask 3.1: Create skeleton matching OfferCard layout
  - [x] Subtask 3.2: Add pulse animation for loading effect

- [x] **Task 4:** Update `/trade` page with offers list (AC: 3.2.1, 3.2.8, 3.2.9)
  - [x] Subtask 4.1: Add tabs for "All Offers", "Can Accept", "My Offers"
  - [x] Subtask 4.2: Display skeleton loaders while loading
  - [x] Subtask 4.3: Display empty state message when no offers
  - [x] Subtask 4.4: Display offers grid with OfferCard components
  - [x] Subtask 4.5: Handle Accept button click (placeholder for US-3.3)
  - [x] Subtask 4.6: Handle Cancel button click (placeholder for US-3.4)

- [x] **Task 5:** Add utility functions
  - [x] Subtask 5.1: `formatAddress` - truncate Ethereum addresses
  - [x] Subtask 5.2: `formatTimestamp` - format Unix timestamps

- [x] **Task 6:** Update TradeMarket contract (if needed)
  - [x] Subtask 6.1: Verify `getOpenOffers` function exists (already exists from US-3.1)
  - [x] Subtask 6.2: `getTotalOffers` already exists

- [ ] **Task 7:** Manual testing
  - [ ] Subtask 7.1: Test with no offers (empty state)
  - [ ] Subtask 7.2: Test with multiple offers
  - [ ] Subtask 7.3: Test "Your Offer" badge
  - [ ] Subtask 7.4: Test "Can Accept" badge and button
  - [ ] Subtask 7.5: Test tab filtering

## Dev Notes

### Epic Context

This story is part of **Epic 3: Trade Marketplace**. It depends on US-3.1 (Create Offer) and blocks US-3.3 (Accept Offer) and US-3.4 (Cancel Offer).

**Related Stories:**
- Story 3.1: Create Offer (must be complete - offers must exist)
- Story 3.3: Accept Offer (Accept button will route here)
- Story 3.4: Cancel Offer (Cancel button will route here)

### Business Rules

**Offer display logic:**
1. Only show offers with `status === 0` (Open)
2. Mark as "Your Offer" if `maker === connectedAddress`
3. Mark as "Can Accept" if:
   - User is NOT the maker
   - User owns the requested card
   - Requested card is NOT locked

**Data loading strategy:**
1. Load all offer IDs from contract
2. Batch fetch offer details
3. Batch fetch card details (tokenURI, owner, isLocked)
4. Batch fetch IPFS metadata
5. Combine all data into enriched offers array

### Architecture Requirements

**From architecture.md:**

**Hook Organization:**
- Place in `src/hooks/` directory
- Follow naming: `useOpenOffers`
- Use `useReadContract` and `useReadContracts` for batch reads
- Use `useQueries` from React Query for IPFS metadata

**Component Organization:**
- `OfferCard.tsx` in `src/components/`
- `OfferCardSkeleton.tsx` in `src/components/`
- Follow flat structure

**Performance Considerations:**
- Batch all contract calls to minimize RPC requests
- Cache IPFS metadata indefinitely (`staleTime: Infinity`)
- Use skeleton loaders to improve perceived performance

### Technical Stack

**Frontend:**
- Next.js 14 App Router
- wagmi 2.x + viem 2.x
- @tanstack/react-query 5.x
- date-fns for timestamp formatting

**Data Flow:**
```
TradeMarket.getOpenOffers() → offer IDs
↓
TradeMarket.getOffer(id) → offer details
↓
PokemonCards.tokenURI/ownerOf/isLocked → card details
↓
IPFS fetch → metadata (images, names)
↓
Combine → enriched offers
```

### File Structure

**New files to create:**
```
src/hooks/
└── useOpenOffers.ts          # Main hook for fetching offers

src/components/
├── OfferCard.tsx             # Individual offer display
└── OfferCardSkeleton.tsx     # Loading skeleton

src/lib/
└── utils.ts                  # Add formatAddress utility
```

**Existing files to modify:**
```
src/app/trade/page.tsx        # Add offers list with tabs
```

### Dependencies

**Must be complete before this story:**
- US-3.1: Create Offer (TradeMarket contract deployed, offers exist)

**Blocks these stories:**
- US-3.3: Accept Offer (uses Accept button from OfferCard)
- US-3.4: Cancel Offer (uses Cancel button from OfferCard)

### UI/UX Requirements

**Tabs:**
- "All Offers (N)" - shows all open offers
- "Can Accept (N)" - shows offers user can accept
- "My Offers (N)" - shows offers created by user

**Card Layout:**
```
┌─────────────────────────────────────┐
│ Offer #0              [Your Offer]  │
│ ─────────────────────────────────── │
│                                     │
│   🖼️  Pikachu    →    Charizard 🖼️  │
│   Offered           Requested      │
│                                     │
│ By 0x1234...abcd                    │
│ 2 hours ago                [Accept] │
└─────────────────────────────────────┘
```

**Loading State:**
- Show 4 skeleton cards in grid layout

**Empty State:**
- Icon + message depending on active tab
- "No open offers yet. Create the first one!"
- "No offers you can accept right now."
- "You haven't created any offers yet."

### Implementation Hints

**1. Batch fetching card details:**
```typescript
const uniqueCardIds = [...new Set(allCardIds.map(id => id.toString()))].map(BigInt);

const cardDataQueries = useReadContracts({
  contracts: uniqueCardIds.flatMap(tokenId => [
    { functionName: 'tokenURI', args: [tokenId] },
    { functionName: 'ownerOf', args: [tokenId] },
    { functionName: 'isLocked', args: [tokenId] },
  ]),
});
```

**2. Building data map:**
```typescript
const cardDataMap = new Map();
uniqueCardIds.forEach((tokenId, i) => {
  const baseIndex = i * 3;
  cardDataMap.set(tokenId.toString(), {
    tokenURI: data[baseIndex],
    owner: data[baseIndex + 1],
    isLocked: data[baseIndex + 2],
  });
});
```

**3. Tab filtering:**
```typescript
const displayedOffers = {
  all: offers,
  mine: offers.filter(o => o.isMyOffer),
  acceptable: offers.filter(o => o.canAccept),
}[activeTab] ?? offers;
```

### References

- [Source: specifications/user-stories/US-3.2-view-offers.md]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3]
- [Source: _bmad-output/planning-artifacts/architecture.md]

### Project Structure Notes

**Alignment with unified project structure:**
- Hooks in `src/hooks/`
- Components in `src/components/` (flat structure)
- Utilities in `src/lib/utils.ts`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Implementation Plan

**Strategy:** Build viewing layer for offers with batch data loading and enrichment.

1. Create `useOpenOffers` hook with optimized batch fetching
2. Create utility functions for formatting (formatAddress, formatTimestamp)
3. Create UI components (OfferCard, OfferCardSkeleton)
4. Update /trade page with tabs and offer list
5. Implement empty states and loading states

**Approach rationale:** Batch all contract calls to minimize RPC requests. Cache IPFS metadata indefinitely since it's immutable. Use skeleton loaders for better perceived performance.

### Debug Log

No significant debug issues encountered. Linting passed after removing unused variable.

**Data Flow:**
1. `getOpenOffers()` → array of offer IDs
2. Batch `getOffer(id)` → offer details
3. Extract unique card IDs from all offers
4. Batch fetch card data (tokenURI, owner, isLocked) - 3 calls per card
5. Batch fetch IPFS metadata for all unique tokenURIs
6. Build card data map from results
7. Enrich each offer with card data and compute flags

### Completion Notes

**Implemented:**
- ✅ `useOpenOffers` hook with comprehensive data enrichment
- ✅ Batch fetching strategy to minimize RPC calls
- ✅ `OfferCard` component with swap visualization
- ✅ `OfferCardSkeleton` with pulse animation
- ✅ Tab filtering (All/Can Accept/My Offers)
- ✅ Empty states for each tab
- ✅ Loading states with skeleton loaders
- ✅ `formatAddress` and `formatTimestamp` utilities
- ✅ Badges for "Your Offer" and "Can Accept"
- ✅ Accept/Cancel button placeholders (route to US-3.3 and US-3.4)

**Technical Highlights:**
- **Performance:** Batch all contract calls (reduced from N*4 calls to 1 + N + unique_cards*3)
- **IPFS Caching:** Set `staleTime: Infinity` since metadata is immutable
- **Type Safety:** Full TypeScript types for all offer data
- **User Experience:** Skeleton loaders improve perceived performance

**Deferred:**
- ⏳ Manual testing (Task 7) - requires deployed contracts and test data
- ⏳ Accept/Cancel functionality (US-3.3 and US-3.4)
- ⏳ Filtering by card type/rarity (AC-3.2.6 - deferred as nice-to-have)

### File List

**New files created:**
- frontend/src/hooks/useOpenOffers.ts
- frontend/src/components/OfferCard.tsx
- frontend/src/components/OfferCardSkeleton.tsx

**Modified files:**
- frontend/src/app/trade/page.tsx (added offers list with tabs)
- frontend/src/lib/utils.ts (added formatAddress and formatTimestamp)

## Change Log

**2026-01-20:** Story 3.2 implementation completed
- Created useOpenOffers hook with batch data loading and enrichment
- Implemented OfferCard component with swap visualization
- Implemented OfferCardSkeleton for loading states
- Added tab filtering (All Offers / Can Accept / My Offers)
- Added utility functions formatAddress and formatTimestamp
- Updated /trade page with complete offers display
- All acceptance criteria satisfied except AC-3.2.6 (filtering by type/rarity - deferred)
