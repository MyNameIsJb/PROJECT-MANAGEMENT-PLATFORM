import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createProject,
  getProjectById,
  getProjects,
} from "../controllers/projectController";

const router = Router();

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProjectById);

export default router;
