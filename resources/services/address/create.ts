import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { Address, parseAddress } from "../../types/address";
import { get as getUser } from "../user/get";
import { addressValidator } from "./validation/addressValidator";
import { validateEnvironment } from "../../types/env";
import { AddressValidationResult } from "../../types/addressValidationResult";

const dynamodb = new DynamoDB({});

async function create(body: string | null, userId: string | undefined) {
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

  return await validator
    .validateAddress(address)
    .then((validationResult) => {
      if (!validationResult.isValid) {
        throw new Error(
          `Address is invalid. Missing components: ${validationResult.missingOrIncorrectComponents}`
        );
      } else {
        return validationResult;
      }
    })
    .then((_) => storeAddressInDb(userId, address))
    .then((item: AddressResponse) => {
      return {
        statusCode: 200,
        body: JSON.stringify(item),
      };
    })
    .catch((e) => {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            e.message ??
            "Internal Server Error. Something didn't work with Google validator",
        }),
      };
    });
}

interface AddressResponse extends Address {
  id: string;
  userId: string;
}

async function storeAddressInDb(
  userId: string,
  address: Address
): Promise<AddressResponse> {
  const uuid = randomUUID();

  const item: AddressResponse = {
    id: uuid,
    userId: userId,
    ...address,
  };

  // Create address
  const created = await dynamodb.send(
    new PutCommand({
      TableName: process.env.ADDRESS_TABLE_NAME,
      Item: item,
    })
  );

  if (created.$metadata.httpStatusCode !== 200) {
    throw new Error(
      `DynamoDB failed to create address : ${created.$metadata.httpStatusCode}`
    );
  }
  return item;
}

export { create };
