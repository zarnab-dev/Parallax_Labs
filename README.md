# NorthlineGoods — E-commerce Storefront

A production-grade e-commerce storefront, built incrementally over a
multi-week frontend internship. Each week adds a scoped set of features on
top of a stable, working foundation.

**Current status: Week 6 of 6 — PWA, Performance & Launch (final).**

---

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | SSR/SSG, built-in image optimization, and a straightforward path to PWA/offline support required in later weeks. |
| Styling | Tailwind CSS (`darkMode: "class"`) | Fast, consistent utility styling; class-based dark mode is simple to toggle and persist. |
| Mock API | MSW in development + Storybook; Next.js route handlers in production | One shared logic module (`src/lib/catalogApi.ts`) backs both. MSW intercepts real `fetch` calls in the browser so components are written as they would be against a real backend; in production the same endpoints are real route handlers, because MSW needs a service worker and the PWA needs the same scope (see Key technical decisions). |
| PWA / offline | Hand-written service worker (`scripts/sw-template.js` → `public/sw.js`) | No extra dependency, full control over caching and the update flow, and it is directly testable in a real browser. |
| Performance tooling | `@next/bundle-analyzer`, a bundle-budget script, Lighthouse CI (`@lhci/cli`) | Bundle analysis, enforced size budgets, and automated performance/accessibility/best-practice/SEO scoring in CI. |
| Cart state | XState 5 (`@xstate/react`) | Guarded, explicit transitions for quantity/stock rules; a standalone machine now so it composes as a child of the Week 3+ checkout machine instead of being rewritten. |
| Checkout flow | XState 5 | Cart → Shipping → Payment → Confirmation as an explicit state chart, with guarded step transitions and an async payment-submission state — exactly the "complex, guarded, asynchronous flow" XState is for. |
| Real-time inventory | `BroadcastChannel`, behind a WebSocket-shaped client | This project has no real backend to push events from; `BroadcastChannel` is the correct native primitive for same-origin cross-tab sync. It's wrapped in a class with the same lifecycle/reconnect shape as a real `WebSocket`, so swapping in a real server later is a one-file change, not a rewrite. |
| 3D product viewer | Three.js + React Three Fiber + drei | Required by the master roadmap (Option A). Lazy-loaded via `next/dynamic` so the ~670KB bundle never ships to anyone who doesn't open the 3D tab. |
| Testing | Vitest | Lightweight, fast, zero-config TypeScript test runner — used to unit test the cart machine's transitions and guards. |
| Component workshop | Storybook 8 | Isolated development and visual testing of UI primitives, independent of app routing/data. |
| Fonts/icons | System font stack, inline SVG | Zero external network calls — keeps the app fully self-contained and fast. |

No state-management, animation, or 3D libraries have been added yet — those
arrive in the weeks that actually need them (cart/checkout state, the 3D
product viewer, etc.), per the "don't add unnecessary libraries" principle.

---

## Getting started

**Requirements:** Node.js 20+ and npm.

```bash
npm install
npm run dev        # http://localhost:3000  (MSW mocks the API in the browser)
```

To run it the way it ships (with the service worker / PWA features):

```bash
npm run build      # generates public/sw.js, then builds
npm run start      # http://localhost:3000
```

Open it in Chrome, let the page load once, and the app is installable
(address-bar install icon) and browsable offline. The service worker is
registered in production builds only, so it never gets in the way of
development.

There is no backend to configure. The only optional environment variable is
`MOCK_API_FAILURE_RATE` (0–1): the mock cart endpoint deliberately fails ~12%
of the time to exercise the optimistic-update rollback (Week 3); set it to `0`
for deterministic runs (e.g. end-to-end tests).

### Scripts

```bash
npm run dev                # development server
npm run build              # production build (prebuild generates public/sw.js)
npm run start              # serve the production build
npm run lint               # ESLint
npm run typecheck          # tsc --noEmit
npm run test               # all unit tests once (Vitest) — 51 tests
npm run test:watch         # Vitest watch mode
npm run analyze            # production build + bundle treemaps in .next/analyze/
npm run budget             # enforce gzipped bundle-size budgets (run after build)
npm run lhci               # Lighthouse CI (run after build) — reports in .lighthouseci/
npm run icons              # regenerate the PWA icons in public/icons/
npm run storybook          # Storybook dev server → http://localhost:6006
npm run build-storybook    # static Storybook build
npm run msw:init           # regenerate public/mockServiceWorker.js if ever deleted
```

> **Notes**
> - `public/mockServiceWorker.js` is MSW's worker, used in development and
>   Storybook only. It is committed so the app works right after
>   `npm install`; regenerate it with `npm run msw:init` if removed.
> - `public/sw.js` is the PWA worker. It is **generated** at build time (and
>   git-ignored) so every deployment gets a new version id, which is what
>   triggers the "new version available" prompt.
> - CI (`.github/workflows/ci.yml`) runs typecheck, lint, tests, build,
>   the bundle budgets and Lighthouse CI on every push and pull request.

---

## Project structure

```
src/
  app/                     # Next.js App Router routes
    layout.tsx             # root layout: theme boot script, providers, header/footer, PWA status
    page.tsx                # catalog page ("/") — server-rendered with the full product list
    products/[slug]/page.tsx  # product detail page (statically generated)
    checkout/page.tsx       # multi-step checkout
    offline/page.tsx        # offline fallback screen (precached by the service worker)
    manifest.ts             # web app manifest
    api/                    # production mock API (route handlers): products, categories, cart/sync
    globals.css
  components/
    ui/                     # design-system primitives (Button, Input, Card, Badge, Select, Skeleton, QuantityStepper, ProductImage)
    catalog/                # catalog-specific components (ProductCard, SearchBar, CategoryFilter, ViewToggle, ProductGrid, ImageGallery, ProductPurchasePanel, states)
    cart/                   # CartDrawer
    checkout/               # CheckoutSteps, CartStep, ShippingStep, PaymentStep, ConfirmationStep
    inventory/              # ConnectionStatusBadge
    catalog/ProductMediaPanel.tsx  # Photos / View in 3D tab toggle
    layout/                 # Header, Footer
    theme/                  # ThemeProvider, ThemeToggle
    toast/                  # ToastProvider (custom, no added dependency)
  features/
    cart/                   # cartMachine (XState), CartProvider, cartApi (sync endpoint client), tests
    checkout/                # checkoutMachine (XState), validation, types
    inventory/               # InventorySocket (mock WS over BroadcastChannel), InventoryProvider,
                              # connectionStatus + inventoryReducer (pure, tested) logic
    productViewer3d/         # ProductViewer3D (lazy wrapper), ProductViewer3DCanvas (R3F),
                              # ProceduralProductMesh, shapeForCategory, colorForCategory
    pwa/                     # PwaStatus: service-worker registration, update prompt, offline banner
  lib/                      # catalogApi (shared mock-API logic), data hooks, optimisticAction, reconnectBackoff, webglSupport, utilities
  mocks/                    # MSW handlers, browser/node setup, MockingProvider (development + Storybook only)
  data/                     # generated seed data (products.json)
  types/                    # shared TypeScript types
scripts/
  generate-seed-data.mjs    # regenerates src/data/products.json + product artwork (SVG)
  generate-icons.mjs        # regenerates the PWA icons (dependency-free)
  sw-template.js            # service worker source; generate-sw.mjs stamps it into public/sw.js
  generate-sw.mjs           # prebuild step
  check-bundle-budgets.mjs  # bundle-size budget enforcement
docs/
  wireframes/               # lo-fi wireframes (Catalog, Product Details, Cart, Checkout)
public/
  images/products/          # generated SVG product artwork (3 views per product)
  icons/                    # PWA icons (any + maskable + apple-touch)
  mockServiceWorker.js      # MSW's worker (dev/Storybook)
  sw.js                     # PWA service worker (generated at build, git-ignored)
.github/workflows/ci.yml    # typecheck, lint, tests, build, budgets, Lighthouse CI
bundle-budgets.json         # per-route gzipped First Load JS budgets
lighthouserc.json           # Lighthouse CI configuration and assertions
.storybook/                  # Storybook configuration
```

Path alias `@/*` resolves to `src/*` (configured in `tsconfig.json`).

---

## Implemented features (Week 6 — new/changed this week)

- **Installable PWA with offline browsing** — web app manifest (standalone,
  icons incl. maskable), plus a service worker. Verified in headless
  Chromium that Chrome reports **no installability errors**. Caching
  strategy:

  | Request | Strategy |
  |---|---|
  | Page navigations | network-first (3 s timeout when a cached copy exists) → cached page → `/offline` |
  | `/_next/static/*` (hashed JS/CSS) | cache-first |
  | `/images/*`, `/icons/*` | stale-while-revalidate |
  | `GET /api/products`, `/api/categories` | network-first with cache fallback |
  | POSTs, cross-origin, Next RSC prefetches | not intercepted |

  On install it precaches the app shell: the home and offline pages, their
  hashed JS/CSS, and the card image for every product, so the catalog works
  offline after the *first* visit. Other pages (product pages, checkout)
  become available offline once visited.
- **Offline behaviour in the UI** — a fixed "You're offline" banner;
  search/category filtering falls back to filtering the already-loaded
  catalog locally instead of showing an error; cart changes made offline are
  rolled back with a clear message ("You're offline — that cart change
  couldn't be saved and was reverted.").
- **Version-update notification** — each deployment stamps a new build id
  into the worker. A new worker installs in the background and *waits*;
  the page shows "A new version of the store is available" with **Reload** /
  **Later**. Reload tells the waiting worker to take over and reloads once
  it has; the old version's caches are pruned on activation. Update checks
  also run whenever the tab becomes visible again.
- **Bundle analysis, budgets, lazy loading** — `npm run analyze` produces
  treemaps; `npm run budget` fails the build if any route's gzipped First
  Load JS exceeds `bundle-budgets.json`, or if the Three.js chunk ever leaks
  into any route's initial JS. App Router already code-splits per route;
  beyond that the 3D viewer (Week 5) and now the cart drawer are loaded on
  demand. MSW is no longer shipped to production at all.
- **Image optimization** — all product imagery goes through one
  `ProductImage` wrapper over `next/image`: responsive `sizes`, lazy loading
  by default, `priority` (preload) for the first row of cards (the LCP
  element), and reserved aspect-ratio boxes so nothing shifts (CLS 0).
  SVGs are served directly (already vector and tiny; routing them through
  `/_next/image` would only add a request); raster images added later get
  the AVIF/WebP + `srcset` pipeline automatically.
- **Server-rendered catalog** — the home page now ships the full grid in
  its HTML instead of a spinner that waited for the mock-API worker, which
  is what moved the catalog from a Lighthouse performance score of 86 to 99.
- **Product artwork** — the generic gradient placeholders (which also had a
  stray "— view 1" caption baked into the image) are replaced by an
  illustration per category (shoe, shirt, bag, headphones, mug, tent) in
  three views. These are drawn illustrations, not photographs.
- **Lighthouse CI** — `lighthouserc.json` runs 3 mobile-profile runs on the
  catalog, a product page and checkout, asserting performance,
  accessibility, best-practices and SEO ≥ 0.95 (median run), CLS ≤ 0.01 and
  TBT ≤ 200 ms, with LCP ≤ 2.5 s as a warning. Wired into GitHub Actions.
- **Fixes found while testing** — checkout "upcoming step" labels failed
  colour contrast (accessibility 96 → 100); removed the stale "checkout
  arrives later" note from the product page; the offline fallback screen's
  own scripts weren't precached, so an unvisited page offline crashed
  instead of showing it (now precached and verified); and the Week 5 3D
  viewer downloaded an HDR environment map from a public CDN at runtime,
  which broke offline use and, with no error boundary, crashed the whole
  page when the download failed. The viewer is now lit entirely locally
  (no network requests) and wrapped in an error boundary that shows a
  message instead of crashing; Tailwind wasn't scanning `src/features/`, so
  the offline banner and update prompt were rendered unstyled (now fixed);
  and the footer still said "Week 1".

## Performance benchmark results

Measured on the production build (`npm run build && npm run start`) with
Lighthouse 12.2.1, default **mobile** configuration (simulated slow 4G, 4×
CPU slowdown), headless Chromium 131, **median of 3 runs**.

| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Catalog `/` | **99** (98–99) | 100 | 100 | 100 | 0.8 s | 2.0 s | 0 ms | 0 |
| Product `/products/p001-…` | **99** | 100 | 100 | 100 | 0.8 s | 2.0 s | 0 ms | 0 |
| Checkout `/checkout` | **100** | 100 | 100 | 100 | 0.8 s | 1.8 s | 0 ms | 0 |

Before this week (Week 5 build, single run): catalog **86** (LCP 3.9 s),
product page **96** (LCP 2.7 s).

Bundle sizes (gzipped First Load JS, from `npm run budget`):

| Route | Size | Budget |
|---|---|---|
| `/` | 104.8 kB | 113 kB |
| `/products/[slug]` | 118.6 kB | 128 kB |
| `/checkout` | 113.6 kB | 123 kB |
| `/offline` | 95.0 kB | 103 kB |
| 3D viewer chunk (lazy, only on "View in 3D") | 231.7 kB | 250 kB |

**Honest notes.** The catalog and product pages score 99, not 100: the
remaining points are the ~5.5 kB render-blocking stylesheet and the React/Next
framework JavaScript (~88 kB of the ~105 kB). I tried inlining the CSS
(`experimental.optimizeCss` + `critters`); it has no effect on App Router
pages, so it was reverted rather than left as dead config. Lighthouse scores
vary between runs and machines — across ~12 runs of the catalog page I saw
98–99 every time except one outlier of 83 (a single 640 ms blocking-time
spike right after heavy browser testing in the same sandbox, not reproduced
in 4 further runs) — so the CI assertions use a 0.95 floor on the **median**
of three runs rather than demanding exactly 100.
These numbers come from a sandboxed machine, not a real phone — run
`npm run lhci` (or check the CI artifact) on your own hardware before
quoting them.

## Implemented features (Week 5)

- **Interactive 3D product viewer** — the product detail page now has
  "Photos" / "View in 3D" tabs. The 3D tab renders a React Three Fiber
  scene: ambient + hemisphere + directional lighting, a drop shadow, and
  `OrbitControls` for drag/pinch rotation and
  zoom, auto-rotating until the person interacts.
- **Procedural meshes instead of fake `.gltf` loading** — this catalog has
  no real product 3D scans, and there's no legitimate source to fetch
  placeholder ones from, so each category (Footwear, Apparel, Accessories,
  Electronics, Home, Outdoor) maps to a distinct shape built from Three.js
  primitives, colored to match that category's 2D placeholder palette. See
  "Key technical decisions" below for the full reasoning.
- **Genuinely lazy-loaded** — the 3D viewer (and the entire
  Three.js/React-Three-Fiber/drei stack, ~670KB) is loaded via
  `next/dynamic({ ssr: false })` and only fetched the moment someone opens
  the 3D tab. Verified in the production build: the product page's First
  Load JS moved from 120KB to 121KB after adding the whole 3D stack — the
  3D bundle sits in its own separate chunk, not the shared one.
- **WebGL fallback** — `isWebGLAvailable()` checks for a WebGL context
  before ever mounting the canvas; if unavailable, a clear message points
  the person back to the Photos tab instead of a blank/broken canvas.
- **Accessible controls** — the viewer container is a focusable
  `role="img"` region with a descriptive label; arrow keys rotate the
  camera (azimuth/polar angle, clamped) for keyboard users alongside
  drag/touch, and an explicit "Auto-rotate" / "Stop rotation" button (real
  `<button>`, not just a pointer gesture) controls the one piece of
  automatic motion.
- **Fix carried over from earlier weeks** — removed an outdated note on the
  product page saying checkout "arrives in a later week" (checkout has
  existed since Week 3).
- **Skeleton placeholder** — both while the 3D chunk downloads and while
  WebGL support is being checked, a `Skeleton` matching the gallery's
  aspect ratio is shown, avoiding layout shift.

## Implemented features (Week 4)

- **Real-time inventory sync across tabs** — `InventorySocket` behaves like a
  real WebSocket client (connect/reconnect lifecycle, status callbacks) but
  is backed by `BroadcastChannel`, the browser's native same-origin
  cross-tab messaging primitive. Open the same product in two tabs; buy it
  in one, and the other's stock badge/quantity cap updates immediately,
  with no page refresh.
- **Reconnection with exponential backoff** — a simulated connection drop
  (for demonstration, since there's no real network to actually fail) is
  handled by `computeBackoffDelay`, doubling the retry delay each attempt
  up to a 30s cap, resetting to the base delay after a successful
  reconnect.
- **Connection status indicator** — a small "Live / Reconnecting… / Offline"
  badge in the header (`role="status"`, `aria-live="polite"`).
- **Cart/checkout fully decoupled from the socket** — purchases are
  broadcast with a fire-and-forget `send()`; if the channel is unavailable
  or a broadcast fails, it's silently swallowed. Checkout's confirmation
  step never awaits the socket, so a dropped connection mid-checkout
  cannot block or fail an order — worst case, another tab simply doesn't
  see that particular stock update live.
- **Automated tests for real-time update behavior** — since the actual
  socket relies on `BroadcastChannel` and timers (awkward to unit test
  reliably), the underlying logic is extracted into pure, deterministic
  functions and fully tested instead: `reconnectBackoff` (6 tests),
  `connectionStatusReducer` (7 tests, including a full
  disconnect-and-recover cycle), and `applyInventoryMessage` (6 tests,
  including stock clamped at 0 and other variants left untouched) — 19 new
  tests, 36 total. The end-to-end socket/multi-tab behavior itself is
  verified manually (see Testing section below).

## Implemented features (Week 3)

- **Optimistic cart updates with automatic rollback** — every cart mutation
  (add/remove/change quantity) applies to the UI immediately, then confirms
  against a mock `/api/cart/sync` endpoint. If that call fails (simulated
  transient failures, or a real stock re-check), the UI is rolled back to
  its exact prior state and the person sees why via a toast. Built as a
  small, reusable `runOptimisticAction` helper, independent of React/XState,
  so it's directly unit-testable.
- **Multi-step checkout (XState)** — a new `checkoutMachine` drives
  **Cart → Shipping → Payment → Confirmation**. Shipping/payment steps are
  guarded: `SUBMIT_SHIPPING`/`SUBMIT_PAYMENT` only transition when the form
  passes validation. Payment has its own `editing → processing` sub-flow
  around an async submission (mocked, ~700ms), landing back in `editing`
  with an error on failure or advancing to `confirmation` on success.
- **Checkout UI** — step progress indicator, cart review step, shipping
  form, payment form (with a documented test "decline" card number for
  reliably exercising the failure path), and a confirmation screen. The
  cart is cleared only once confirmation is actually reached, so an
  abandoned or failed checkout leaves the cart intact.
- **Comprehensive client-side form validation** — shared `validateShipping`
  / `validatePayment` functions (required fields, email format, postal code
  shape, card number/expiry/CVC format) used both as the machine's guards
  and for the inline field errors shown in each form, so the two can never
  disagree.
- **Unit tests for the optimistic update logic** — `optimisticAction.test.ts`
  (7 tests) verifies apply-before-sync ordering, no rollback on success,
  rollback + error message on failure, and exact prior-state restoration.

## Implemented features (Week 2)

- **Product image gallery** — each product now has 3 images; the detail page
  shows an accessible gallery (`role="tablist"`, keyboard-reachable
  thumbnails, `aria-current`/`aria-selected`, descriptive alt text per view).
- **Cart state machine (XState)** — `cartMachine` handles `ADD_ITEM`,
  `REMOVE_ITEM`, `SET_QUANTITY`, `CLEAR_CART`, with quantity guarded to
  `[1, variant.stock]` at the machine level (the single source of truth),
  surfacing a `lastError` message the UI turns into a toast or inline error.
- **Cart UI** — a slide-over `CartDrawer` (opened from the Header's cart
  icon, now enabled) listing items with image, variant, quantity stepper,
  remove action, and a live subtotal. Focus moves to the drawer's close
  button on open and `Escape` closes it.
- **Quantity validation** — a shared `QuantityStepper` component used on
  both the product detail page and in the cart drawer gives immediate
  inline errors for non-numeric input, quantities below 1, or above
  available stock — while the machine's guard remains authoritative.
- **Toast notifications** — a small custom `ToastProvider` (no added
  dependency) shows success (added to cart) and error (out of stock,
  quantity clamped) feedback app-wide, with `role="status"`/`role="alert"`
  and auto-dismiss.
- **Unit tests** — `cartMachine.test.ts` (Vitest) covers adding, stacking
  quantity on repeat add, clamping to stock, rejecting out-of-stock adds,
  valid/invalid `SET_QUANTITY`, remove, and clear — 10 tests, all passing.

## Implemented features (Week 1)

- **Responsive, mobile-first product catalog** — 2 columns on mobile, up to
  4 on desktop, built with a single `ProductGrid` component reused across
  loading/empty/error/loaded states.
- **Grid / list view toggle** — same data, two layouts, via `ViewToggle`.
- **Search** — debounced (250ms), race-condition-safe (stale responses are
  discarded), queries title/description/tags.
- **Category filtering** — dropdown populated from the mock API's live
  category list.
- **Skeleton loading states** — shape-matched skeletons for both grid and
  list views, with `aria-busy`/`aria-live` for screen readers.
- **Empty and error states** — distinct, accessible states with a retry
  action on error.
- **Dark mode** — class-based, persisted to `localStorage`, with a
  pre-hydration inline script to prevent a light/dark flash on load.
- **Accessible UI primitives** — `Button`, `Input`, `Select`, `Card`,
  `Badge`, `Skeleton`, all with visible focus states, proper labeling, and
  `aria-*` attributes where relevant. Documented in Storybook.
- **Mock API (MSW)** — `/api/products`, `/api/products/:slug`,
  `/api/categories`, backed by 52 generated products across 6 categories
  (Footwear, Apparel, Accessories, Electronics, Home, Outdoor), each with
  variants, stock, pricing, ratings, and a locally generated placeholder
  image (no external image host dependency).
- **Minimal product detail page** — needed so catalog product links resolve
  to something real; intentionally stops short of cart/checkout.
- **Lo-fi wireframes** — Catalog and Product Details (built this week), plus
  Cart and Checkout (captured now for planning, not yet implemented) — see
  `docs/wireframes/`.

## Accessibility notes (Week 1)

- Skip-to-content link, semantic landmarks (`header`, `main`, `footer`,
  `nav`).
- All interactive controls have visible focus rings and accessible names
  (including icon-only buttons via `sr-only` text).
- Loading and result-count changes are announced via `aria-live`.
- Lighthouse's automated accessibility audit scores 100 on the catalog,
  product and checkout pages (after the Week 6 contrast fix). That is an
  automated check only: a manual screen-reader and keyboard walkthrough, and
  a formal WCAG 2.1 AA audit, have **not** been performed.

---

## Week-by-week progress

### Week 6 — PWA, Performance & Launch ✅ (this delivery)
- Installable PWA, offline browsing, version-update prompt
- Bundle analysis + enforced size budgets, lazy-loaded heavy code, image optimization
- Server-rendered catalog; production API via route handlers (MSW dev-only)
- Lighthouse CI + GitHub Actions; measured scores 99 / 99 / 100 (performance)
- Category illustrations replace generic placeholders; contrast bug fixed
- Cumulative README finalized with setup and benchmark results

### Week 5 — Interactive Media & Advanced Product UX ✅
- Lazy-loaded React Three Fiber / Three.js 3D product viewer (Option A)
- Procedural per-category meshes (no real 3D assets exist for this catalog)
- OrbitControls (drag/touch/pinch) + keyboard rotation + auto-rotate toggle
- WebGL capability detection with graceful fallback to the 2D gallery
- Confirmed via production build: 3D stack is a separate, lazily-fetched chunk

### Week 4 — Real-time WebSockets ✅
- Cross-tab real-time inventory sync (`BroadcastChannel`, WebSocket-shaped client)
- Reconnection with exponential backoff + connection status indicator
- Checkout fully decoupled from socket state (handles drops mid-checkout)
- 19 new unit tests for the reconnect/status/message-application logic

### Week 3 — Optimistic UI & Checkout ✅
- Optimistic cart mutations backed by a mock `/api/cart/sync` endpoint, with automatic rollback on failure
- `checkoutMachine` (XState): Cart → Shipping → Payment → Confirmation, guarded transitions, async payment step
- Full shipping/payment form validation, shared between machine guards and inline UI errors
- Unit tests for the optimistic-update logic (7 tests)

### Week 2 — Product Details & State Machines ✅
- Accessible product detail page with a 3-image gallery
- XState cart machine with guarded quantity transitions
- Cart UI (drawer): quantity stepper, remove, live subtotal
- Client-side quantity validation (inline errors, machine guard as source of truth)
- Custom toast notifications for add-to-cart/error feedback
- Unit tests for all cart machine transitions and guards (Vitest)

### Week 1 — Architecture, Wireframing & Mock API ✅
- Next.js + TypeScript + Tailwind scaffold, `@/*` path aliases, clean `.gitignore`
- Lo-fi wireframes: Catalog, Product Details, Cart, Checkout
- MSW mock API with 52 seeded products
- Storybook configured with stories for all UI primitives
- Accessible UI primitives, dark mode
- Responsive catalog: search, category filter, grid/list toggle, skeleton loaders

### Roadmap status

All six weekly deliverables are complete. Not done, and out of scope of the
weekly briefs:

- Real product photography and real `.gltf` 3D scans (the catalog uses
  generated illustrations and procedural meshes)
- A real backend and WebSocket server (the mock API and the
  BroadcastChannel-backed "socket" stand in for them)
- A manual WCAG 2.1 AA audit with assistive technology

---

## Key technical decisions

- **Next.js over Vite**: later weeks need image optimization, easy PWA
  wiring, and strong Lighthouse-100 tooling; Next.js provides these without
  extra configuration.
- **MSW over json-server**: MSW intercepts `fetch` directly, works
  identically in the browser and in Storybook/tests, and won't need to be
  swapped out when optimistic-update/rollback logic is added later.
- **Local SVG placeholder images instead of an external image CDN**: keeps
  the app runnable with zero external network dependency — relevant now for
  a self-contained dev experience, and directly useful later for offline/PWA
  caching.
- **Lo-fi wireframes as Markdown/ASCII** rather than a design-tool file:
  lightweight, versionable alongside the code, and sufficient fidelity for a
  lo-fi planning artifact.
- **XState for the cart, not a plain reducer/Context**: quantity rules
  (clamped to stock, never below 1) are exactly the kind of guarded
  transition XState is built for, and the roadmap already commits to XState
  for checkout — building the cart as its own machine now means checkout
  can compose it as a child actor later instead of it being rewritten.
- **Vitest over Jest**: needed a test runner specifically for the "unit
  test the XState machine" task; Vitest requires no extra Babel/ts-jest
  configuration on top of the existing TypeScript setup.
- **Custom toast implementation over a toast library**: the need was
  narrow (two tones, auto-dismiss, accessible roles) and didn't justify a
  new dependency.
- **Cart state is in-memory (not persisted) for now**: not required by this
  week's brief; persistence/optimistic-update-with-rollback is explicit
  scope for a later week per the master project brief, so it isn't
  anticipated here to avoid solving it twice.
- **A generic `runOptimisticAction` helper instead of baking rollback into
  the cart machine itself**: keeps the machine a pure, synchronous
  reducer (easy to reason about and test), while the apply/sync/rollback
  orchestration — which is inherently async and side-effecting — lives in
  one small, isolated, directly-testable function. The same helper can be
  reused for any future optimistic mutation without touching the machine.
- **A `checkoutMachine` separate from `cartMachine`, entered via its own
  `cart` state**: the checkout flow's first step *is* a cart review, but
  giving checkout its own state (rather than trying to share cart's `idle`
  state) keeps each machine's concerns — item mutation vs. multi-step
  form flow — independent and simple to test in isolation.
- **A documented test "decline" card number for payment failure**, rather
  than relying solely on a random failure rate: makes the rollback/error
  path in checkout reliably demonstrable and testable on demand, while a
  low random-failure rate is still layered on top for realism.
- **`BroadcastChannel` behind a WebSocket-shaped client, instead of a real
  WebSocket to an external server**: there is no backend in this project to
  own inventory state or push events from (the whole app is intentionally
  mock-API-driven per the roadmap), and a connection to some arbitrary
  public server would be unreliable and wouldn't actually reflect this
  app's inventory anyway. `BroadcastChannel` is the browser-native, same-origin
  mechanism for exactly the stated requirement ("reflect immediately across
  multiple browser tabs"). The client class mirrors a real WebSocket's
  shape (`connect`/`send`/`close`, status callbacks, backoff-based
  reconnect) so it is a drop-in replacement point if a real server is added
  later.
- **Reconnect/status/message logic extracted into pure functions,
  separate from the socket class**: `BroadcastChannel` and timers are not
  practical to unit test deterministically; pulling the actual decision
  logic (backoff delay, status transitions, message application) out into
  pure functions means that logic is still fully covered by fast,
  deterministic tests, while the thin socket class wiring them together is
  verified manually.
- **Procedural Three.js primitives instead of loading `.gltf` files**: a
  real 3D product viewer loads scans authored by a 3D/photography team for
  each specific product — this catalog has none, and there is no
  legitimate source to download placeholder ones from (no network access
  to asset CDNs in this environment, and using someone else's product
  scans would be a copyright problem regardless). Building representative
  shapes directly from Three.js primitives, keyed by category, extends the
  same placeholder philosophy already used for the 2D images in Week 1 —
  and still genuinely exercises every other part of the requirement
  (R3F/Three.js integration, OrbitControls, lazy loading, WebGL fallback).
  If real product scans are added later, only `ProceduralProductMesh`
  needs replacing with a `useGLTF`-based loader — the rest of the viewer
  (canvas, controls, lazy wrapper, fallback) is unaffected.
- **No new unit tests this week**: this week's brief doesn't call for
  automated tests (unlike Weeks 2–4), and the viewer's correctness is
  primarily visual/interactive (does the mesh render, do controls respond)
  rather than logic that benefits from unit testing — verified manually
  instead, consistent with not adding tests the brief didn't ask for.

- **Route handlers in production, MSW in development**: MSW works by
  registering a service worker, and a page can only be controlled by one
  worker per scope — so MSW and the PWA worker cannot coexist. Rather than
  hacking the two together, production serves the identical contract from
  Next.js route handlers (`src/app/api/**`) and MSW stays for development
  and Storybook (as the roadmap specifies). Both are thin wrappers over
  `src/lib/catalogApi.ts`, which is unit-tested, so they cannot drift. A
  side benefit: no MSW code is shipped to production.
- **Self-contained 3D scene**: the viewer makes no third-party requests
  (lighting is local, meshes are procedural), so it works offline once its
  chunk is cached and cannot be broken by a CDN outage. The end-to-end run
  asserts that opening the 3D tab triggers zero cross-origin requests.
- **Hand-written service worker, not a PWA plugin**: the caching needs are
  small and specific (shell precache, a few runtime strategies, a
  wait-for-user update flow). Owning ~150 lines avoids a dependency and
  build-plugin coupling, and it was verified directly in a real browser.
- **Update flow waits for the user**: the new worker does not `skipWaiting`
  by itself; it waits for the prompt's **Reload**. Auto-activating mid-session
  could swap caches under a page that is halfway through checkout.
- **Server-render the catalog, then filter via the API**: the HTML carries
  the whole product list (fast first paint/LCP, works before JS loads). The
  default view needs no request; searches go to the API and fall back to
  local filtering if the network is down.
- **Illustrations instead of photos**: there is no legitimate source of real
  product photography here. Drawn per-category art makes the catalog readable
  at a glance; swapping in real images only requires replacing the files
  (`ProductImage` already routes raster images through the optimizer).
- **Budgets measured, then set with ~8% headroom**: tight enough to catch a
  regression (e.g. the 3D library leaking into the main bundle), loose
  enough not to fail on noise.

---

## Testing / verification performed for this delivery

Automated (also run in CI):
- `npm run typecheck` — no type errors
- `npm run lint` — no ESLint warnings or errors
- `npm test` — **51/51** unit tests (cart machine 10, optimistic action 7,
  connection status 7, inventory reducer 6, reconnect backoff 6, shared
  mock-API logic 15)
- `npm run build` — succeeds; 59 routes generated
- `npm run budget` — all routes within budget; 3D chunk confirmed lazy
- `npm run lhci` — all assertions pass (see benchmark results above)

End-to-end, run by hand in headless Chromium against the production build
(23 checks, all passing; the script itself is not part of the repo):
- **Catalog:** 52 products in the server HTML; first-row images load and are
  preloaded; search via the API; category filter; grid/list toggle
- **Product:** 3D tab loads lazily and renders a canvas; photo tab; add to
  cart (instant toast and header count); cart drawer loads lazily; quantity
  change survives the sync; over-stock input rejected with inline validation
- **Checkout:** shipping and payment validation block progress; the test
  decline card is handled; a valid card confirms the order; the cart empties
- **Real-time:** a purchase in one tab lowers the live stock shown in a
  second tab; connection badge reads "Live"
- **PWA:** worker registers and takes control; install precaches the shell,
  hashed assets and all 52 card images; manifest valid and Chrome reports the
  app installable; with the server stopped and the browser offline, the
  catalog loads from cache with working images, search keeps working, a
  visited product page opens, and an unvisited page shows the offline
  screen; a changed worker version triggers the update prompt, the old
  worker keeps control until **Reload** is clicked, and then the new version
  takes over and old caches are deleted

Known limitations: not tested on physical devices or Safari/Firefox (the
service worker, 3D viewer and BroadcastChannel are standard APIs, but only
Chromium was exercised); Next.js logs harmless "Failed to fetch RSC payload"
console messages when links are prefetched while offline; offline pages are
those visited before, plus the home page and offline screen.
