import { Request, Response } from "express";
import Coursework from "../models/Coursework";
import StudyPreference from "../models/StudyPreference";
import StudyPlan from "../models/StudyPlan";
import generateStudyPlan from "../service/studyPlanService";
import mongoose from "mongoose";

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


export const rescheduleStudyTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const planId = String(req.params.planId);
const taskId = String(req.params.taskId);
    const { newDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(planId) ||
        !mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({ message: "Invalid plan or task ID" });
      return;
    }

    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      res.status(400).json({ message: "Please provide a valid date (YYYY-MM-DD)" });
      return;
    }

    const targetDate = new Date(`${newDate}T00:00:00.000Z`);

    if (isNaN(targetDate.getTime()) ||
        targetDate.toISOString().slice(0, 10) !== newDate) {
      res.status(400).json({ message: "Invalid date" });
      return;
    }

    const plan = await StudyPlan.findOne({
      _id: planId,
      userId: req.user!.id,
    });

    if (!plan) {
      res.status(404).json({ message: "Study plan not found" });
      return;
    }

    let taskToMove: any = null;
    let oldDayIndex = -1;
    let taskIndex = -1;

    plan.dailySchedule.forEach((day, dayIndex) => {
      const index = day.tasks.findIndex(
        (task) => task._id.toString() === taskId
      );

      if (index !== -1) {
        taskToMove = day.tasks[index];
        oldDayIndex = dayIndex;
        taskIndex = index;
      }
    });

    if (!taskToMove) {
      res.status(404).json({ message: "Study task not found" });
      return;
    }

    if (taskToMove.status === "Completed") {
      res.status(400).json({ message: "Completed tasks cannot be rescheduled" });
      return;
    }

    if (
      plan.dailySchedule[oldDayIndex].date.toISOString().slice(0, 10) === newDate
    ) {
      res.status(400).json({ message: "Task is already scheduled for this date" });
      return;
    }

    const preferences = await StudyPreference.findOne({
      userId: req.user!.id,
    });

    if (!preferences) {
      res.status(404).json({ message: "Study preferences not found" });
      return;
    }

    const weekdays = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
    ];

    const targetDayName = weekdays[targetDate.getUTCDay()];
    const availableDay = preferences.availableDays.find(
      (day) => day.day === targetDayName
    );

    if (!availableDay) {
      res.status(400).json({ message: "This day is not available for studying" });
      return;
    }

    const targetSchedule = plan.dailySchedule.find(
      (day) => day.date.toISOString().slice(0, 10) === newDate
    );

    const currentMinutes = targetSchedule
      ? targetSchedule.tasks.reduce((total, task) => total + task.duration, 0)
      : 0;

    const maxMinutes = Math.min(
      availableDay.hours,
      preferences.hoursPerDay
    ) * 60;

    if (currentMinutes + taskToMove.duration > maxMinutes) {
      res.status(400).json({
        message: "Not enough study time available on the selected day",
      });
      return;
    }

    const movedTask = {
      _id: taskToMove._id,
      title: taskToMove.title,
      description: taskToMove.description,
      duration: taskToMove.duration,
      status: taskToMove.status,
    };

    plan.dailySchedule[oldDayIndex].tasks.splice(taskIndex, 1);

    if (targetSchedule) {
      targetSchedule.tasks.push(movedTask as any);
    } else {
      plan.dailySchedule.push({
        date: targetDate,
        tasks: [movedTask],
      } as any);
    }

    await plan.save();

    res.status(200).json({
      message: "Study task rescheduled successfully",
      studyPlan: plan,
    });
  } catch (error) {
    console.error("Reschedule task error:", error);
    res.status(500).json({ message: "Failed to reschedule study task" });
  }
};

export const getTodayTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    ));

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const plans = await StudyPlan.find({
      userId: req.user!.id,
      "dailySchedule.date": {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).populate("courseworkId", "title");

    const todayTasks = plans.flatMap((plan) => {
      const todaySchedule = plan.dailySchedule.find(
        (day) => day.date >= startOfDay && day.date < endOfDay
      );

      return todaySchedule
        ? todaySchedule.tasks.map((task) => ({
            planId: plan._id,
            taskId: task._id,
            date: todaySchedule.date,
            title: task.title,
            description: task.description,
            duration: task.duration,
            status: task.status,
          }))
        : [];
    });

    res.status(200).json({
      date: startOfDay,
      totalTasks: todayTasks.length,
      tasks: todayTasks,
    });
  } catch (error) {
    console.error("Get today tasks error:", error);
    res.status(500).json({ message: "Failed to get today's tasks" });
  }
};

export const getStudyProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const plans = await StudyPlan.find({
      userId: req.user!.id,
    });

    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let totalStudyMinutes = 0;
    let completedStudyMinutes = 0;

    plans.forEach((plan) => {
      plan.dailySchedule.forEach((day) => {
        day.tasks.forEach((task) => {
          totalTasks++;
          totalStudyMinutes += task.duration;

          if (task.status === "Completed") {
            completedTasks++;
            completedStudyMinutes += task.duration;
          } else {
            pendingTasks++;
          }
        });
      });
    });

    const completionPercentage = totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage,
      totalStudyMinutes,
      completedStudyMinutes,
    });
  } catch (error) {
    console.error("Study progress error:", error);
    res.status(500).json({
      message: "Failed to get study progress",
    });
  }
};

export const deleteStudyPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const planId = String(req.params.planId);

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      res.status(400).json({ message: "Invalid study plan ID" });
      return;
    }

    const deletedPlan = await StudyPlan.findOneAndDelete({
      _id: planId,
      userId: req.user!.id,
    });

    if (!deletedPlan) {
      res.status(404).json({ message: "Study plan not found" });
      return;
    }

    res.status(200).json({
      message: "Study plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete study plan error:", error);
    res.status(500).json({
      message: "Failed to delete study plan",
    });
  }
};

export const updateStudyTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const planId = String(req.params.planId);
    const taskId = String(req.params.taskId);

    const { title, description, duration } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(planId) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      res.status(400).json({ message: "Invalid plan or task ID" });
      return;
    }

    if (
      (title !== undefined &&
        (typeof title !== "string" || !title.trim())) ||
      (description !== undefined &&
        (typeof description !== "string" || !description.trim())) ||
      (duration !== undefined &&
        (!Number.isFinite(duration) || duration < 1))
    ) {
      res.status(400).json({ message: "Invalid task details" });
      return;
    }

    if (
      title === undefined &&
      description === undefined &&
      duration === undefined
    ) {
      res.status(400).json({ message: "No task details provided" });
      return;
    }

    const plan = await StudyPlan.findOne({
      _id: planId,
      userId: req.user!.id,
    });

    if (!plan) {
      res.status(404).json({ message: "Study plan not found" });
      return;
    }

    let taskFound = false;

    for (const day of plan.dailySchedule) {
      const task = day.tasks.find(
        (item) => item._id.toString() === taskId
      );

      if (task) {
        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) {
          task.description = description.trim();
        }
        if (duration !== undefined) task.duration = duration;

        taskFound = true;
        break;
      }
    }

    if (!taskFound) {
      res.status(404).json({ message: "Study task not found" });
      return;
    }

    await plan.save();

    res.status(200).json({
      message: "Study task updated successfully",
      studyPlan: plan,
    });
  } catch (error) {
    console.error("Update study task error:", error);
    res.status(500).json({
      message: "Failed to update study task",
    });
  }
};