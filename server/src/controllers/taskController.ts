import { Request, Response } from "express";
import mongoose from "mongoose";
import { Task, TASK_PRIORITIES, TASK_STATUSES } from "../models/Task";
import { Project } from "../models/Project";

export const createTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project id" });
    }
    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }
    if (status && !TASK_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    if (priority && !TASK_PRIORITIES.includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority" });
    }

    const found = await Project.findOne({ _id: id, members: req.user!.id });
    if (!found) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (assignee) {
      if (!mongoose.isValidObjectId(assignee)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid assignee id" });
      }
      if (!found.members.some((m) => m.equals(assignee))) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a project member",
        });
      }
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $inc: { issueCounter: 1 } },
      { new: true },
    );
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const column = status || "todo";
    const last = await Task.findOne({ project: project._id, status: column })
      .sort({ position: -1 })
      .select("position");

    const task = await Task.create({
      project: project._id,
      number: project.issueCounter,
      key: `${project.key}-${project.issueCounter}`,
      title,
      description,
      status: column,
      priority,
      assignee: assignee || null,
      reporter: req.user!.id,
      position: last ? last.position + 1 : 0,
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error("createTask error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<any> => {
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

    const tasks = await Task.find({ project: id })
      .sort({ position: 1 })
      .populate("assignee", "name email");

    return res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error("getTasks error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task id" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const project = await Project.findOne({
      _id: task.project,
      members: req.user!.id,
    });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if ("assignee" in req.body) {
      const { assignee } = req.body;

      if (!assignee) {
        task.assignee = null;
      } else {
        if (!mongoose.isValidObjectId(assignee)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid assignee id" });
        }
        if (!project.members.some((m) => m.equals(assignee))) {
          return res.status(400).json({
            success: false,
            message: "Assignee must be a project member",
          });
        }
        task.assignee = assignee;
      }
    }

    await task.save();
    await task.populate("assignee", "name email");

    return res.json({ success: true, task });
  } catch (error) {
    console.error("updateTask error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
