import type { RedisSecret } from "./redis-user-pattern.js";

export type RedisConnectionConfig = {
  url: string;
  username: string;
  password: string;
  keyPrefix: string;
  socket: {
    tls: boolean;
    checkServerIdentity: false;
  };
};

export function buildRedisUrl(secret: Pick<RedisSecret, "host" | "port" | "tls">): string {
  const protocol = secret.tls === false ? "redis" : "rediss";
  return `${protocol}://${secret.host}:${secret.port}`;
}

export function createRedisConnectionConfig(secret: RedisSecret): RedisConnectionConfig {
  for (const field of ["host", "port", "username", "password"] as const) {
    if (secret[field] === undefined || secret[field] === "") {
      throw new Error(`Redis secret is missing ${field}`);
    }
  }

  return {
    url: buildRedisUrl(secret),
    username: secret.username,
    password: secret.password,
    keyPrefix: secret.keyspace ? `${secret.keyspace}:` : "",
    socket: {
      tls: secret.tls !== false,
      checkServerIdentity: false
    }
  };
}

export function cacheKey(
  config: Pick<RedisConnectionConfig, "keyPrefix">,
  ...parts: Array<string | number | null | undefined>
): string {
  const normalizedParts = parts.map((part) =>
    part === undefined || part === null || part === "" ? "-" : String(part)
  );
  return `${config.keyPrefix}${normalizedParts.join(":")}`;
}
