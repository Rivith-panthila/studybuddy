import { Request, Response } from "express";
import StudyPreference from "../models/StudyPreference";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const saveStudyPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      hoursPerDay,
      availableDays,
      preferredTime,
      breakDuration,
    } = req.body;

    if (
      typeof hoursPerDay !== "number" ||
      !Array.isArray(availableDays) ||
      availableDays.length === 0 ||
      !["Morning", "Afternoon", "Evening"].includes(preferredTime) ||
      typeof breakDuration !== "number"
    ) {
      res.status(400).json({
        message: "Please provide valid study preferences",
      });
      return;
    }

    const preference = await StudyPreference.findOneAndUpdate(
      { userId: req.user!.id },
      {
        hoursPerDay,
        availableDays,
        preferredTime,
        breakDuration,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Study preferences saved successfully",
      preference,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save study preferences",
    });
  }
};

export const getStudyPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const preference = await StudyPreference.findOne({
      userId: req.user!.id,
    });

    if (!preference) {
      res.status(404).json({
        message: "Study preferences not found",
      });
      return;
    }

    res.status(200).json({
      message: "Study preferences retrieved successfully",
      preference,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve study preferences",
    });
  }
};