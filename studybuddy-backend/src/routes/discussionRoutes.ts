
import express from "express";

import {
  createDiscussion,
  getDiscussions,
  updateDiscussion,
  deleteDiscussion,
} from "../controllers/discussionController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.get("/", getDiscussions);

router.post("/", createDiscussion);

router.put("/:id", updateDiscussion);

router.delete("/:id", deleteDiscussion);

export default router;
