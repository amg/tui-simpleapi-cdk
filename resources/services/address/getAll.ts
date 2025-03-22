import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDB({});

export async function getAll(
  userId: string | undefined,
  suburb: string | undefined,
  postcode: string | undefined,
) {
  let filterExpressions: string | undefined = [
    userId ? 'userId = :userId' : '',
    suburb ? 'suburb = :suburb' : '',
    postcode ? 'postcode = :postcode' : '',
  ].filter(Boolean).join(' AND ');

  let filterExpressionValues
  if (filterExpressions.length > 0) {
    filterExpressionValues = {
      ...(userId ? { ':userId': userId } : {}),
      ...(suburb ? { ':suburb': suburb } : {}),
      ...(postcode ? { ':postcode': postcode } : {}),
    }
  } else {
    filterExpressions = undefined
  }

  const command = new ScanCommand({
    TableName: process.env.ADDRESS_TABLE_NAME,
    FilterExpression: filterExpressions,
    ExpressionAttributeValues: filterExpressionValues,
  });

  const result = await dynamodb.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
}