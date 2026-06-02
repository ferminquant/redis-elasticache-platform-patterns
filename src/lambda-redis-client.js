export function buildRedisUrl(secret) {
  const protocol = secret.tls === false ? "redis" : "rediss";
  return `${protocol}://${secret.host}:${secret.port}`;
}

export function createRedisConnectionConfig(secret) {
  for (const field of ["host", "port", "username", "password"]) {
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

export function cacheKey(config, ...parts) {
  const normalizedParts = parts.map((part) => (part === undefined || part === "" ? "-" : String(part)));
  return `${config.keyPrefix}${normalizedParts.join(":")}`;
}
