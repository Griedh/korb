## korb (TypeScript)

`korb` is a CLI for REWE pickup APIs. This repository now includes a TypeScript implementation that mirrors the legacy Haskell command surface and JSON output shape.

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
korb store search 80336
korb store set 420240 80336
korb search "milch" --organic --category milchprodukte
korb favorites
korb basket add <LISTING_ID> --qty 1
korb timeslots
korb checkout create <TIMESLOT_ID>
korb checkout order
```

## API schemas

Reverse-engineered OpenAPI specs:
- `api/rewe.openapi.yaml`
- `api/account-rewe.yaml`

TypeScript domain contracts are in:
- `src/types/rewe.ts`
- `src/types/auth.ts`
