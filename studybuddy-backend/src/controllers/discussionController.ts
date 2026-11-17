
import { Request, Response } from "express";
import mongoose from "mongoose";
import Discussion from "../models/Discussion";
import fs from "node:fs/promises";
import path from "node:path";
import { getIO } from "../config/socket";
import DiscussionReply from "../models/DiscussionReply";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const createDiscussion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const file = req.file;

  try {
    const { title, content } = req.body;
    const userId = req.user!.id;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      if (file) {
        await fs.unlink(file.path).catch(() => {});
      }

      res.status(400).json({
        message: "Please provide a valid title and content",
      });
      return;
    }

    const discussionData: Record<string, unknown> = {
      userId,
      title: title.trim(),
      content: content.trim(),
    };

    if (file) {
      discussionData.attachment = {
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
      };
    }

    let discussion;

    try {
      discussion = await Discussion.create(discussionData);
    } catch (error) {
      if (file) {
        await fs.unlink(file.path).catch(() => {});
      }
      throw error;
    }

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("userId", "name profileImage");

    if (!populatedDiscussion) {
      res.status(500).json({
        message: "Failed to retrieve created discussion",
      });
      return;
    }

    getIO().emit("discussion:new", populatedDiscussion);

    res.status(201).json({
      message: "Discussion created successfully",
      discussion: populatedDiscussion,
    });
  } catch (error) {
    console.error("Create discussion error:", error);
    res.status(500).json({
      message: "Failed to create discussion",
    });
  }
};

export const getDiscussions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const discussions = await Discussion.find()
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ discussions });
  } catch (error) {
    console.error("Get discussions error:", error);
    res.status(500).json({
      message: "Failed to get discussions",
    });
  }
};

export const updateDiscussion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const discussionId = req.params.id;
    const { title, content } = req.body;

    if (
      typeof discussionId !== "string" ||
      !mongoose.Types.ObjectId.isValid(discussionId)
    ) {
      res.status(400).json({
        message: "Invalid discussion ID",
      });
      return;
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      res.status(400).json({
        message: "Please provide a valid title and content",
      });
      return;
    }

    const discussion = await Discussion.findOneAndUpdate(
      {
        _id: discussionId,
        userId: req.user!.id,
      },
      {
        title: title.trim(),
        content: content.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!discussion) {
      res.status(404).json({
        message: "Discussion not found",
      });
      return;
    }

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("userId", "name profileImage");

    if (!populatedDiscussion) {
      res.status(404).json({
        message: "Discussion not found",
      });
      return;
    }

    getIO().emit("discussion:updated", populatedDiscussion);

    res.status(200).json({
      message: "Discussion updated successfully",
      discussion: populatedDiscussion,
    });
  } catch (error) {
    console.error("Update discussion error:", error);
    res.status(500).json({
      message: "Failed to update discussion",
    });
  }
};

export const deleteDiscussion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const discussionId = req.params.id;

    if (
      typeof discussionId !== "string" ||
      !mongoose.Types.ObjectId.isValid(discussionId)
    ) {
      res.status(400).json({
        message: "Invalid discussion ID",
      });
      return;
    }

    const discussion = await Discussion.findOne({
      _id: discussionId,
      userId: req.user!.id,
    });

    if (!discussion) {
      res.status(404).json({
        message: "Discussion not found",
      });
      return;
    }

    await DiscussionReply.deleteMany({
      discussionId: discussion._id,
    });

    if (discussion.attachment?.fileUrl) {
      const fileName = path.basename(discussion.attachment.fileUrl);
      const filePath = path.join(
        process.cwd(),
        "src",
        "uploads",
        fileName
      );

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    await Discussion.deleteOne({ _id: discussion._id });

    getIO().emit("discussion:deleted", {
      discussionId: discussion._id.toString(),
    });

    res.status(200).json({
      message: "Discussion, replies and attachment deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    res.status(500).json({
      message: "Failed to delete discussion",
    });
  }
};