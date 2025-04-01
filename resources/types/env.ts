export enum Env {
  Dev = "dev",
  Staging = "staging",
}

export function validateEnvironment(env: string): Env | null {
  switch (env) {
    case Env.Dev:
      return Env.Dev;
    case Env.Staging:
      return Env.Staging;
    default:
      return null;
  }
}
