import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import { buildResponse } from '../utils';

const tokenRegex = /^Basic\s+(.*)$/i;

export const handler = async (event: APIGatewayRequestAuthorizerEvent) => {
  console.log(event)
  try {
    const authorizationHeader = event.headers?.Authorization;
    if (!authorizationHeader) {
      throw { error: 401, message: 'Authorization header is not provided.' }
    }

    const tokenEncoded = authorizationHeader.match(tokenRegex)?.[1] || '';
    const tokenDecoded = Buffer.from(tokenEncoded, 'base64').toString('utf-8');
    console.log({ tokenDecoded })
    const expectedUserName = process.env.USER_NAME!;
    const expectedPassword = process.env[expectedUserName]!;
    if (tokenDecoded === `${expectedUserName}:${expectedPassword}`) {
      const policyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      };
      return {
        principalId: event.resource,
        policyDocument
      };
      // return buildResponse(200, 'Access granted.');
    }
    throw { error: 403, message: 'Access denied.' }
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};