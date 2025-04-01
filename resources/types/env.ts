export enum Env {
  Dev = "dev",
  Staging = "staging",
}

export function validateEnvironment(env: string): Env | null {
  switch (env) {
    case "dev":
      return Env.Dev;
    case "staging":
      return Env.Staging;
    default:
      return null;
  }
}
