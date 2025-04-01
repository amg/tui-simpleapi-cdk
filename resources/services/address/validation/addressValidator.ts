import { Address } from "../../../types/address";
import { AddressValidationResult } from "../../../types/addressValidationResult";
import { GoogleAddressValidator } from "./validators/googleAddressValidator";
import { Env } from "../../../types/env";
import { DummyAddressValidator } from "./validators/dummyAddressValidator";

export interface AddressValidator {
  validateAddress(address: Address): Promise<AddressValidationResult>;
}

export function addressValidator(env: Env): AddressValidator {
  switch (env) {
    case Env.Dev: {
      return new DummyAddressValidator();
    }
    case Env.Staging: {
      return new GoogleAddressValidator(env);
    }
  }
}
