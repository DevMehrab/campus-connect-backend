import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

export const generateToken = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
