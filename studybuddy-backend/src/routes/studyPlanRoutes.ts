import express from "express";
import { createStudyPlan,getMyStudyPlans,updateStudyTaskStatus, rescheduleStudyTask, getTodayTasks, getStudyProgress,deleteStudyPlan,updateStudyTask, } from "../controllers/studyPlanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/generate", protect, createStudyPlan);
router.get("/", protect, getMyStudyPlans);
router.patch(
  "/:planId/tasks/:taskId",
  protect,
  updateStudyTaskStatus
);

router.patch(
  "/:planId/tasks/:taskId/reschedule",
  protect,
  rescheduleStudyTask
);

router.get("/today", protect, getTodayTasks);
router.get("/progress", protect, getStudyProgress);
router.delete("/:planId", protect, deleteStudyPlan);
router.put(
  "/:planId/tasks/:taskId",
  protect,
  
  updateStudyTask
);
export default router;