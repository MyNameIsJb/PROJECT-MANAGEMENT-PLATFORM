import { Request, Response } from "express";
import mongoose from "mongoose";
import { Task, TASK_PRIORITIES, TASK_STATUSES } from "../models/Task";
import { Project } from "../models/Project";
import { emitToBoard } from "../socket";
import { Comment } from "../models/Comment";

export const broadcastTasks = async (
  projectId: mongoose.Types.ObjectId | string,
) => {
  const tasks = await Task.find({ project: projectId })
    .sort({ position: 1 })
    .populate("assignee", "name email");

  emitToBoard(String(projectId), "tasks_updated", {
    projectId: String(projectId),
    tasks,
  });
};

const parseDueDate = (value: unknown): Date | null | undefined => {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
};

export const createTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee, dueDate } =
      req.body;

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

    const due = dueDate === undefined ? null : parseDueDate(dueDate);

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
      dueDate: due,
      reporter: req.user!.id,
      position: last ? last.position + 1 : 0,
    });

    broadcastTasks(project._id).catch(console.error);

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

    const { title, description, priority, assignee } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Title cannot be empty" });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = String(description).trim() || undefined;
    }

    if (priority !== undefined) {
      if (!TASK_PRIORITIES.includes(priority)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid priority" });
      }
      task.priority = priority;
    }

    if ("assignee" in req.body) {
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

    if ("dueDate" in req.body) {
      const due = parseDueDate(req.body.dueDate);
      if (due === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid due date" });
      }
      task.dueDate = due;
    }

    await task.save();
    await task.populate("assignee", "name email");

    broadcastTasks(task.project).catch(console.error);

    return res.json({ success: true, task });
  } catch (error) {
    console.error("updateTask error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const moveTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task id" });
    }
    if (!TASK_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    if (!Number.isInteger(position) || position < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Position must be a whole number" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const fromStatus = task.status;

    const destination = await Task.find({
      project: task.project,
      status,
      _id: { $ne: task._id },
    })
      .sort({ position: 1 })
      .select("_id");

    const orderedIds = destination.map((t) => t._id);
    orderedIds.splice(Math.min(position, orderedIds.length), 0, task._id);

    const ops: any[] = orderedIds.map((taskId, index) => ({
      updateOne: {
        filter: { _id: taskId },
        update: { $set: { status, position: index } },
      },
    }));

    if (fromStatus !== status) {
      const source = await Task.find({
        project: task.project,
        status: fromStatus,
        _id: { $ne: task._id },
      })
        .sort({ position: 1 })
        .select("_id");

      source.forEach((t, index) => {
        ops.push({
          updateOne: {
            filter: { _id: t.id },
            update: { $set: { position: index } },
          },
        });
      });
    }

    await Task.bulkWrite(ops);

    const tasks = await Task.find({ project: task.project })
      .sort({ position: 1 })
      .populate("assignee", "name email");

    emitToBoard(String(task.project), "tasks_updated", {
      projectId: String(task.project),
      tasks,
    });

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error("moveTask error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<any> => {
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
        .status(400)
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

    const isOwner = project.owner.equals(req.user!.id);
    const isReporter = task.reporter.equals(req.user!.id);
    if (!isOwner && !isReporter) {
      return res.status(403).json({
        success: false,
        message:
          "Only the project owner or the task creator can delete this task",
      });
    }

    await task.deleteOne();
    await Comment.deleteMany({ task: task._id });

    const remaining = await Task.find({
      project: task.project,
      status: task.status,
    })
      .sort({ position: 1 })
      .select("_id");

    if (remaining.length > 0) {
      await Task.bulkWrite(
        remaining.map((t, index) => ({
          updateOne: {
            filter: { _id: t._id },
            update: { $set: { position: index } },
          },
        })),
      );
    }

    const tasks = await Task.find({ project: task.project })
      .sort({ position: 1 })
      .populate("assignee", "name email");

    emitToBoard(String(task.project), "task_updated", {
      projectId: String(task.project),
      tasks,
    });

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error("deleteTask error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
