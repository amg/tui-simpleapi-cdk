import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDB({});

export async function deleteAddress(id: string) {
  await dynamodb.send(
    new DeleteCommand({
      TableName: process.env.ADDRESS_TABLE_NAME,
      Key: {
        id: id,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Address '${id}' deleted` }),
  };
}