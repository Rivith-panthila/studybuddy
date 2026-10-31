
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Not authorized, token missing",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { sub: string; type: string };

    if (decoded.type !== "access") {
  res.status(401).json({
    message: "Invalid access token",
  });
  return;
}
    req.user = { id: decoded.sub };

    next();
  } catch (error) {
    res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};
