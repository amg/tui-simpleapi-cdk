import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Env } from "../types/env";

export function addressApiKey(env: Env): string {
  return `${env}-google/AddressAPIKey`;
}

export class SecretsManager {
  constructor(public env: Env) {}

  private client = new SecretsManagerClient({
    // TODO: region should be a param
    region: "ap-southeast-2",
  });

  async getGoogleAddressValidationKey(): Promise<string | undefined> {
    return this.client
      .send(
        new GetSecretValueCommand({
          SecretId: addressApiKey(this.env),
        })
      )
      .then((response) => {
        return response.SecretString;
      });
  }
}
