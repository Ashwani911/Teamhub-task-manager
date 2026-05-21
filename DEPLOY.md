# ETHARA — Full-Stack Deployment Guide

## Project Structure

```
ethara/
├── src/                 # React frontend (Vite + TypeScript)
├── server/              # Express.js backend
│   ├── index.js         # Entry point
│   ├── models.js        # Mongoose schemas
│   ├── middleware.js     # JWT auth middleware
│   ├── routes/          # REST API routes
│   ├── package.json
│   └── .env.example
├── dist/                # Built frontend (after npm run build)
├── package.json         # Frontend dependencies
└── DEPLOY.md            # This file
```

---

## 1. Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas free cluster)

### Step 1: Clone & Install Frontend
```bash
npm install
```

### Step 2: Install Backend
```bash
cd server
npm install
cd ..
```

### Step 3: Configure Backend Environment
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/ethara
JWT_SECRET=pick-a-long-random-secret-here
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start Backend
```bash
cd server
npm run dev
```
Backend runs on http://localhost:5000

### Step 5: Start Frontend (separate terminal)
Create a `.env` file in the project root:
```
VITE_API_URL=/api
```
Then:
```bash
npm run dev
```
Frontend runs on http://localhost:5173

> **Note:** For local dev, configure Vite proxy in `vite.config.ts`:
> ```ts
> server: { proxy: { '/api': 'http://localhost:5000' } }
> ```

### Default Login
- **Email:** ashwani@gmail.com
- **Password:** 123456789

---

## 2. Deploy on Railway

Railway lets you deploy the entire app as a single service.

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "ETHARA full-stack app"
git remote add origin https://github.com/YOU/ethara.git
git push -u origin main
```

### Step 2: Create MongoDB Atlas Database
1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Whitelist all IPs: `0.0.0.0/0`
5. Copy the connection string

### Step 3: Create Railway Project
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub Repo"
3. Select your repo

### Step 4: Set Environment Variables in Railway
In your Railway service settings → Variables:
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ethara
JWT_SECRET=your-random-secret-here
FRONTEND_URL=https://your-app.up.railway.app
```

### Step 5: Configure Build & Start Commands
In Railway service settings:
- **Build Command:**
  ```
  npm install && cd server && npm install && cd .. && VITE_API_URL=/api npm run build
  ```
- **Start Command:**
  ```
  node server/index.js
  ```

### Step 6: Deploy!
Railway will:
1. Install all dependencies
2. Build the React frontend with `VITE_API_URL=/api`
3. Start the Express server
4. The server serves the built frontend + API

Your app will be live at `https://your-app.up.railway.app`

---

## 3. How It Works

### Frontend Mode Selection
The frontend auto-detects which API to use:
- If `VITE_API_URL` is set → uses real HTTP calls to Express backend
- If not set → uses localStorage mock (preview/demo mode)

### API Endpoints

| Method | Endpoint                       | Auth   | Description              |
|--------|--------------------------------|--------|--------------------------|
| POST   | /api/auth/signup               | No     | Create account           |
| POST   | /api/auth/login                | No     | Sign in                  |
| GET    | /api/auth/me                   | Yes    | Get current user         |
| GET    | /api/users                     | Yes    | List all users           |
| POST   | /api/users                     | Admin  | Create user              |
| PATCH  | /api/users/:id                 | Yes*   | Edit profile             |
| PATCH  | /api/users/:id/role            | Admin  | Change role              |
| DELETE | /api/users/:id                 | Admin  | Remove user              |
| GET    | /api/projects                  | Yes    | List projects            |
| POST   | /api/projects                  | Admin  | Create project           |
| DELETE | /api/projects/:id              | Admin  | Delete project           |
| PATCH  | /api/projects/:id/members      | Admin  | Add/remove member        |
| GET    | /api/tasks?projectId=x         | Yes    | List tasks               |
| POST   | /api/tasks                     | Yes    | Create task              |
| PATCH  | /api/tasks/:id                 | Yes    | Update task              |
| DELETE | /api/tasks/:id                 | Admin  | Delete task              |
| GET    | /api/comments?taskId=x         | Yes    | List comments            |
| POST   | /api/comments                  | Yes    | Add comment              |

*Self-edit always allowed; editing others requires admin.

### Database Models
- **User** — name, email, password (hashed), role
- **Project** — name, description, owner, members[]
- **Task** — project, title, status, priority, assignee, dueDate, checklist[]
- **Comment** — task, user, userName, text
