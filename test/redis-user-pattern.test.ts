import test from "node:test";
import assert from "node:assert/strict";
import { buildAccessString, createRedisUserPattern, normalizeServiceUser } from "../src/redis-user-pattern.js";

test("normalizes Redis user names for ElastiCache user limits", () => {
  assert.equal(normalizeServiceUser("Profile Search API!!!"), "profilesearchapi");
  assert.equal(normalizeServiceUser("service-name-that-is-longer-than-thirty-two-characters"), "servicenamethatislongerthanthirt");
});

test("builds access string for private and common keyspaces", () => {
  assert.equal(buildAccessString("profile-search"), "on ~profile-search:* ~common:* +@all");
});

test("creates per-service secret and user-group membership plan", () => {
  const pattern = createRedisUserPattern({
    serviceName: "Profile Search API",
    keyspace: "profile-search",
    endpoint: "cache.us-east-1.example.internal",
    userGroupId: "prod-cache-users"
  });

  assert.equal(pattern.secret.host, "cache.us-east-1.example.internal");
  assert.equal(pattern.secret.port, 6379);
  assert.equal(pattern.secret.username, "profilesearchapi");
  assert.equal(pattern.secret.keyspace, "profile-search");
  assert.equal(pattern.user.accessString, "on ~profile-search:* ~common:* +@all");
  assert.deepEqual(pattern.userGroupMembership.userIdsToAdd, ["profilesearchapi"]);
});
