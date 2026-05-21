# 🚀 TeamHub — Full Stack Team Task Management Platform

TeamHub is a modern full-stack task management and collaboration platform designed to help teams efficiently manage projects, organize tasks, monitor progress, and collaborate through a clean and interactive dashboard interface.

The application is inspired by modern SaaS productivity platforms such as Jira, Trello, Linear, and Notion, with a focus on responsive UI design, premium dashboard experience, and smooth user interaction.

This project was built as a full-stack MERN-style application using React, TypeScript, Tailwind CSS, Node.js, Express.js, and MongoDB concepts.

---

# 🌟 Project Overview

Managing projects and coordinating team tasks becomes difficult when communication and task tracking are scattered across multiple platforms. TeamHub solves this problem by providing a centralized workspace where users can:

* Create and manage projects
* Track task progress
* Monitor overdue tasks
* Manage team members
* View analytics and completion statistics
* Organize work efficiently using a modern dashboard

The application focuses heavily on user experience and professional dashboard design while maintaining clean architecture and reusable components.

---

# 🖥️ Application Screenshots

## 🔐 Authentication Page

The login interface provides a modern and responsive authentication screen with a premium dark-themed UI.

Features:

* Email and password authentication UI
* Demo account support
* Responsive design
* Smooth hover effects and animations

<img width="1907" height="871" alt="Screenshot 2026-05-21 231020" src="https://github.com/user-attachments/assets/67bbc3e7-9af3-41cb-8533-18eeea83c652" />



---

## 📊 Dashboard Overview

The dashboard acts as the central workspace where users can quickly monitor project activity, task completion rate, priority distribution, and project progress.

Features:

* Workspace analytics
* Task completion statistics
* Project progress tracking
* Priority breakdown visualization
* Welcome section with user overview
* Modern responsive dashboard cards

<img width="1897" height="861" alt="Screenshot 2026-05-21 231043" src="https://github.com/user-attachments/assets/70378f9f-935f-44cb-81c7-34f0729ac37d" />


---

## ✅ Task Management Module

The tasks section allows users to organize and monitor all assigned tasks across projects.

Features:

* Pending tasks
* Completed tasks
* Overdue tasks
* Task status indicators
* Due date tracking
* Project association
* Responsive table layout

<img width="1918" height="863" alt="Screenshot 2026-05-21 231106" src="https://github.com/user-attachments/assets/03fdc7c8-bf84-472d-a999-954cacfae9e9" />


---

## 👥 Team Management Module

The team management interface allows administrators to manage team members and their roles.

Features:

* Add new team members
* Edit member information
* Change roles
* Role-based access visualization
* Admin and member badges
* User profile cards

<img width="1891" height="863" alt="Screenshot 2026-05-21 231124" src="https://github.com/user-attachments/assets/5b51321e-434a-4e31-9daa-8d6f22a37078" />

---

## 📁 Projects Module

The projects page displays all active projects with progress and collaboration information.

Features:

* Create new projects
* Project cards
* Team collaboration view
* Deadline tracking
* Responsive project layout
* Clean modern UI


<img width="1911" height="862" alt="Screenshot 2026-05-21 231142" src="https://github.com/user-attachments/assets/ca7f7731-d3f0-4f4b-b69e-d0de713c6873" />

---

# ✨ Key Features

## 🔐 Authentication System

* Secure login interface
* User session handling
* Demo login functionality
* Context-based authentication management

---

## 📊 Dashboard Analytics

* Real-time project overview
* Task completion percentage
* Pending and overdue task monitoring
* Priority distribution analysis

---

## 📁 Project Management

* Create and manage multiple projects
* Organize tasks within projects
* Monitor project deadlines
* Track active project progress

---

## ✅ Task Management

* Create and organize tasks
* Task status management
* Priority tagging
* Due date monitoring
* Overdue task detection

---

## 👥 Team Collaboration

* Add and manage members
* Role-based access control
* Team activity monitoring
* Admin and member role management

---

## 🎨 Modern UI/UX

* Premium dark theme
* Responsive dashboard layout
* Fixed sidebar navigation
* Smooth transitions and hover animations
* Mobile-friendly design
* SaaS-inspired user interface

---

# 🛠️ Technologies Used

## Frontend Technologies

### React.js

Used for building reusable user interface components and creating a dynamic single-page application.

### TypeScript

Provides type safety, improved maintainability, and better development experience.

### Tailwind CSS

Used for modern responsive styling and utility-first design development.

### Vite

Provides fast frontend development and optimized build performance.

### Lucide React

Used for modern and customizable dashboard icons.

---

## Backend Technologies

### Node.js

Handles backend runtime environment and server-side operations.

### Express.js

Used for API routing, middleware handling, and backend architecture.

---

## Database

### MongoDB

Used for storing:

* User information
* Tasks
* Projects
* Team data

---

# 🧱 Project Architecture

The project follows a modular component-based architecture for scalability and maintainability.

```bash id="k8xz21"
Teamhub-task-manager/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
│
├── src/
│   ├── components/
│   ├── context/
│   ├── services/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── App.tsx
│
├── public/
├── package.json
├── tailwind.config.js
└── README.md
```

---

# ⚙️ Installation Guide

## Step 1 — Clone Repository

```bash id="zq4m7x"
git clone https://github.com/Ashwani911/Teamhub-task-manager.git
```

---

## Step 2 — Navigate to Project Folder

```bash id="m3xn1p"
cd Teamhub-task-manager
```

---

## Step 3 — Install Frontend Dependencies

```bash id="x7qpl2"
npm install
```

---

## Step 4 — Start Frontend Development Server

```bash id="d0ka2r"
npm run dev
```

Frontend runs on:

```bash id="w9qk1l"
http://localhost:5173
```

---

# 🔧 Backend Setup

## Navigate to Backend Folder

```bash id="u3qp5x"
cd server
```

---

## Install Backend Dependencies

```bash id="f2z8pa"
npm install
```

---

## Create Environment Variables

Create a `.env` file inside the server folder:

```env id="j1px7n"
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

---

## Start Backend Server

```bash id="e5la9q"
npm run dev
```

Backend runs on:

```bash id="q8cn2r"
http://localhost:5000
```

---

# 📱 Responsive Design

The application is fully responsive and optimized for:

* Desktop devices
* Tablets
* Mobile screens

The layout automatically adjusts based on screen size while maintaining usability and visual consistency.

---

# 🎯 UI Design Highlights

Some major UI improvements implemented in this project include:

* Fixed sidebar navigation
* Glassmorphism-inspired cards
* Smooth hover animations
* Interactive dashboard statistics
* Premium dark dashboard theme
* Improved spacing and layout structure
* Responsive project cards
* Clean typography and hierarchy

---

# 📚 Learning Outcomes

This project helped improve my understanding of:

* Full-stack application architecture
* React component design
* TypeScript integration
* Responsive dashboard development
* Context API state management
* Backend API structure
* Modern UI/UX principles
* Tailwind CSS utility styling
* Reusable component development

---

# 🚀 Future Improvements

Planned future enhancements include:

* Real JWT authentication
* MongoDB integration
* Drag-and-drop Kanban board
* Real-time notifications
* Activity logs
* File upload support
* Team chat system
* Calendar scheduling
* Deployment support
* Email notifications

---

# 👨‍💻 Developer Information

## Ashwani Kumar

Final Year Computer Science Engineering Student
MERN Stack Developer | Frontend Enthusiast

GitHub Profile:
https://github.com/Ashwani911

---

# ⭐ Support

If you like this project, please consider giving it a ⭐ on GitHub.
It helps support the project and motivates future improvements.

---

# 📄 License

This project was developed for educational, portfolio, and learning purposes.
