import test from "node:test";
import assert from "node:assert/strict";
import { planDelete, planRedisUserChange } from "../src/redis-user-handler.js";

test("plans user creation and group membership for new service user", () => {
  const actions = planRedisUserChange({
    serviceName: "enrollment-api",
    keyspace: "enrollment-api",
    password: "secret",
    existingUsers: [],
    currentGroupUserIds: []
  });

  assert.deepEqual(actions.map((action) => action.type), ["create-user", "add-user-to-group"]);
  assert.equal(actions[0].accessString, "on ~enrollment-api:* ~common:* +@all");
});

test("plans password/access update without duplicate group membership", () => {
  const actions = planRedisUserChange({
    serviceName: "enrollment-api",
    keyspace: "enrollment-api",
    password: "rotated",
    existingUsers: [{ userId: "enrollmentapi", username: "enrollmentapi" }],
    currentGroupUserIds: ["enrollmentapi"]
  });

  assert.deepEqual(actions.map((action) => action.type), ["modify-user"]);
  assert.deepEqual(actions[0].passwords, ["rotated"]);
});

test("delete path preserves user until explicit migration cleanup", () => {
  assert.deepEqual(planDelete(), [
    {
      type: "preserve-user",
      reason: "Redis data migration and credential cleanup should be explicit."
    }
  ]);
});
