import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createProject,
  getProjectById,
  getProjects,
} from "../controllers/projectController";
import { createTask, getTasks } from "../controllers/taskController";

const router = Router();

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProjectById);
router.route("/:id/tasks").get(getTasks).post(createTask);

export default router;
