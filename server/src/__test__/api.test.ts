import request from "supertest";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp("http://localhost:3000");

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

const register = async (name: string) => {
  const email = `${name.toLowerCase()}@test.com`;
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name, email, password: "secret123" });
  expect(res.body.token).toBeTruthy();
  return { email, token: res.body.token as string };
};

const createProject = async (token: string, key = "ALP") => {
  const res = await request(app)
    .post("/api/projects")
    .set(auth(token))
    .send({ name: "Alpha", key });
  expect(res.status).toBe(201);
  return res.body.project._id as string;
};

const invite = (token: string, projectId: string, email: string) =>
  request(app)
    .post(`/api/projects/${projectId}/members`)
    .set(auth(token))
    .send({ email });

const createTask = async (
  token: string,
  projectId: string,
  title: string,
  extra: Record<string, unknown> = {},
) => {
  const res = await request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set(auth(token))
    .send({ title, ...extra });
  expect(res.status).toBe(201);
  return res.body.task as { _id: string; key: string };
};

const move = (
  token: string,
  taskId: string,
  status: string,
  position: number,
) =>
  request(app)
    .patch(`/api/tasks/${taskId}/move`)
    .set(auth(token))
    .send({ status, position });

// ---------- auth ----------

describe("auth", () => {
  it("rejects an invalid email on register", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "nope", password: "secret123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Enter a valid email");
  });

  it("logs in with the right password and not the wrong one", async () => {
    const alice = await register("Alice");

    const good = await request(app)
      .post("/api/auth/login")
      .send({ email: alice.email, password: "secret123" });
    expect(good.body.token).toBeTruthy();

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: alice.email, password: "wrong-password" });
    expect([400, 401]).toContain(bad.status);
    expect(bad.body.token).toBeUndefined();
  });

  it("blocks NoSQL operator injection on login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: { $gt: "" }, password: "x" });

    expect(res.status).toBe(400);
  });

  it("requires a token for protected routes", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
  });
});

// ---------- projects ----------

describe("projects", () => {
  it("creates a project with the creator as its only member", async () => {
    const alice = await register("Alice");

    const res = await request(app)
      .post("/api/projects")
      .set(auth(alice.token))
      .send({ name: "Alpha", key: "alp" });

    expect(res.status).toBe(201);
    expect(res.body.project.key).toBe("ALP");
    expect(res.body.project.members).toHaveLength(1);
  });

  it("hides a project from people who are not members", async () => {
    const alice = await register("Alice");
    const bob = await register("Bob");
    const projectId = await createProject(alice.token);

    const list = await request(app).get("/api/projects").set(auth(bob.token));
    expect(list.body.projects).toHaveLength(0);

    const single = await request(app)
      .get(`/api/projects/${projectId}`)
      .set(auth(bob.token));
    expect(single.status).toBe(404);
  });

  it("lets the owner invite a member, who then sees the project", async () => {
    const alice = await register("Alice");
    const bob = await register("Bob");
    const projectId = await createProject(alice.token);

    const res = await invite(alice.token, projectId, bob.email);
    expect(res.status).toBe(200);

    const list = await request(app).get("/api/projects").set(auth(bob.token));
    expect(list.body.projects).toHaveLength(1);
  });

  it("only lets the owner edit the project", async () => {
    const alice = await register("Alice");
    const bob = await register("Bob");
    const projectId = await createProject(alice.token);
    await invite(alice.token, projectId, bob.email);

    const byMember = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set(auth(bob.token))
      .send({ name: "Hacked" });
    expect(byMember.status).toBe(403);

    const byOwner = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set(auth(alice.token))
      .send({ name: "Renamed" });
    expect(byOwner.status).toBe(200);
    expect(byOwner.body.project.name).toBe("Renamed");
  });

  it("does not allow the owner to be removed", async () => {
    const alice = await register("Alice");
    const projectId = await createProject(alice.token);

    const project = await request(app)
      .get(`/api/projects/${projectId}`)
      .set(auth(alice.token));
    const aliceId = project.body.project.owner._id;

    const res = await request(app)
      .delete(`/api/projects/${projectId}/members/${aliceId}`)
      .set(auth(alice.token));
    expect(res.status).toBe(400);
  });
});

// ---------- tasks ----------

describe("tasks", () => {
  it("numbers tasks with the project key", async () => {
    const alice = await register("Alice");
    const projectId = await createProject(alice.token, "ALP");

    const first = await createTask(alice.token, projectId, "One");
    const second = await createTask(alice.token, projectId, "Two");

    expect(first.key).toBe("ALP-1");
    expect(second.key).toBe("ALP-2");
  });

  it("rejects an assignee who is not a project member", async () => {
    const alice = await register("Alice");
    const projectId = await createProject(alice.token);

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(auth(alice.token))
      .send({
        title: "Task",
        assignee: new mongoose.Types.ObjectId().toString(),
      });

    expect(res.status).toBe(400);
  });

  it("moves a task to another column and closes the gap behind it", async () => {
    const alice = await register("Alice");
    const projectId = await createProject(alice.token);
    const a = await createTask(alice.token, projectId, "A");
    await createTask(alice.token, projectId, "B");
    await createTask(alice.token, projectId, "C");

    const res = await move(alice.token, a._id, "in_progress", 0);
    expect(res.status).toBe(200);

    const tasks = res.body.tasks as {
      title: string;
      status: string;
      position: number;
    }[];
    const byTitle = (title: string) => tasks.find((t) => t.title === title);

    expect(byTitle("A")).toMatchObject({ status: "in_progress", position: 0 });
    expect(byTitle("B")).toMatchObject({ status: "todo", position: 0 });
    expect(byTitle("C")).toMatchObject({ status: "todo", position: 1 });
  });

  it("reorders a task inside its own column", async () => {
    const alice = await register("Alice");
    const projectId = await createProject(alice.token);
    await createTask(alice.token, projectId, "A");
    await createTask(alice.token, projectId, "B");
    const c = await createTask(alice.token, projectId, "C");

    const res = await move(alice.token, c._id, "todo", 0);

    const tasks = res.body.tasks as { title: string; position: number }[];
    const order = [...tasks]
      .sort((x, y) => x.position - y.position)
      .map((t) => t.title);
    expect(order).toEqual(["C", "A", "B"]);
  });

  it("rejects an invalid status or a negative position", async () => {
    const alice = await register("Alice");
    const projectId = await createProject(alice.token);
    const task = await createTask(alice.token, projectId, "A");

    expect((await move(alice.token, task._id, "blocked", 0)).status).toBe(400);
    expect((await move(alice.token, task._id, "done", -1)).status).toBe(400);
  });

  it("only lets the owner or the creator delete a task", async () => {
    const alice = await register("Alice");
    const bob = await register("Bob");
    const projectId = await createProject(alice.token);
    await invite(alice.token, projectId, bob.email);

    const aliceTask = await createTask(alice.token, projectId, "Alice's task");
    const bobTask = await createTask(bob.token, projectId, "Bob's task");

    // bob is a member, but neither the owner nor the creator of Alice's task
    const denied = await request(app)
      .delete(`/api/tasks/${aliceTask._id}`)
      .set(auth(bob.token));
    expect(denied.status).toBe(403);

    // the owner can delete anything
    const byOwner = await request(app)
      .delete(`/api/tasks/${bobTask._id}`)
      .set(auth(alice.token));
    expect(byOwner.status).toBe(200);
  });

  it("keeps outsiders out of tasks and comments", async () => {
    const alice = await register("Alice");
    const carol = await register("Carol");
    const projectId = await createProject(alice.token);
    const task = await createTask(alice.token, projectId, "Private");

    const list = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(auth(carol.token));
    expect(list.status).toBe(404);

    const comment = await request(app)
      .post(`/api/tasks/${task._id}/comments`)
      .set(auth(carol.token))
      .send({ text: "hi" });
    expect(comment.status).toBe(404);
  });
});

// ---------- comments ----------

describe("comments", () => {
  it("lets a member comment, and rejects an empty comment", async () => {
    const alice = await register("Alice");
    const projectId = await createProject(alice.token);
    const task = await createTask(alice.token, projectId, "Task");

    const ok = await request(app)
      .post(`/api/tasks/${task._id}/comments`)
      .set(auth(alice.token))
      .send({ text: "Started on this" });
    expect(ok.status).toBe(201);
    expect(ok.body.comments).toHaveLength(1);

    const empty = await request(app)
      .post(`/api/tasks/${task._id}/comments`)
      .set(auth(alice.token))
      .send({ text: "   " });
    expect(empty.status).toBe(400);
  });
});
