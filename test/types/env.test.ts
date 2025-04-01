import { Env, validateEnvironment } from "../../resources/types/env";

test("GIVEN env is 'staging' WHEN validator is used THEN it is converted to Env.Staging enum", async () => {
  // THEN
  expect(validateEnvironment("staging")).toStrictEqual(Env.Staging);
});

test("GIVEN env is 'dev' WHEN validator is used THEN it is converted to Env.Dev enum", async () => {
  // THEN
  expect(validateEnvironment("dev")).toStrictEqual(Env.Dev);
});
