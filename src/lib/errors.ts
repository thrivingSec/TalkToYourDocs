// lib/errors.ts
export class AuthError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class ServerError extends AuthError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'ServerError';
  }
}