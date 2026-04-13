export class ApiError extends Error {
  constructor(message: string) { super(message); this.name = 'ApiError'; }
}
export class AuthError extends Error {
  constructor(message: string) { super(message); this.name = 'AuthError'; }
}
export class FileError extends Error {
  constructor(message: string) { super(message); this.name = 'FileError'; }
}
export class FileReadError extends FileError {}
export class TokenReadError extends FileError {}

export type AppError = ApiError | AuthError | FileError;
