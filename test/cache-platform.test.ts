import test from "node:test";
import assert from "node:assert/strict";
import { createCachePlatformPlan } from "../src/cache-platform.js";

test("cache platform plan exports endpoint and user-group metadata", () => {
  const plan = createCachePlatformPlan({
    serviceName: "Shared Cache",
    stage: "prod",
    region: "us-east-1",
    hostedZoneName: "example.internal",
    subnetIds: ["subnet-a", "subnet-b", "subnet-c", "subnet-d"],
    securityGroupIds: ["sg-lambda"]
  });

  assert.equal(plan.cache.engine, "redis");
  assert.equal(plan.cache.port, 6379);
  assert.deepEqual(plan.cache.subnetIds, ["subnet-a", "subnet-b", "subnet-c"]);
  assert.equal(plan.exports.endpoint, "cache.us-east-1.example.internal");
  assert.equal(plan.exports.userGroupArnParameter, "/platform/prod/us-east-1/redis/default/userGroupArn");
});

test("cache platform plan rejects a single subnet", () => {
  assert.throws(
    () =>
      createCachePlatformPlan({
        serviceName: "cache",
        stage: "dev",
        region: "us-east-1",
        hostedZoneName: "example.internal",
        subnetIds: ["subnet-a"]
      }),
    /at least 2 subnets/
  );
});
