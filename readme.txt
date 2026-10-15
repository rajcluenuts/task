# TaskFlow

TaskFlow is a task-management app with a React dashboard, a Kanban board, and a task workspace backed by an Express API and MongoDB.

## Features

- View workspace tasks on a Kanban board grouped by Pending, In Progress, and Completed.
- Browse and filter all workspace tasks.
- View tasks assigned to you under My Work.
- Create, update, and delete tasks.
- Assign tasks to yourself or leave them unassigned.
- Responsive layout for desktop and mobile screens.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A running MongoDB instance or MongoDB Atlas cluster

## Configuration

Create `backend/.env` and set the MongoDB connection string:

    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
    PORT=5000

Replace the placeholders with your own MongoDB details. Do not commit `.env` or share its contents. For MongoDB Atlas, make sure the cluster is running, the database user is valid, and your IP address is allowed in Network Access.

## Run locally on Windows

Open two PowerShell terminals from the project folder.

In the first terminal, start the backend:

    cd backend
    npm install
    npm run dev

The backend connects to MongoDB before listening on `http://localhost:5000`. If the connection fails, check the backend terminal and Atlas network/database credentials.

In the second terminal, start the frontend:

    cd frontend
    npm install
    npm run dev

Open the local URL printed by Vite, typically `http://localhost:5173`. The Vite development server proxies `/api` requests to the backend at `http://localhost:5000`.

## Frontend checks

Run these commands from `frontend`:

    npm run lint
    npm run build

## API

The backend exposes these task endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/tasks/count` | Return all tasks and their count |
| GET | `/api/tasks/:id` | Return one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

The root endpoint, `GET /`, is a backend health check.