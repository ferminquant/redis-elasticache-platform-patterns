import { REDIS_PORT } from "./cache-platform.js";

export type RedisSecret = {
  host: string;
  port: typeof REDIS_PORT;
  username: string;
  keyspace: string;
  password: string;
  tls?: boolean;
};

export type ServiceSecretInput = {
  serviceName: string;
  keyspace: string;
  endpoint: string;
  passwordToken?: string;
};

export type RedisUserPatternInput = ServiceSecretInput & {
  userGroupId: string;
};

export type RedisUserPattern = {
  secretName: string;
  secret: RedisSecret;
  user: {
    userId: string;
    username: string;
    accessString: string;
  };
  userGroupMembership: {
    userGroupId: string;
    userIdsToAdd: string[];
  };
};

export function normalizeServiceUser(serviceName: string): string {
  const normalized = serviceName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32);

  if (normalized.length === 0) {
    throw new Error("serviceName must contain at least one alphanumeric character");
  }

  return normalized;
}

export function normalizeKeyspace(keyspace: string): string {
  const normalized = keyspace
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized.length === 0) {
    throw new Error("keyspace must contain at least one alphanumeric character");
  }

  return normalized;
}

export function buildAccessString(keyspace: string): string {
  const privateKeyspace = normalizeKeyspace(keyspace);
  return `on ~${privateKeyspace}:* ~common:* +@all`;
}

export function createServiceSecret({
  serviceName,
  keyspace,
  endpoint,
  passwordToken = "${generated}"
}: ServiceSecretInput): RedisSecret {
  return {
    host: endpoint,
    port: REDIS_PORT,
    username: normalizeServiceUser(serviceName),
    keyspace: normalizeKeyspace(keyspace),
    password: passwordToken
  };
}

export function createRedisUserPattern({
  serviceName,
  keyspace,
  endpoint,
  userGroupId
}: RedisUserPatternInput): RedisUserPattern {
  const secret = createServiceSecret({ serviceName, keyspace, endpoint });

  return {
    secretName: `/services/${normalizeKeyspace(serviceName)}/redis/${secret.keyspace}`,
    secret,
    user: {
      userId: secret.username,
      username: secret.username,
      accessString: buildAccessString(secret.keyspace)
    },
    userGroupMembership: {
      userGroupId,
      userIdsToAdd: [secret.username]
    }
  };
}
