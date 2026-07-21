export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number = 500, isOperational = true, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 400, true, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
