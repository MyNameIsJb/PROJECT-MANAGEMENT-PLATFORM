import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createWorkspace,
  getWorkspaces,
} from "../controllers/workspaceController";

const router = Router();

router.use(protect);

router.post("/", createWorkspace);
router.get("/", getWorkspaces);

export default router;
