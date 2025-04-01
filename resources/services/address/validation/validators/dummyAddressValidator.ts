import { AddressValidator } from "../addressValidator";
import { Address } from "../../../../types/address";
import { AddressValidationResult } from "../../../../types/addressValidationResult";

export class DummyAddressValidator implements AddressValidator {
  validateAddress(address: Address): Promise<AddressValidationResult> {
    const errors = new Set<string>();

    // any validation we want, this one just checks that all fields are populated
    if (!address.name) {
      errors.add("name");
    }
    if (!address.street) {
      errors.add("street");
    }
    if (!address.suburb) {
      errors.add("suburb");
    }
    if (!address.postcode) {
      errors.add("postcode");
    }
    if (!address.state) {
      errors.add("state");
    }
    if (!address.country) {
      errors.add("country");
    }

    let formattedAddress: string;
    if (errors.size == 0) {
      formattedAddress = address.toString();
    }

    return new Promise((resolve, _) => {
      resolve({
        isValid: errors.size == 0,
        formattedAddress: formattedAddress,
        missingOrIncorrectComponents: [...errors],
      });
    });
  }
}
