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

// Get All Assignments
export const getAssignments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const assignments = await Assignment.find({
      userId: req.user!.id,
    }).populate("subjectId", "name");

    res.status(200).json({
      message: "Assignments retrieved successfully",
      assignments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve assignments",
    });
  }
};

// Update Assignment
export const updateAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, dueDate, status } = req.body;

    if (
      title === undefined &&
      dueDate === undefined &&
      status === undefined
    ) {
      res.status(400).json({
        message: "Please provide details to update",
      });
      return;
    }

    if (title !== undefined && (
      typeof title !== "string" || !title.trim()
    )) {
      res.status(400).json({ message: "Invalid title" });
      return;
    }

    if (
      status !== undefined &&
      !["Pending", "Completed"].includes(status)
    ) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const updates: {
      title?: string;
      dueDate?: Date;
      status?: "Pending" | "Completed";
    } = {};

    if (title !== undefined) updates.title = title.trim();

    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);

      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: "Invalid due date" });
        return;
      }

      updates.dueDate = parsedDate;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user!.id,
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    res.status(200).json({
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update assignment",
    });
  }
};


// Delete Assignment
export const deleteAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!assignment) {
      res.status(404).json({
        message: "Assignment not found",
      });
      return;
    }

    res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete assignment",
    });
  }
};