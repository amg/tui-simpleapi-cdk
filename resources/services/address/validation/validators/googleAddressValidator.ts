import { AddressValidator } from "../addressValidator";
import { Address } from "../../../../types/address";
import { AddressValidationResult } from "../../../../types/addressValidationResult";

export class GoogleAddressValidator implements AddressValidator {
  validateAddress(address: Address): Promise<AddressValidationResult> {
    // google implementation of the service
    return new Promise((resolve, reject) => {
      resolve({
        isValid: false,
        formattedAddress: undefined,
        missingOrIncorrectComponents: [],
      });
    });
  }
}
