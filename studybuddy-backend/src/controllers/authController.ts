import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
} from "../util/jwt";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Please provide name, email and password",
      });
      return;
    }

    if (typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string") {
      res.status(400).json({
        message: "Name, email and password must be text",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        message: "Email already registered",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Failed to register user",
    });
  }
};


export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Please provide email and password",
      });
      return;
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Email and password must be text",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // const token = jwt.sign(
    //   { id: user._id },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "1d" }
    // );

    const accessToken = signAccessToken(user._id.toString());
const refreshToken = signRefreshToken(user._id.toString());

    res.status(200).json({
  message: "Login successful",
  accessToken,
  refreshToken,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Failed to login",
    });
  }
};



export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        message: "Refresh token is required",
      });
      return;
    }

   const decoded = jwt.verify(
  refreshToken,
  process.env.JWT_SECRET as string
) as { sub: string; type: string };

 if (decoded.type !== "refresh") {
  res.status(401).json({
    message: "Invalid refresh token",
  });
  return;
}

    const newAccessToken = signAccessToken(decoded.sub);

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};


