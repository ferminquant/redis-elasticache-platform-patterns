import { buildAccessString, normalizeServiceUser } from "./redis-user-pattern.js";

export type RedisUserRecord = {
  userId?: string;
  username?: string;
};

export type PlanRedisUserChangeInput = {
  serviceName: string;
  keyspace: string;
  password: string;
  existingUsers?: RedisUserRecord[];
  currentGroupUserIds?: string[];
};

export type CreateUserAction = {
  type: "create-user";
  userId: string;
  username: string;
  engine: "redis";
  passwords: string[];
  accessString: string;
};

export type ModifyUserAction = {
  type: "modify-user";
  userId: string;
  passwords: string[];
  accessString: string;
};

export type AddUserToGroupAction = {
  type: "add-user-to-group";
  userId: string;
};

export type PreserveUserAction = {
  type: "preserve-user";
  reason: string;
};

export type RedisUserAction = CreateUserAction | ModifyUserAction | AddUserToGroupAction;

export function planRedisUserChange({
  serviceName,
  keyspace,
  password,
  existingUsers = [],
  currentGroupUserIds = []
}: PlanRedisUserChangeInput): RedisUserAction[] {
  const username = normalizeServiceUser(serviceName);
  const accessString = buildAccessString(keyspace);
  const userExists = existingUsers.some((user) => user.userId === username || user.username === username);
  const isInGroup = currentGroupUserIds.includes(username);
  const actions: RedisUserAction[] = [];

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

export function planDelete(): PreserveUserAction[] {
  return [
    {
      type: "preserve-user",
      reason: "Redis data migration and credential cleanup should be explicit."
    }
  ];
}
