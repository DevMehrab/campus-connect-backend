import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import apiRouter from "./routes";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(helmet());
app.use(
  express.json({
    limit: "10kb"
  })
);
app.use(cookieParser());
app.use("/api", apiLimiter);
app.use("/api/v1", apiRouter);
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "API is running smooth and secure!"
  });
});

app.use(globalErrorHandler);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API Endpoint Not Found",
    errorSources: [
      {
        path: req.originalUrl,
        message: "Route does not exist"
      }
    ]
  });
});

export default app;
