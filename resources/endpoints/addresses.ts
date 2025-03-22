import { APIGatewayProxyEvent } from 'aws-lambda';
import { getAll } from '../services/address/getAll';
import { create } from '../services/address/create';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const userId = event.queryStringParameters?.userId;
    
    // filtering search params
    const suburb = event.queryStringParameters?.suburb;
    const postcode = event.queryStringParameters?.postcode;
    
    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET':
        return await getAll(userId, suburb, postcode);
      case 'POST':
        return await create(event.body, userId);
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