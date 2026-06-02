import test from "node:test";
import assert from "node:assert/strict";
import { planApplicationMigration } from "../src/app-migration.js";

test("application migration covers infra, runtime, and cleanup steps", () => {
  const steps = planApplicationMigration({
    applicationName: "profile-search-api",
    keyspace: "profile-search",
    previousSecretSource: "manually configured Redis secret"
  });

  assert.deepEqual(
    steps.map((step) => step.step),
    [
      "create-service-user",
      "inject-secret-arn",
      "grant-secret-read",
      "switch-client",
      "health-check",
      "remove-old-config"
    ]
  );
});
