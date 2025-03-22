import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { User, validateUser } from '../../types/user';

const dynamodb = new DynamoDB({});

async function create(body: string | null) {
  const uuid = randomUUID();
  
  // If no body, return an error
  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing body' }),
    };
  }

  // TODO: add validation library like Zod to check that body is correct object
  // for now just sanity check manually to prevent bad data stored in this table
  const bodyParsed = validateUser(body);
  if (!bodyParsed) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid user body' }),
    };
  }

  const item = {
    id: uuid,
    ...bodyParsed,
  };

  // Creat the post
  const created = await dynamodb.send(
    new PutCommand({
      TableName: process.env.USER_TABLE_NAME,
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