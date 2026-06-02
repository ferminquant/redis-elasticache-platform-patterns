import test from "node:test";
import assert from "node:assert/strict";
import { cacheKey, createRedisConnectionConfig } from "../src/lambda-redis-client.js";

test("builds TLS Redis connection config from secret payload", () => {
  const config = createRedisConnectionConfig({
    host: "cache.us-east-1.example.internal",
    port: 6379,
    username: "profilesearchapi",
    password: "secret",
    keyspace: "profile-search"
  });

  assert.equal(config.url, "rediss://cache.us-east-1.example.internal:6379");
  assert.equal(config.username, "profilesearchapi");
  assert.equal(config.keyPrefix, "profile-search:");
  assert.equal(config.socket.tls, true);
});

test("cacheKey applies keyspace prefix and stable placeholder parts", () => {
  const config = createRedisConnectionConfig({
    host: "cache.us-east-1.example.internal",
    port: 6379,
    username: "profilesearchapi",
    password: "secret",
    keyspace: "profile-search"
  });

  assert.equal(cacheKey(config, "person", undefined, "123"), "profile-search:person:-:123");
});
