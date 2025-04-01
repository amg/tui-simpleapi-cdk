import { AddressValidator } from "../addressValidator";
import { Address } from "../../../../types/address";
import { AddressValidationResult } from "../../../../types/addressValidationResult";
import { SecretsManager } from "../../../../helpers/secretsManager";
import { Env } from "../../../../types/env";

interface GoogleResponse {
  result: {
    verdict: {
      addressComplete: boolean;
    };
    address: {
      formattedAddress: string;
      missingComponentTypes: string[];
    };
  };
}

export class GoogleAddressValidator implements AddressValidator {
  constructor(public env: Env) {}

  private secretsManager = new SecretsManager(this.env);

  validateAddress(address: Address): Promise<AddressValidationResult> {
    // google implementation of the service
    return (
      this.secretsManager
        .getGoogleAddressValidationKey()
        .then((apiKey) => {
          const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`;

          return fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: {
                addressLines: [
                  address.street,
                  address.suburb,
                  address.state,
                  address.country,
                ],
                postalCode: address.postcode,
              },
            }),
          })
            .then((response) => {
              const statusCode = response.status;
              if (!response.ok) {
                return response.json().then((response) => {
                  throw new Error(
                    `Status code: ${statusCode}; ${JSON.stringify(response)}`
                  );
                });
              }
              return response.json();
            })
            .then((result) => {
              // TODO: remove when not troubleshooting
              console.log(`Result: ${JSON.stringify(result)}`);
              const value = result as GoogleResponse;
              if (value.result.verdict.addressComplete) {
                return {
                  isValid: true,
                  formattedAddress: value.result.address.formattedAddress,
                  missingOrIncorrectComponents: [],
                };
              } else {
                return {
                  isValid: false,
                  formattedAddress: "",
                  missingOrIncorrectComponents:
                    value.result.address.missingComponentTypes,
                };
              }
            });
        })
        // unify thrown exceptions
        .catch((e) => {
          throw new Error(`Google service error: ${e.message}`);
        })
    );
  }
}
