## reweCart (TypeScript)

`reweCart` is a CLI for REWE pickup APIs. This repository now includes a TypeScript implementation that mirrors the legacy Haskell command surface and JSON output shape.

## Install & build

```bash
npm install
npm run build
```

Run locally:

```bash
npm start -- <command>
# or
node dist/index.js <command>
```


Minimal UI (Preact):

```bash
npm run ui:dev
```

Build UI:

```bash
npm run ui:build
```

Run tests:

```bash
npm test
```

Lint/type-check:

```bash
npm run lint
```

## CLI examples

```bash
reweCart store search 80336
reweCart store set 420240 80336
reweCart search "milch" --organic --category milchprodukte
reweCart favorites
reweCart basket add <LISTING_ID> --qty 1
reweCart timeslots
reweCart checkout create <TIMESLOT_ID>
reweCart checkout order

reweCart scheduler start --schedule-day sat --schedule-time 12:05 --target-day fri --weeks-ahead 2 --window 18:00-20:00 --once
```

For continuous automation, omit `--once` and keep the process running.


## API schemas

Reverse-engineered OpenAPI specs:
- `api/rewe.openapi.yaml`
- `api/account-rewe.yaml`

TypeScript domain contracts are in:
- `src/types/rewe.ts`
- `src/types/auth.ts`
