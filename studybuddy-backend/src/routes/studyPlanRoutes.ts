import express from "express";
import { createStudyPlan,getMyStudyPlans,updateStudyTaskStatus, } from "../controllers/studyPlanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/generate", protect, createStudyPlan);
router.get("/", protect, getMyStudyPlans);
router.patch(
  "/:planId/tasks/:taskId",
  protect,
  updateStudyTaskStatus
);

export default router;