import { Request, Response } from "express";
import analyzeCourseworkPDF from "../service/pdfAnalysisService";
import Coursework from "../models/Coursework";
import fs from "fs/promises";
import path from "path";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const uploadCoursework = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  let filePath: string | undefined;

  try {
    if (!req.file) {
      res.status(400).json({
        message: "Please upload a PDF file",
      });
      return;
    }

    filePath = req.file.path;

    // Analyze PDF using Gemini
    const analysis = await analyzeCourseworkPDF(filePath);

    if (!analysis) {
      res.status(500).json({
        message: "Gemini could not analyze the PDF",
      });
      return;
    }

    // Get filename without .pdf extension
    const title = path
      .parse(req.file.originalname)
      .name.trim();

    // Save coursework analysis in MongoDB
    const coursework = await Coursework.create({
      userId: req.user!.id,
      title,
      analysis,
      originalFileName: req.file.originalname,
    });

    res.status(201).json({
      message: "Coursework analyzed and saved successfully",
      coursework,
    });
  } catch (error) {
    console.error("Coursework upload error:", error);

    res.status(500).json({
      message: "Failed to analyze and save coursework",
    });
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch((error) => {
        console.error("Temporary PDF cleanup failed:", error);
      });
    }
  }
};

export const getMyCourseworks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const courseworks = await Coursework.find({
      userId: req.user!.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Courseworks retrieved successfully",
      count: courseworks.length,
      courseworks,
    });
  } catch (error) {
    console.error("Get courseworks error:", error);

    res.status(500).json({
      message: "Failed to retrieve courseworks",
    });
  }
};

export const getCourseworkById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({
        message: "Invalid coursework ID",
      });
      return;
    }

    const coursework = await Coursework.findOne({
      _id: id,
      userId: req.user!.id,
    });

    if (!coursework) {
      res.status(404).json({
        message: "Coursework not found",
      });
      return;
    }

    res.status(200).json({
      message: "Coursework retrieved successfully",
      coursework,
    });
  } catch (error) {
    console.error("Get coursework error:", error);

    res.status(500).json({
      message: "Failed to retrieve coursework",
    });
  }
};

export const deleteCoursework = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({
        message: "Invalid coursework ID",
      });
      return;
    }

    const coursework = await Coursework.findOneAndDelete({
      _id: id,
      userId: req.user!.id,
    });

    if (!coursework) {
      res.status(404).json({
        message: "Coursework not found",
      });
      return;
    }

    res.status(200).json({
      message: "Coursework deleted successfully",
    });
  } catch (error) {
    console.error("Delete coursework error:", error);

    res.status(500).json({
      message: "Failed to delete coursework",
    });
  }
};