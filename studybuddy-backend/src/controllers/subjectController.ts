
import { Request, Response } from "express";
import Subject from "../models/Subject";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Create Subject
export const createSubject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        message: "Please provide a valid subject name",
      });
      return;
    }

    const subject = await Subject.create({
      userId: req.user!.id,
      name: name.trim(),
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);
    res.status(500).json({
      message: "Failed to create subject",
    });
  }
};

// Get All Subjects
export const getSubjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const subjects = await Subject.find({
      userId: req.user!.id,
    });

    res.status(200).json({ subjects });
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({
      message: "Failed to get subjects",
    });
  }
};


// Update Subject
export const updateSubject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        message: "Please provide a valid subject name",
      });
      return;
    }

    const subject = await Subject.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user!.id,
      },
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!subject) {
      res.status(404).json({
        message: "Subject not found",
      });
      return;
    }

    res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    console.error("Update subject error:", error);
    res.status(500).json({
      message: "Failed to update subject",
    });
  }
};

