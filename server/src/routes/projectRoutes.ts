import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  addMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  removeMember,
  updateProject,
} from "../controllers/projectController";
import { createTask, getTasks } from "../controllers/taskController";

const router = Router();

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router
  .route("/:id")
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);
router.route("/:id/tasks").get(getTasks).post(createTask);

router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

export default router;
