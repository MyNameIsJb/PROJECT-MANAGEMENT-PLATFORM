import { Request, Response } from "express";
import { Project } from "../models/Project";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { closeBoard, kickFromBoard, emitToUsers } from "../socket";
import { broadcastTasks } from "./taskController";
import { Comment } from "../models/Comment";

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

    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

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
    const projects = await Project.find({ members: req.user!.id })
      .sort({
        createdAt: -1,
      })
      .populate("owner", "name email")
      .populate("members", "name email");

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

export const addMember = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project id" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const project = await Project.findOne({ _id: id, members: req.user!.id });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    if (!project.owner.equals(req.user!.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can add members",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with that emails" });
    }
    if (project.members.some((m) => m.equals(user._id))) {
      return res
        .status(409)
        .json({ success: false, message: "User is already a member" });
    }

    project.members.push(user._id);
    await project.save();
    const memberIds = project.members.map((m) => String(m));
    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

    emitToUsers(memberIds, "project_updated", {
      projectId: String(project._id),
    });
    return res.json({ success: true, project });
  } catch (error) {
    console.error("addMember error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProject = async (
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

    const project = await Project.findOne({ _id: id, members: req.user!.id });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    if (!project.owner.equals(req.user!.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can edit the project",
      });
    }

    const { name, description } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Name cannot be empty" });
      }
      project.name = name.trim();
    }
    if (description !== undefined) {
      project.description = String(description).trim() || undefined;
    }

    await project.save();
    const memberIds = project.members.map((m) => String(m));
    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

    emitToUsers(memberIds, "project_updated", {
      projectId: String(project._id),
    });

    return res.json({ success: true, project });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("updatedProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProject = async (
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

    const project = await Project.findOne({ _id: id, members: req.user!.id });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    if (!project.owner.equals(req.user!.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can delete the project",
      });
    }

    const memberIds = project.members.map((m) => String(m));
    await Task.deleteMany({ project: project._id });
    await Comment.deleteMany({ project: project._id });
    await project.deleteOne();

    emitToUsers(memberIds, "project_removed", {
      projectId: String(project._id),
    });
    closeBoard(String(project._id));

    return res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("deleteProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeMember = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id, userId } = req.params as { id: string; userId: string };

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const project = await Project.findOne({ _id: id, members: req.user!.id });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const isOwner = project.owner.equals(req.user!.id);
    const isSelf = userId === req.user!.id;

    if (!isOwner && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can remove other members",
      });
    }
    if (project.owner.equals(userId)) {
      return res.status(400).json({
        success: false,
        message:
          "The project owner can't be removed. Delete the project instead",
      });
    }
    if (!project.members.some((m) => m.equals(userId))) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this project",
      });
    }

    project.members = project.members.filter((m) => !m.equals(userId));
    await project.save();
    const affectedIds = [...project.members.map((m) => String(m)), userId];

    await Task.updateMany(
      { project: project._id, assignee: userId },
      { $set: { assignee: null } },
    );

    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

    emitToUsers(affectedIds, "member_removed", {
      projectId: String(project._id),
      userId,
    });
    await kickFromBoard(String(project._id), userId);
    broadcastTasks(project._id).catch(console.error);

    return res.json({ success: true, project });
  } catch (error) {
    console.error("removedMember error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
