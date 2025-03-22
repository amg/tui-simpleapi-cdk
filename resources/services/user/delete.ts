import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDB({});

export async function deleteUser(id: string) {
  await dynamodb.send(
    new DeleteCommand({
      TableName: process.env.USER_TABLE_NAME,
      Key: {
        id: id,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `User '${id}' deleted` }),
  };
}