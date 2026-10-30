
import express from "express";

import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createSubject);
router.get("/", protect, getSubjects);
router.put("/:id", protect, updateSubject);
router.delete("/:id", protect, deleteSubject);

export default router;
