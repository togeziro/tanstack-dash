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

All `bun run` scripts (lint, format, typecheck, db:*) are defined in `package.json`.

## Documentation

Detailed, current docs live in `docs/`:

| File                 | Covers                                                    |
| -------------------- | --------------------------------------------------------- |
| `docs/ARCHITECTURE.md` | Tech stack, data flow, directory structure, key patterns |
| `docs/STACK.md`      | Every dependency with versions                            |
| `docs/API.md`        | `createServerFn()` server-function endpoints              |
| `docs/FEATURES.md`   | Implemented vs planned features                           |
| `docs/TODO.md`       | Project roadmap and progress                              |
| `docs/CHANGELOG.md`  | Notable changes (Unreleased and released)                 |
| `docs/PRD.md`        | Product requirements                                      |

## Agent memory

- Before exploring the codebase or investigating a topic, use `agentmemory_memory_recall` and `agentmemory_memory_smart_search` to check for past context
- After making key decisions, learning something new, or completing a task, use `agentmemory_memory_save` to persist the insight
- Use `agentmemory_memory_sessions` to review recent work before continuing
