export const eventLogger = () => {
  return {
    before: async ({ event, context }: any) => console.log(`Logger works for ${context.functionName}:`, event)
  }
};