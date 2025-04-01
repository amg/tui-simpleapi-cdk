import { DummyAddressValidator } from "../../../../resources/services/address/validation/validators/dummyAddressValidator";

test("GIVEN address has empty 'name' WHEN dummy validator is used THEN errors includes 'name'", async () => {
  const validator = new DummyAddressValidator();

  const result = await validator.validateAddress({
    name: "",
    street: "street",
    suburb: "suburb",
    postcode: "postcode",
    state: "state",
    country: "country",
  });

  // THEN
  expect(result.isValid).toBeFalsy();
  expect(result.formattedAddress).toBeUndefined();
  expect(result.missingOrIncorrectComponents).toStrictEqual(["name"]);
});

test("GIVEN address has empty 'street' WHEN dummy validator is used THEN errors includes 'street'", async () => {
  const validator = new DummyAddressValidator();

  const result = await validator.validateAddress({
    name: "name",
    street: "",
    suburb: "suburb",
    postcode: "postcode",
    state: "state",
    country: "country",
  });

  // THEN
  expect(result.isValid).toBeFalsy();
  expect(result.formattedAddress).toBeUndefined();
  expect(result.missingOrIncorrectComponents).toStrictEqual(["street"]);
});

test("GIVEN address has empty multiple fields WHEN dummy validator is used THEN errors includes all of them", async () => {
  const validator = new DummyAddressValidator();

  const result = await validator.validateAddress({
    name: "name",
    street: "street",
    suburb: "",
    postcode: "",
    state: "state",
    country: "",
  });

  // THEN
  expect(result.isValid).toBeFalsy();
  expect(result.formattedAddress).toBeUndefined();
  expect(result.missingOrIncorrectComponents).toStrictEqual([
    "suburb",
    "postcode",
    "country",
  ]);
});

test("GIVEN address has NO empty fields WHEN dummy validator is used THEN errors is empty and result is valid", async () => {
  const validator = new DummyAddressValidator();

  const address = {
    name: "name",
    street: "street",
    suburb: "suburb",
    postcode: "postcode",
    state: "state",
    country: "country",
  };
  const result = await validator.validateAddress(address);

  // THEN
  expect(result.isValid).toBeTruthy();
  expect(result.formattedAddress).toBe(address.toString());
  expect(result.missingOrIncorrectComponents).toStrictEqual([]);
});
