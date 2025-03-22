import { APIGatewayProxyEvent } from 'aws-lambda';
import { get } from '../services/address/get';
import { deleteAddress } from '../services/address/delete';

export const handler = async (event: APIGatewayProxyEvent) => {
  // address endpoint expects an id path parameter
  const id = event.pathParameters?.id;
  const userId = event.queryStringParameters?.userId;
  
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
        return await get(id, userId);
      case 'DELETE':
        // TODO: we don't care currently about the userId as IDs are uuids, to be improved in prod
        return await deleteAddress(id);
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
