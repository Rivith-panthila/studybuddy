import { Request, Response } from "express";
import Coursework from "../models/Coursework";
import StudyPreference from "../models/StudyPreference";
import StudyPlan from "../models/StudyPlan";
import generateStudyPlan from "../service/studyPlanService";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createStudyPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseworkId } = req.body;
    const userId = req.user!.id;

   
    if (
      typeof courseworkId !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(courseworkId)
    ) {
      res.status(400).json({
        message: "Please provide a valid coursework ID",
      });
      return;
    }

    
    const coursework = await Coursework.findOne({
      _id: courseworkId,
      userId,
    });

    if (!coursework) {
      res.status(404).json({
        message: "Coursework not found",
      });
      return;
    }

    
    const preferences = await StudyPreference.findOne({
      userId,
    });

    if (!preferences) {
      res.status(404).json({
        message: "Please save your study preferences first",
      });
      return;
    }

   
    const dailySchedule = await generateStudyPlan(
      coursework.analysis,
      {
        hoursPerDay: preferences.hoursPerDay,
        availableDays: preferences.availableDays,
        preferredTime: preferences.preferredTime,
        breakDuration: preferences.breakDuration,
      }
    );

    
    const studyPlan = await StudyPlan.create({
      userId,
      courseworkId,
      dailySchedule,
    });

    res.status(201).json({
      message: "AI study plan generated successfully",
      studyPlan,
    });
  } catch (error) {
    console.error("Create study plan error:", error);

    res.status(500).json({
      message: "Failed to generate study plan",
    });
  }
};

export const getMyStudyPlans = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studyPlans = await StudyPlan.find({
      userId: req.user!.id,
    })
      .populate("courseworkId", "title deadline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Study plans retrieved successfully",
      count: studyPlans.length,
      studyPlans,
    });
  } catch (error) {
    console.error("Get study plans error:", error);

    res.status(500).json({
      message: "Failed to retrieve study plans",
    });
  }
};

export const updateStudyTaskStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { planId, taskId } = req.params;
    const { status } = req.body;

    if (
      !/^[0-9a-fA-F]{24}$/.test(String(planId)) ||
      !/^[0-9a-fA-F]{24}$/.test(String(taskId))
    ) {
      res.status(400).json({
        message: "Invalid study plan ID or task ID",
      });
      return;
    }

    if (!["Pending", "Completed"].includes(status)) {
      res.status(400).json({
        message: "Status must be Pending or Completed",
      });
      return;
    }

    const studyPlan = await StudyPlan.findOne({
      _id: planId,
      userId: req.user!.id,
    });

    if (!studyPlan) {
      res.status(404).json({
        message: "Study plan not found",
      });
      return;
    }

    let taskFound = false;

    for (const day of studyPlan.dailySchedule) {
      for (const task of day.tasks) {
        if (task._id.toString() === taskId) {
          task.status = status;
          taskFound = true;
          break;
        }
      }

      if (taskFound) break;
    }

    if (!taskFound) {
      res.status(404).json({
        message: "Study task not found",
      });
      return;
    }

    await studyPlan.save();

    res.status(200).json({
      message: "Study task status updated successfully",
      studyPlan,
    });
  } catch (error) {
    console.error("Update study task error:", error);

    res.status(500).json({
      message: "Failed to update study task status",
    });
  }
};