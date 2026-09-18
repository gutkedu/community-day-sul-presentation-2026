# Inventory integration, domain map and closing QR codes

> **For agentic workers:** Use executing-plans inline, without repository-changing subagents; review may be read-only. The user approved the native model, QR codes, deployment, and an isolated worktree based on the current local snapshot; no push.

**Goal:** Publish the missing external stock API, an accessible native domain map, and working QR codes for both public frontends.

**Architecture:** Keep internal services derived from SAM. Add explicitly declared external services and OpenAPI contracts to the generator, without pretending third-party APIs are Lambda resources. Keep ReserveInventory/SQS distinct from ReserveStock/HTTP. Reuse the native domain integration map. Generate two local SVG assets from one published-links configuration.

**Tech Stack:** EventCatalog 4.10.3, TypeScript, Zod, OpenAPI 3.1, Vitest, Slidev/Vue, node-qrcode, jsQR, AWS CLI/SAM.

**Approved baseline:** Local main at 33fe7a36893866c7779b951f6ee5d0dbf0c7c1ac plus the user's existing changes, SHA-256 00863ea7b2425c9704bcde3ea0a23215775cdfb6b47c8c570967fc2550c339c5. Origin has no branches. Preserve the original checkout, do not commit its unrelated changes, do not push.

## 1. External inventory service

Files: event-catalog/generator/src/external-services.ts (new), model.ts, render.ts, validate.ts; generator/tests/model.test.ts and render.test.ts; architecture/domains/inventory/catalog.yaml and stock-api.openapi.yaml (new).

- [x] Add failing tests for external service metadata, a separate HTTP command, consumer references, invalid/missing contract paths and duplicate IDs.
- [x] Run `rtk npm test` in event-catalog; confirm the new assertions fail while the baseline 14 tests still pass.
- [x] Extend the manifest with explicit external services:

```yaml
externalServices:
  - id: inventory-stock-api
    name: API de Estoque
    version: 1.0.0
    summary: API externa fictícia de reserva de estoque.
    specification: stock-api.openapi.yaml
    consumers:
      - inventory-reserve-inventory
```

- [x] Validate the additional local OpenAPI 3.1 file. Its operation is ReserveStock, command POST /reservations, using a non-routable example server. Require valid internal consumers; do not require a SAM resource for external APIs.
- [x] Render the external service with `externalSystem: true`, its specification, command schema/example, mirrored sends/receives, and a continuation of CreateOrderFlow. Include external contract content in generation source hashes.
- [x] Preserve determinism and all existing SAM validations; run the full catalog tests and generation/lint.

## 2. Native domain map access

Files: event-catalog/eventcatalog.config.js; generator/tests/navigation.test.ts (new); README.md.

- [x] Test a visible navigation item linking to /visualiser/domain-integrations and preservation of all existing built-in items.
- [x] Add the native application navigation group/item with id domain-map, label Mapa dos domínios, icon Network and that href.
- [x] Document the native route and the fictional external integration.

## 3. Closing QR codes

Files: presentation/lib/published-links.json (new), scripts/generate-qrcodes.mjs (new), public/qrcodes/presentation.svg and event-catalog.svg (generated), components/ClosingScene.vue, slides.md, styles/full-deck.css, tests/deck.test.ts, tests/qrcodes.test.ts (new), package.json/package-lock.json, README.md.

- [x] Replace the obsolete empty-link assertion with failing tests for presentation and EventCatalog links and local SVG QR assets.
- [x] Add exact qrcode 1.5.4 and test-only jsqr 1.4.0 / pngjs 7.0.0 dependencies. Pin the lockfile.
- [x] Generate deterministic black/white SVGs with a four-module quiet zone and error correction M for:
  - https://d66v558puyi0x.cloudfront.net/1
  - https://d1ebg5f5z5lxgr.cloudfront.net/
- [x] Render two labelled, clickable QR cards at slide 29, with readable links and sufficient projected size. Preserve the section variant of ClosingScene, slide count, notes and presenter mode.
- [x] Run all presentation tests and build. Decode screenshots of the actual rendered QR images with jsQR, not only their labels.

## 4. Validate and deploy

Files: infra/scripts/deploy.mjs and its existing regression tests/fixture, only for the already-diagnosed SAM-generated metadata comparison.

- [x] Apply the four existing regression tests from the previous deployment fix; observe the valid-metadata case fail.
- [x] Ignore only matching, generated SamResourceId markers during template comparison; keep all real template differences blocked. Run all 23 infra tests.
- [x] Validate the unchanged SAM template, both builds and generated route coverage before any upload.
- [x] Review the task-only delta against the baseline manifest; verify the original source digest is unchanged.
- [x] Deploy with profile gutkedu, region us-east-1, stack community-day-sul-presentation-2026. Review any change set; stop if it proposes unexpected resource changes. Do not recreate buckets/distributions or deploy fictional backend resources.
- [x] Await both CloudFront invalidations. Browser-check slide 29, notes, external API docs/graph, the domain map menu and existing deep links; decode live QR images.
- [x] Report URLs, tests, Git/worktree/base state and pending local integration. No push, PR, Plane changes or deletion of the worktree holding the result.

## Completion evidence — 2026-09-18

- Deployment exited 0 using profile gutkedu in us-east-1. SAM reported no changes; the existing resources and URLs were retained.
- 43 presentation + 25 catalog + 23 infrastructure tests passed. Catalog TypeScript, lint, generation, builds, route checks and SAM lint passed.
- Twelve live browser routes opened and reloaded successfully; both rendered QR codes decoded to the configured public URLs. No JavaScript errors. Six representative published files matched local build SHA-256 and revalidation headers. Anonymous requests to both S3 buckets returned 403.
- CloudFront invalidations completed: presentation I4WW93DRZN8N3AJQJTKP9VYDVC; catalog IB395FLTWCVZS1I6L8J70RKSP7.
- The task-only delta was independently reviewed read-only, with no blocking findings. Original checkout: all 223 baseline paths unchanged. No commits, push, merge, PR or Plane changes. Preserve this worktree and its uncommitted source.
- Delivery report: /private/tmp/community-day-catalog-qrcodes-delivery-20260918.md.
