export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown) {
  console.error(error);

  if (error instanceof AppError) {
    return new Response(error.message, { status: error.statusCode });
  }

  if (error instanceof Error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response('Internal Server Error', { status: 500 });
} 
