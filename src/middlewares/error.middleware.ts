import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { config } from "../config";
import { errorLogger, logger } from "../utils/logger";
import { AppError } from "../errors/AppError";

interface IErrorResponse {
  success: boolean;
  message: string;
  errorSources: {
    path: string | number;
    message: string;
  }[];
  stack?: string;
}

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went terribly wrong!";
  let errorSources: IErrorResponse["errorSources"] = [
    {
      path: "",
      message: "Internal Server Error"
    }
  ];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSources = err.issues.map(issue => {
      const rawPath = issue.path[issue.path.length - 1];
      const path: string | number =
        typeof rawPath === "symbol" ? String(rawPath) : (rawPath as string | number);
      return {
        path,
        message: issue.message
      };
    });
  } else if (err?.code === 11000) {
    statusCode = 409;
    message = "Duplicate Entry";
    const match = err.message.match(/"([^"]*)"/);
    const extractedMessage = match ? `${match[1]} is already taken` : "Duplicate value entered";
    errorSources = [
      {
        path: "",
        message: extractedMessage
      }
    ];
  } else if (err?.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
    errorSources = [
      {
        path: err.path,
        message: `Invalid ${err.path}: ${err.value}`
      }
    ];
  } else if (err?.name === "ValidationError") {
    statusCode = 400;
    message = "Mongoose Validation Error";
    errorSources = Object.values(err.errors).map((val: any) => ({
      path: val?.path,
      message: val?.message
    }));
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }

  if (config.env === "production") {
    errorLogger.error(err);
  } else {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.env === "development" ? err?.stack : null
  });
};
