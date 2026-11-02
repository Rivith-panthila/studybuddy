import express from "express";
import { uploadCoursework,getMyCourseworks,getCourseworkById,deleteCoursework } from "../controllers/courseworkController";
import { protect } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("coursework"),
  uploadCoursework
);

router.get("/", protect, getMyCourseworks);
router.get("/:id", protect, getCourseworkById);
router.delete("/:id", protect, deleteCoursework);

export default router;