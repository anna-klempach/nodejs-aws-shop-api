export function buildResponse<T>(statusCode: number, body: T) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': '*'
    },
    body: JSON.stringify(body)
  }
}