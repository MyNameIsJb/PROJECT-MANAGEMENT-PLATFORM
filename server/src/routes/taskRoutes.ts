import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createTask,
  getTasksByBoard,
  updateTaskPosition,
} from "../controllers/taskController";

const router = Router();

router.use(protect);
router.post("/", createTask);
router.get("/board/:boardId", getTasksByBoard);
router.patch("/:taskId/position", updateTaskPosition);

export default router;
