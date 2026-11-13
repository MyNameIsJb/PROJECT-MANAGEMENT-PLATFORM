import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { updateTask } from "../controllers/taskController";

const router = Router();

router.use(protect);

router.route("/:id").patch(updateTask);

export default router;
