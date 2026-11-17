
import express from "express";

import {
  createReply,
  getReplies,
  updateReply,
  deleteReply,
} from "../controllers/discussionReplyController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.get("/:discussionId", getReplies);
router.post("/:discussionId", createReply);
router.put("/reply/:replyId", updateReply);
router.delete("/reply/:replyId", deleteReply);

export default router;
