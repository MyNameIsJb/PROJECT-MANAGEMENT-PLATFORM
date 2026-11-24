import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  deleteTask,
  moveTask,
  updateTask,
} from "../controllers/taskController";
import {
  createComment,
  deleteComment,
  getComments,
} from "../controllers/commentController";

const router = Router();

router.use(protect);

router.route("/:id").patch(updateTask).delete(deleteTask);
router.route("/:id/move").patch(moveTask);
router.route("/:id/comments").get(getComments).post(createComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
