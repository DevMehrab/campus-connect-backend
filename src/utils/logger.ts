import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { config } from "../config";

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp }) => {
  const date = new Date(timestamp as string);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${date.toDateString()} ${hours}:${minutes}:${seconds} - [${level}]: ${message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp(),
    config.env === "development" ? colorize() : winston.format.uncolorize(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "winston", "successes", "usm-%DATE%-success.log"),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ]
});

export const errorLogger = winston.createLogger({
  level: "error",
  format: combine(
    timestamp(),
    config.env === "development" ? colorize() : winston.format.uncolorize(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "winston", "errors", "usm-%DATE%-error.log"),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ]
});

export const warnLogger = winston.createLogger({
  level: "warn",
  format: combine(
    timestamp(),
    config.env === "development" ? colorize() : winston.format.uncolorize(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "winston", "warnings", "usm-%DATE%-warn.log"),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ]
});
