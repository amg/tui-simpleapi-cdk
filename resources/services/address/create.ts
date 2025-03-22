import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { validateAddress } from '../../types/address';
import { get as getUser } from '../user/get';

const dynamodb = new DynamoDB({});

async function create(body: string | null, userId: string | undefined) {
  const uuid = randomUUID();
  
  // simple check for userId param to be present
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing userId' }),
    };
  }
  
  // If no body, return an error
  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing body' }),
    };
  }

  // TODO: add validation library like Zod to check that body is correct object
  // for now just sanity check manually to prevent bad data stored in this table
  const bodyParsed = validateAddress(body);
  if (!bodyParsed) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid address body' }),
    };
  }

  // check if user exists, otherwise do not add address
  const result = await getUser(userId);

  if (result.statusCode != 200) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'User not found' }),
    };
  }

  const item = {
    id: uuid,
    userId: userId,
    ...bodyParsed,
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