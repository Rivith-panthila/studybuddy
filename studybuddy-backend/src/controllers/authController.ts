import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
} from "../util/jwt";

import crypto from "node:crypto";
import sendEmail from "../config/email";

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

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, bio, profileImage } = req.body;

    if (
      (name !== undefined && (typeof name !== "string" || !name.trim())) ||
      (bio !== undefined && typeof bio !== "string") ||
      (profileImage !== undefined && typeof profileImage !== "string")
    ) {
      res.status(400).json({
        message: "Invalid profile details",
      });
      return;
    }

    const userId = (req as any).user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(profileImage !== undefined && {
          profileImage: profileImage.trim(),
        }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        message: "Please provide current and new passwords",
      });
      return;
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      res.status(400).json({
        message: "Passwords must be text",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        message: "New password must be at least 6 characters",
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        message: "New password must be different",
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Current password is incorrect",
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      message: "Failed to change password",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      res.status(400).json({
        message: "Please provide your email address",
      });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Do not reveal whether an email is registered.
    if (!user) {
      res.status(200).json({
        message: "If the email is registered, a reset link will be sent.",
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetLink =
      `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "StudyBuddy - Password Reset",
      `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your StudyBuddy password.</p>
        <p>This link expires in 15 minutes.</p>
        <a href="${resetLink}">Reset My Password</a>
        <p>If you did not request this, you can ignore this email.</p>
      `
    );

    res.status(200).json({
      message: "If the email is registered, a reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (
      !token ||
      typeof token !== "string" ||
      !newPassword ||
      typeof newPassword !== "string"
    ) {
      res.status(400).json({
        message: "Please provide a valid token and new password",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        message: "Reset link is invalid or expired",
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Failed to reset password",
    });
  }
};


