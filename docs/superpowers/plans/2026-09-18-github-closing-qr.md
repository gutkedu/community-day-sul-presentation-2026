# GitHub closing QR Implementation Plan

> **For agentic workers:** Use executing-plans inline; keep the existing authorized worktree and do not commit, merge or push.

**Goal:** Replace the presentation QR with this project's GitHub URL, make both QR codes about 25% smaller and farther apart, then republish only the presentation.

**Architecture:** Keep the shared link configuration and deterministic local SVG generation. Preserve the EventCatalog URL, slide count, presenter notes, current infrastructure and catalog deployment. The user explicitly accepts the GitHub link before the repository contents are pushed.

**Tech Stack:** Slidev/Vue, CSS, node-qrcode, Node test runner, Playwright/jsQR, existing AWS deployment scripts.

## Approved design

- First card: GitHub, https://github.com/gutkedu/community-day-sul-presentation-2026, id github.
- Second card: existing EventCatalog URL unchanged.
- QR dimensions: 246px → 184px (25.2% smaller). Card spacing: 24px → 96px. Grid maximum width: 850px → 960px. Wrap long visible URLs inside the cards.
- Keep original checkout and all earlier uncommitted work. No GitHub publication in this follow-up.

## Execution

- [x] Update presentation/tests/qrcodes.test.ts to expect the GitHub URL, id and label; rename the closing test in presentation/tests/deck.test.ts. Run `rtk npm test` and observe the old presentation destination fail.
- [x] In infra/tests/browser-smoke.mjs, require actual rendered QR images between 200 and 220 pixels at the existing 1440px viewport, at least 100px between cards and no overflowing visible URL. Run `rtk proxy node infra/tests/browser-smoke.mjs` against the old build and observe the size assertion fail.
- [x] Update presentation/lib/published-links.json, ClosingScene.vue image dimensions and full-deck.css layout. Regenerate using `rtk npm run generate:qrcodes`; remove only the superseded generated presentation/public/qrcodes/presentation.svg. Update README and the final slide notes.
- [x] Run presentation tests and build, then the existing browser smoke test. Decode both rendered codes and inspect the final-slide screenshot. Expected: GitHub and EventCatalog links, smaller readable codes, larger gap, no overflow.
- [x] Run `rtk proxy ./infra/scripts/deploy-presentation.sh --region us-east-1 --profile gutkedu`; require exit 0 and completed invalidation. Do not run deploy-all or deploy-infra.
- [x] Run the browser smoke with both public URLs, verify published files match the new build, and confirm the catalog invalidation and source files are unchanged. Record Git/worktree state and deployment evidence; leave everything uncommitted.

## Verification result

Published only the presentation with gutkedu/us-east-1; script exit 0. Invalidation I6MBO97X1GSECA078K7I8X45R2 completed. Catalog invalidation remains IB395FLTWCVZS1I6L8J70RKSP7. All 43 presentation and 23 infrastructure tests passed; 12 local/public browser routes passed, both rendered QR images decoded successfully, and layout bounds/spacing passed. Three published files matched build SHA-256. Independent read-only review found no blockers. No commits, merge or push. Delivery report: /private/tmp/community-day-github-qr-delivery-20260918.md.
