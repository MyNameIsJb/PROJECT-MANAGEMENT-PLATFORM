import { Request, Response } from "express";
import { Project } from "../models/Project";

export const createProject = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { name, key, description } = req.body;

    if (!name || !key) {
      return res
        .status(400)
        .json({ success: false, message: "Project name and key are required" });
    }

    const project = await Project.create({
      name,
      key,
      description,
      owner: req.user!.id,
    });

    return res.status(201).json({ success: true, project });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({
          success: false,
          message: "You already have a project with that key",
        });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("createProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
