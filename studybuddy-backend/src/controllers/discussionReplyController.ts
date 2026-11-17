
import { Request, Response } from "express";
import mongoose from "mongoose";
import Discussion from "../models/Discussion";
import DiscussionReply from "../models/DiscussionReply";
import { getIO } from "../config/socket";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const createReply = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body;
    const discussionId = req.params.discussionId;
    const userId = req.user!.id;

    if (
      typeof discussionId !== "string" ||
      !mongoose.Types.ObjectId.isValid(discussionId)
    ) {
      res.status(400).json({ message: "Invalid discussion ID" });
      return;
    }

    if (
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 2000
    ) {
      res.status(400).json({
        message: "Reply must contain between 1 and 2000 characters",
      });
      return;
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      res.status(404).json({ message: "Discussion not found" });
      return;
    }

    const reply = await DiscussionReply.create({
      discussionId,
      userId,
      content: content.trim(),
    });

    const populatedReply = await DiscussionReply.findById(reply._id)
      .populate("userId", "name profileImage");

    if (!populatedReply) {
      res.status(500).json({ message: "Failed to retrieve created reply" });
      return;
    }

    getIO()
      .to(`discussion:${discussionId}`)
      .emit("reply:new", populatedReply);

    res.status(201).json({
      message: "Reply created successfully",
      reply: populatedReply,
    });
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({ message: "Failed to create reply" });
  }
};

export const getReplies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const discussionId = req.params.discussionId;

    if (
      typeof discussionId !== "string" ||
      !mongoose.Types.ObjectId.isValid(discussionId)
    ) {
      res.status(400).json({ message: "Invalid discussion ID" });
      return;
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      res.status(404).json({ message: "Discussion not found" });
      return;
    }

    const replies = await DiscussionReply.find({ discussionId })
      .populate("userId", "name profileImage")
      .sort({ createdAt: 1 });

    res.status(200).json({ replies });
  } catch (error) {
    console.error("Get replies error:", error);
    res.status(500).json({ message: "Failed to get replies" });
  }
};

export const updateReply = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body;
    const replyId = req.params.replyId;

    if (
      typeof replyId !== "string" ||
      !mongoose.Types.ObjectId.isValid(replyId)
    ) {
      res.status(400).json({ message: "Invalid reply ID" });
      return;
    }

    if (
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 2000
    ) {
      res.status(400).json({
        message: "Reply must contain between 1 and 2000 characters",
      });
      return;
    }

    const reply = await DiscussionReply.findOneAndUpdate(
      {
        _id: replyId,
        userId: req.user!.id,
      },
      {
        content: content.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!reply) {
      res.status(404).json({ message: "Reply not found" });
      return;
    }

    const populatedReply = await DiscussionReply.findById(reply._id)
      .populate("userId", "name profileImage");

    if (!populatedReply) {
      res.status(404).json({ message: "Reply not found" });
      return;
    }

    getIO()
      .to(`discussion:${reply.discussionId.toString()}`)
      .emit("reply:updated", populatedReply);

    res.status(200).json({
      message: "Reply updated successfully",
      reply: populatedReply,
    });
  } catch (error) {
    console.error("Update reply error:", error);
    res.status(500).json({ message: "Failed to update reply" });
  }
};

export const deleteReply = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const replyId = req.params.replyId;

    if (
      typeof replyId !== "string" ||
      !mongoose.Types.ObjectId.isValid(replyId)
    ) {
      res.status(400).json({ message: "Invalid reply ID" });
      return;
    }

    const reply = await DiscussionReply.findOneAndDelete({
      _id: replyId,
      userId: req.user!.id,
    });

    if (!reply) {
      res.status(404).json({ message: "Reply not found" });
      return;
    }

    getIO()
      .to(`discussion:${reply.discussionId.toString()}`)
      .emit("reply:deleted", {
        replyId: reply._id.toString(),
        discussionId: reply.discussionId.toString(),
      });

    res.status(200).json({
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({ message: "Failed to delete reply" });
  }
};
