import { Request, Response } from "express";
import mongoose from "mongoose";
import Assignment from "../models/Assignment";
import Subject from "../models/Subject";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Create Assignment
export const createAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { subjectId, title, dueDate } = req.body;

    if (!subjectId || !title || !dueDate) {
      res.status(400).json({
        message: "Please provide subjectId, title and dueDate",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      res.status(400).json({ message: "Invalid subject ID" });
      return;
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: req.user!.id,
    });

    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    const assignment = await Assignment.create({
      userId: req.user!.id,
      subjectId,
      title: title.trim(),
      dueDate,
    });

    res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create assignment" });
  }
};