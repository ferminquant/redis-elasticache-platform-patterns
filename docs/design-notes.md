# Design Notes

## Problem

Several serverless applications need Redis, but direct hand wiring tends to create drift:

- different secret shapes
- inconsistent endpoint configuration
- broad or reused credentials
- unclear ownership of user creation
- migration risk when a central cache changes shape

The useful platform layer is not a large service. It is a small set of conventions that applications can adopt without learning every ElastiCache detail.

## Pattern

The example splits the work into three layers:

- `CachePlatform`: shared ElastiCache Serverless shape and exported metadata.
- `RedisUserPattern`: per-service secret, keyspace, and connection grants.
- `RedisConnectionConfig`: runtime boundary for Lambda code.

The user-management handler is modeled as a planner instead of an AWS custom resource so tests can cover the behavior without an account.

## Tradeoffs

Per-service users make blast radius smaller, but they add a provisioning step. The custom-resource-style planner makes that step explicit and idempotent.

Keyspace prefixes are a pragmatic isolation boundary. They do not replace authorization, but they keep accidental key collisions from becoming a cross-service failure.

The example does not benchmark Redis, implement a feature store, or claim production telemetry. A future extension could add a feature-serving API, freshness checks, and load tests.
