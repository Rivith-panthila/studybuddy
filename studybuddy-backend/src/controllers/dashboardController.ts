import { Request, Response } from "express";
import Subject from "../models/Subject";
import Assignment from "../models/Assignment";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const totalSubjects = await Subject.countDocuments({ userId });

    const totalAssignments = await Assignment.countDocuments({ userId });

    const pendingAssignments = await Assignment.countDocuments({
      userId,
      status: "Pending",
    });

    const completedAssignments = await Assignment.countDocuments({
      userId,
      status: "Completed",
    });

    const upcomingAssignments = await Assignment.find({
      userId,
      status: "Pending",
      dueDate: { $gte: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("subjectId", "name");

    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      stats: {
        totalSubjects,
        totalAssignments,
        pendingAssignments,
        completedAssignments,
      },
      upcomingAssignments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve dashboard statistics",
    });
  }
};