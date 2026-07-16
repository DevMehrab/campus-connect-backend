export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public timeStamp: string;

  constructor(statusCode: number, message: string, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.timeStamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
