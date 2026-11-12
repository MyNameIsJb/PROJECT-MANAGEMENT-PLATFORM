import { Request, Response } from "express";
import { Project } from "../models/Project";
import mongoose from "mongoose";

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
      members: [req.user!.id],
    });

    return res.status(201).json({ success: true, project });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
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

export const getProjects = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const projects = await Project.find({ members: req.user!.id }).sort({
      createdAt: -1,
    });

    return res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    console.error("getProjects error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findOne({ _id: id, members: req.user!.id })
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    return res.json({ success: true, project });
  } catch (error) {
    console.error("getProjectById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
