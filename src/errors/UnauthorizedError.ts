import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message: string = "You are not authorized to perform this action") {
    super(401, message);
  }
}
