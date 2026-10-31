
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signAccessToken = (userId: string) => {
  return jwt.sign(
    { sub: userId, type: "access" },
    JWT_SECRET,
    { expiresIn: "30m" }
  );
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign(
    { sub: userId, type: "refresh" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};
