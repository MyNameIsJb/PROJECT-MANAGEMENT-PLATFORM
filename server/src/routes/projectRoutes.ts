import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { createProject } from "../controllers/projecController";

const router = Router();

router.post("/", protect, createProject);

export default router;
