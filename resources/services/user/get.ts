import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDB({});

export async function get(id: string) {
  // Get the post from DynamoDB
  const result = await dynamodb.send(
    new GetCommand({
      TableName: process.env.USER_TABLE_NAME,
      Key: {
        id: id,
      },
    })
  );

  // If the post is not found, return a 404
  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'User not found' }),
    };
  }

  // Otherwise, return the user
  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
}