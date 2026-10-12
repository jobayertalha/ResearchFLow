# ResearchFlow 📚

**A research-focused task manager for organizing multiple papers, tracking progress, and managing academic deadlines.**

🔗 **[Live Demo](https://research-f-low.vercel.app/)** · [GitHub Repository](https://github.com/jobayertalha/ResearchFLow)

ResearchFlow helps researchers manage multiple research papers in one place, organize paper-specific tasks, monitor progress, and stay aware of upcoming conferences and deadlines.

## 🚀 Features

- **👤 Simple Sign-In:** Access the application using a name-only sign-in flow.
- **📄 Multiple Research Papers:** Manage multiple research papers within one workspace.
- **✅ Paper-Specific Tasks:** Organize tasks separately for each research paper.
- **🔢 Sequential Task Ordering:** Arrange tasks in a structured sequence to support an organized workflow.
- **🏷️ Task Categories:** Categorize tasks for easier organization and tracking.
- **📊 Automatic Progress Tracking:** Track paper progress automatically based on its tasks.
- **📅 Conference & Deadline Management:** Add optional conference and deadline information to each paper.
- **⏳ Days-Left Calculation:** Automatically calculate the remaining time until a deadline.
- **🚦 Work-Pace Indicators:** Get a basic work-pace status based on deadlines:
  - **Need to Hurry**
  - **Work Normally**
  - **Work Thoroughly**
- **🌗 Dark & Light Mode:** Switch between themes for a comfortable working experience.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| Database | PostgreSQL |

## 🏗️ Architecture

ResearchFlow uses a separate frontend and backend:

- **Frontend:** React and Vite provide the user interface for managing papers, tasks, progress, and deadlines.
- **Backend:** FastAPI exposes the application API, with SQLAlchemy handling database interactions.
- **Database:** PostgreSQL stores research papers and their associated task data.

## ⚙️ Run Locally

### Prerequisites

- Python
- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/jobayertalha/ResearchFLow.git
cd ResearchFLow
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Linux / macOS:**
```bash
source .venv/bin/activate
```

**Windows PowerShell:**
```powershell
.venv\Scripts\Activate.ps1
```

Install the dependencies and configure the environment:

```bash
pip install -r requirements.txt
cp .env.example .env
```

On Windows, copy `.env.example` to `.env` using File Explorer or PowerShell if the `cp` command is unavailable.

Configure the required database settings in `.env` for your local PostgreSQL instance, then start the backend:

```bash
uvicorn src.main:app --reload
```

### 3. Set up the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

If the backend is not running at `http://localhost:8000`, set `VITE_API_URL` in `frontend/.env` to the appropriate backend URL.

## 🗄️ Database Compatibility

The current name-only user model is **not compatible with the previous username/password database schema**.

For this version, use a fresh development database rather than reusing a database created with the older schema.

## 🎯 Project Goal

ResearchFlow aims to make academic research workflows easier to manage by bringing paper organization, task sequencing, progress tracking, and deadline awareness into one focused application.

## 👨‍💻 Author

**Talha Jobayer Zihan**

- [GitHub](https://github.com/jobayertalha)
- [LinkedIn](https://www.linkedin.com/in/talha-jobayer-696a74237/)

---

<p align="center">
  <i>Organize your research. Track your progress. Stay ahead of deadlines.</i>
</p>
