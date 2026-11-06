# Project Management Platform - Backend Server

A scalable, TypeScript-based RESTful API service built with Express.js and MongoDB (Mongoose) to support project workspace, board, task, and authentication operations.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database & ODM:** MongoDB with Mongoose
- **Configuration & Security:** CORS, dotenv

---

## 📁 Project Structure

```text
server/
├── src/
│   ├── config/              # Database connection and environment configurations
│   ├── controllers/         # Request handling and core business logic
│   │   ├── authController.ts
│   │   ├── boardController.ts
│   │   ├── taskController.ts
│   │   └── workspaceController.ts
│   ├── middleware/          # Custom auth verification and error middleware
│   ├── models/              # Mongoose data schemas
│   │   ├── Board.ts
│   │   ├── Task.ts
│   │   ├── User.ts
│   │   └── Workspace.ts
│   ├── routes/              # Express API endpoints mapping
│   │   ├── authRoutes.ts
│   │   ├── boardRoutes.ts
│   │   ├── taskRoutes.ts
│   │   └── workspaceRoutes.ts
│   ├── types/               # Custom TypeScript interface definitions
│   └── index.ts             # Application entry point and server setup
├── .env                     # Environment settings (git ignored)
├── nodemon.json             # Live-reload configuration
├── package.json             # Node dependencies and project scripts
└── tsconfig.json            # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster)

### 1. Installation

Navigate into the server directory and install dependencies:

```bash
cd server
npm install
```

### 2. Environment Setup

Create a `.env` file in the root of the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

### 3. Running the Server

- **Development Mode** (with hot-reloading via `ts-node`/`nodemon`):

  ```bash
  npm run dev
  ```

- **Build for Production**:

  ```bash
  npm run build
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

---

## 📡 API Routes Summary

| Resource       | Base Endpoint     | Description                                                  |
| :------------- | :---------------- | :----------------------------------------------------------- |
| **Auth**       | `/api/auth`       | User registration, authentication, and session handling      |
| **Workspaces** | `/api/workspaces` | Workspace creation, management, and member assignment        |
| **Boards**     | `/api/boards`     | Project board management within workspaces                   |
| **Tasks**      | `/api/tasks`      | Task CRUD operations, column positioning, and status updates |

---

## 📝 Error Handling & Response Format

All API errors return a standard JSON structure:

```json
{
  "success": false,
  "message": "Error description here"
}
```
