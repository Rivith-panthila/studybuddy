
import express from "express";
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getCalendarAssignments,
} from "../controllers/assignmentController";
import { protect } from "../middleware/authMiddleware";


const router = express.Router();

router.post("/", protect, createAssignment);
router.get("/", protect, getAssignments);
router.put("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);
router.get("/calendar", protect, getCalendarAssignments);

export default router;
