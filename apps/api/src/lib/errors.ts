export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export function notFound(message = "Not found") {
  return new AppError(404, message);
}

export function unauthorized(message = "Unauthorized") {
  return new AppError(401, message);
}

export function badRequest(message = "Bad request") {
  return new AppError(400, message);
}

export function forbidden(message = "Forbidden") {
  return new AppError(403, message);
}
