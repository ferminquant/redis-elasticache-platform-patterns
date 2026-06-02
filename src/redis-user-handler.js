import { buildAccessString, normalizeServiceUser } from "./redis-user-pattern.js";

export function planRedisUserChange({ serviceName, keyspace, password, existingUsers = [], currentGroupUserIds = [] }) {
  const username = normalizeServiceUser(serviceName);
  const accessString = buildAccessString(keyspace);
  const userExists = existingUsers.some((user) => user.userId === username || user.username === username);
  const isInGroup = currentGroupUserIds.includes(username);
  const actions = [];

  if (userExists) {
    actions.push({
      type: "modify-user",
      userId: username,
      passwords: [password],
      accessString
    });
  } else {
    actions.push({
      type: "create-user",
      userId: username,
      username,
      engine: "redis",
      passwords: [password],
      accessString
    });
  }

  if (!isInGroup) {
    actions.push({
      type: "add-user-to-group",
      userId: username
    });
  }

  return actions;
}

export function planDelete() {
  return [
    {
      type: "preserve-user",
      reason: "Redis data migration and credential cleanup should be explicit."
    }
  ];
}
