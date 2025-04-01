/**
 * @param isValid whether address has been matched/valid
 * @param formattedAddress undefined if [isValid] is false
 * @param missingOrIncorrectComponents if some address fields are incorrect or missing
 */
export interface AddressValidationResult {
  isValid: Boolean;
  formattedAddress: string | undefined;
  missingOrIncorrectComponents: String[];
}
