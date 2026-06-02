export const REDIS_PORT = 6379;

const ensureNonEmpty = (value, field) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} is required`);
  }
  return value.trim();
};

export function buildCacheEndpoint({ region, hostedZoneName }) {
  return `cache.${ensureNonEmpty(region, "region")}.${ensureNonEmpty(hostedZoneName, "hostedZoneName")}`;
}

export function createCachePlatformPlan({
  serviceName,
  stage,
  region,
  hostedZoneName,
  subnetIds,
  securityGroupIds
}) {
  const normalizedService = ensureNonEmpty(serviceName, "serviceName")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");

  const selectedSubnets = [...new Set(subnetIds ?? [])].slice(0, 3);
  if (selectedSubnets.length < 2) {
    throw new Error("ElastiCache Serverless needs at least 2 subnets");
  }

  const endpoint = buildCacheEndpoint({ region, hostedZoneName });
  const userGroupId = `${stage}-${normalizedService}-redis-users`;

  return {
    cache: {
      engine: "redis",
      name: `${stage}-${normalizedService}`,
      port: REDIS_PORT,
      subnetIds: selectedSubnets,
      securityGroupIds: securityGroupIds ?? [],
      userGroupId
    },
    exports: {
      endpoint,
      userGroupId,
      userGroupArnParameter: `/platform/${stage}/${region}/redis/default/userGroupArn`,
      endpointParameter: `/platform/${stage}/${region}/redis/default/endpoint`
    }
  };
}
