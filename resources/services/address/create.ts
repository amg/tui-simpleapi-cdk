import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { parseAddress } from "../../types/address";
import { get as getUser } from "../user/get";
import { addressValidator } from "./validation/addressValidator";
import { validateEnvironment } from "../../types/env";

const dynamodb = new DynamoDB({});

async function create(body: string | null, userId: string | undefined) {
  const uuid = randomUUID();

  // simple check for userId param to be present
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing userId" }),
    };
  }

  // If no body, return an error
  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing body" }),
    };
  }

  // TODO: add validation library like Zod to check that body is correct object
  // for now just sanity check manually to prevent bad data stored in this table
  const address = parseAddress(body);

  // check if user exists, otherwise do not add address
  const result = await getUser(userId);

  if (result.statusCode != 200) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "User not found" }),
    };
  }

  // validate address with 3rdParty
  const env = validateEnvironment(process.env.ENV || "");
  if (!env) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `Incorrect environment ${env}` }),
    };
  }
  const validator = addressValidator(env);

  const validationResult = await validator.validateAddress(address);
  if (!validationResult.isValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Address is not valid" }),
    };
  }

  const item = {
    id: uuid,
    userId: userId,
    ...address,
  };

  // Creat the post
  const created = await dynamodb.send(
    new PutCommand({
      TableName: process.env.ADDRESS_TABLE_NAME,
      Item: item,
    })
  );

  if (created.$metadata.httpStatusCode !== 200) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Whoops, something went wrong" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
}

export { create };
