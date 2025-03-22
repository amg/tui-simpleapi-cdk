import { APIGatewayProxyEvent } from 'aws-lambda';
import { get } from '../services/user/get';
import { deleteUser } from '../services/user/delete';

export const handler = async (event: APIGatewayProxyEvent) => {
  // address endpoint expects an id path parameter
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing path parameter: id' }),
    };
  }

  try {
    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET':
        return await get(id);
      case 'DELETE':
        return await deleteUser(id);
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
