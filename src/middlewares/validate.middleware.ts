import { ZodTypeAny, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
          path: err.path.join("."),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          message: formattedErrors[0]?.message || "Validation Error",
          errorMessages: formattedErrors
        });
        return;
      }
      next(error);
    }
  };
};
