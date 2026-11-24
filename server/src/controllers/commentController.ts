import mongoose from "mongoose";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { Comment } from "../models/Comment";
import { Request, Response } from "express";
import { emitToBoard } from "../socket";

const findTaskForMember = async (taskId: string, userId: string) => {
  if (!mongoose.isValidObjectId(taskId)) return null;

  const task = await Task.findById(taskId);
  if (!task) return null;

  const project = await Project.findOne({ _id: task.project, members: userId });
  if (!project) return null;

  return { task, project };
};

const listComments = (taskId: string) =>
  Comment.find({ task: taskId })
    .sort({ createdAt: 1 })
    .populate("author", "name email");

export const getComments = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params as { id: string };

    const found = await findTaskForMember(id, req.user!.id);
    if (!found) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const comments = await listComments(id);
    return res.json({ success: true, comments });
  } catch (error) {
    console.error("getComments error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createComment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params as { id: string };
    const text = String(req.body.text ?? "").trim();

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Comment cannot be empty" });
    }
    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment is too long (max 1000 characters)",
      });
    }

    const found = await findTaskForMember(id, req.user!.id);
    if (!found) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    await Comment.create({
      task: found.task._id,
      project: found.project._id,
      author: req.user!.id,
      text,
    });

    const comments = await listComments(id);

    emitToBoard(String(found.project._id), "comments_updated", {
      projectId: String(found.project._id),
      taskId: id,
      comments,
    });

    return res.status(201).json({ success: true, comments });
  } catch (error) {
    console.error("createComment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id, commentId } = req.params as { id: string; commentId: string };

    if (!mongoose.isValidObjectId(commentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment id" });
    }

    const found = await findTaskForMember(id, req.user!.id);
    if (!found) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const comment = await Comment.findOne({ _id: commentId, task: id });
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const isAuthor = comment.author.equals(req.user!.id);
    const isOwner = found.project.owner.equals(req.user!.id);
    if (!isAuthor && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only the author or the project owner can delete this comment",
      });
    }

    await comment.deleteOne();

    const comments = await listComments(id);

    emitToBoard(String(found.project._id), "comments_updated", {
      projectId: String(found.project._id),
      taskId: id,
      comments,
    });

    return res.json({ success: true, comments });
  } catch (error) {
    console.error("deleteComment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
