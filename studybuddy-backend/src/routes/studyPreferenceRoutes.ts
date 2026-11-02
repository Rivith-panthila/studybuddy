import express from "express";
import {saveStudyPreferences,getStudyPreferences} from "../controllers/studyPreferenceController";
import { protect } from "../middleware/authMiddleware";


const router = express.Router();

router.post("/", protect, saveStudyPreferences);

export default router;