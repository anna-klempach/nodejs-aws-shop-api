export const errorHandler = () => ({
  onError: ({ error }: any) => {
    return { message: error?.toString() || 'Oops, something went wrong...', statusCode: error?.statusCode || 500 }
  }
});