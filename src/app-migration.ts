export type ApplicationMigrationInput = {
  applicationName: string;
  keyspace: string;
  previousSecretSource: string;
};

export type ApplicationMigrationStep = {
  step:
    | "create-service-user"
    | "inject-secret-arn"
    | "grant-secret-read"
    | "switch-client"
    | "health-check"
    | "remove-old-config";
  detail: string;
};

export function planApplicationMigration({
  applicationName,
  keyspace,
  previousSecretSource
}: ApplicationMigrationInput): ApplicationMigrationStep[] {
  return [
    {
      step: "create-service-user",
      detail: `Create a Redis user and generated secret for ${applicationName} using keyspace ${keyspace}.`
    },
    {
      step: "inject-secret-arn",
      detail: "Pass REDIS_SECRET_ARN from the generated service secret instead of local configuration."
    },
    {
      step: "grant-secret-read",
      detail: "Grant the Lambda role read access to only the generated Redis secret."
    },
    {
      step: "switch-client",
      detail: "Build the Redis connection from host, port, username, password, and keyspace fields."
    },
    {
      step: "health-check",
      detail: "Add a Redis ping or cache-read dependency check to the service health endpoint."
    },
    {
      step: "remove-old-config",
      detail: `Remove the old Redis source (${previousSecretSource}) after the deployment is stable.`
    }
  ];
}
