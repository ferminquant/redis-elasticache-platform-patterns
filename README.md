# Redis / ElastiCache Platform Patterns

Sanitized TypeScript companion repository for a portfolio case study about standardizing Redis access across AWS serverless applications.

This is not employer code. It is a business-neutral reconstruction of the engineering shape: an ElastiCache Serverless cache, per-service Redis users, generated secrets, Lambda connection configuration, keyspace-scoped access strings, and downstream service migration checks.

## Commands

```bash
npm test
npm run build
npm run check
```

## What This Shows

- A shared cache foundation that exports the endpoint and user-group metadata other stacks need.
- A per-service Redis user pattern with generated credentials and keyspace-scoped access.
- Idempotent user-management logic for create/update flows.
- Lambda connection settings built from Secrets Manager-style payloads.
- A migration plan for applications moving from hand-managed Redis configuration to the shared pattern.

The implementation stays local, typed, and deterministic. It does not deploy AWS resources or connect to Redis.

## How To Read It

1. Start with `src/cache-platform.ts` for the shared ElastiCache Serverless resource shape.
2. Read `src/redis-user-pattern.ts` for the per-service secret and access model.
3. Read `src/redis-user-handler.ts` for idempotent user and user-group planning.
4. Read `src/lambda-redis-client.ts` for the runtime connection boundary.
5. Read `src/app-migration.ts` for the downstream app migration checklist.
6. Run `npm test` to see the expected behavior.

## Boundaries

This repository deliberately avoids client names, production account details, private package names, employer naming conventions, and copied code. The point is to show the reusable pattern and the tradeoffs, not to expose a private implementation.
