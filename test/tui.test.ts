import { parseAddress } from "../resources/types/address";

test("Parsing Address strips unknown fields", () => {
  // GIVEN
  const json = JSON.stringify({
    name: "home",
    dodgyData: "some bad data",
  });
  // WHEN
  const validated = parseAddress(json) as unknown as {
    name: string;
    dodgyData: string;
  };

  // THEN
  expect(validated.name).toBe("home");
  expect(validated.dodgyData).toBe(undefined);
});
