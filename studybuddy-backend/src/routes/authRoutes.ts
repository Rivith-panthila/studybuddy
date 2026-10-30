
import express from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import User from "../models/User";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to get profile" });
  }
});

export default router;
