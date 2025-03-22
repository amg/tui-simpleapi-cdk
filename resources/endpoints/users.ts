import { APIGatewayProxyEvent } from 'aws-lambda';
import { getAll } from '../services/user/getAll';
import { create } from '../services/user/create';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET':
        return await getAll();
      case 'POST':
        return await create(event.body);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid HTTP method' }),
        };
    }
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};