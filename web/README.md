# Personal OS Web

Local-first Next.js frontend for Personal OS markdown workflow.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

Copy `.env.example` to `.env.local` if you need explicit root path:

```bash
cp .env.example .env.local
```

Default data root resolves to the repository parent (`../`).

## Test

```bash
npm run test
npm run typecheck
```

## Action Modules

The app supports declarative action manifests inspired by skill-based systems:

- Add module manifests under `web/modules/**/module.json`
- They are exposed via `GET /api/modules`
- Execute any action via `POST /api/modules/:moduleId/actions/:actionId/run`
- Use the built-in runner UI at `/actions`

### Schema Validation

- Manifests are validated against `web/schemas/module.schema.json`
- Invalid manifests are skipped and reported as warnings in:
  - `GET /api/modules/endpoints`

### Endpoint Cache Generation

- Module endpoint cache is generated into `.cache/module-endpoints.json`
- Generate manually:

```bash
npm run generate:module-endpoints
```

## In-App Copilot

- Open the floating **Copilot** button in the dashboard.
- Example commands:
  - `what should I work on today?`
  - `capture prepare middleware update`
  - `process backlog`
  - `mark flipkart project as done`
- Endpoint: `POST /api/copilot/chat`
- Behavior: tries MCP (`copilot_chat`) first, falls back to local command engine.
