import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDB({});

export async function get(id: string, userId: string | undefined) {
  // check that userId is present
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing userId' }),
    };
  }

  // TODO: no integrity check of userId existing in the Users table

  // Get the post from DynamoDB
  const result = await dynamodb.send(
    new GetCommand({
      TableName: process.env.ADDRESS_TABLE_NAME,
      Key: {
        id: id
      }
    })
  );

  // If the post is not found, return a 404
  // TODO: userId and id could be a composite key so we do not fetch an address unless userId matches
  //  instead for now just ensure userId returned matches the userId passed in
  if (!result.Item || result.Item.userId !== userId) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Address not found' }),
    };
  }

  // Otherwise, return the address
  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
}