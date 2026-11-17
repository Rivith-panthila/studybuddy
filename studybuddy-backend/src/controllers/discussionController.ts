
import { Request, Response } from "express";
import mongoose from "mongoose";
import Discussion from "../models/Discussion";
import Subject from "../models/Subject";
import fs from "node:fs/promises";
import path from "node:path";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}


export const createDiscussion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, subjectId } = req.body;
    const userId = req.user!.id;
    const file = req.file;

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim() ||
      !content ||
      typeof content !== "string" ||
      !content.trim() ||
      !subjectId ||
      typeof subjectId !== "string" ||
      !mongoose.Types.ObjectId.isValid(subjectId)
    ) {
      res.status(400).json({
        message: "Please provide a valid title, content and subject",
      });
      return;
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      userId,
    });

    if (!subject) {
      res.status(404).json({
        message: "Subject not found",
      });
      return;
    }

    const discussionData: Record<string, unknown> = {
      userId,
      subjectId,
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

    const discussion = await Discussion.create(discussionData);

    res.status(201).json({
      message: "Discussion created successfully",
      discussion,
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
    const { subjectId } = req.query;

    const filter: Record<string, unknown> = {};

    if (subjectId) {
      if (
        typeof subjectId !== "string" ||
        !mongoose.Types.ObjectId.isValid(subjectId)
      ) {
        res.status(400).json({
          message: "Invalid subject ID",
        });
        return;
      }

      filter.subjectId = subjectId;
    }

    const discussions = await Discussion.find(filter)
      .populate("userId", "name profileImage")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ discussions });
  } catch (error) {
    console.error("Get discussions error:", error);
    res.status(500).json({
      message: "Failed to get discussions",
    });
  }
};

// Update Own Discussion
export const updateDiscussion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content } = req.body;

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim() ||
      !content ||
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
        _id: req.params.id,
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

    res.status(200).json({
      message: "Discussion updated successfully",
      discussion,
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
    const discussion = await Discussion.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!discussion) {
      res.status(404).json({
        message: "Discussion not found",
      });
      return;
    }

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

    res.status(200).json({
      message: "Discussion and attachment deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    res.status(500).json({
      message: "Failed to delete discussion",
    });
  }
};