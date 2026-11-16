import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { moveTask, updateTask } from "../controllers/taskController";

const router = Router();

router.use(protect);

router.route("/:id").patch(updateTask);
router.route("/:id/move").patch(moveTask);

export default router;
