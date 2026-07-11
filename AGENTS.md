# AGENTS.md — TanStack Dashboard

Agent-facing quick reference. Full project documentation lives in [`docs/`](./docs).

## Quick start

```bash
bun install
cp env.example.txt .env
bun run db:push    # apply DB schema
bun run db:seed    # seed 20 products + 50 users + 8 notifications + kanban
bun run dev        # http://localhost:3000
bun run build      # client + server bundles
bun run start      # run built app from .output/
```

All `bun run` scripts (lint, format, typecheck, db:\*) are defined in `package.json`.

## Documentation

Detailed, current docs live in `docs/`:

| File                          | Covers                                                                     |
| ----------------------------- | -------------------------------------------------------------------------- |
| `docs/ARCHITECTURE.md`        | Tech stack, data flow, directory structure, key patterns                   |
| `docs/STACK.md`               | Every dependency with versions                                             |
| `docs/API.md`                 | `createServerFn()` server-function endpoints                               |
| `docs/FEATURES.md`            | Implemented vs planned features                                            |
| `docs/TODO.md`                | Project roadmap and progress                                               |
| `docs/CHANGELOG.md`           | Notable changes (Unreleased and released)                                  |
| `docs/PRD.md`                 | Product requirements                                                       |
| `docs/IMPLEMENTATION_PLAN.md` | Locked execution plan: Better Auth swap, Docker/CI, email, infra hardening |

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
