import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createBoard,
  getBoardsByWorkspace,
} from "../controllers/boardController";

const router = Router();

router.use(protect);
router.post("/", createBoard);
router.get("/workspace/:workspaceId", getBoardsByWorkspace);

export default router;
