# HKUST Dorm Advisor

<div align="center">

**🏠 AI-Powered HKUST Dormitory Recommendation System**

*Built with Alibaba Cloud Bailian + Next.js + FastAPI + Supabase*

[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

</div>

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Developer Onboarding Guide](#-developer-onboarding-guide)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Application](#running-the-application)
  - [Verification](#verification)
- [Development Mode](#-development-mode)
- [Documentation](#-documentation)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Project Overview

HKUST Dorm Advisor is an intelligent dormitory recommendation system that leverages AI technology to provide personalized accommodation suggestions for HKUST students. The project adopts a modern frontend-backend separation architecture, supporting cross-platform development.

**Key Features:**
- 🤖 AI-powered chat interface for dormitory queries
- 📊 Personalized recommendations based on user preferences
- 🔐 Secure authentication with Supabase
- 📱 Responsive design for all devices
- 🚀 Fast and scalable architecture

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5.8
- **UI Library**: React 18.2
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **HTTP Client**: Axios 1.6
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI 0.109
- **Language**: Python 3.9+
- **Server**: Uvicorn with auto-reload
- **AI Service**: Alibaba Cloud Bailian (Model Studio)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with python-jose
- **Async HTTP**: httpx
- **Deployment**: Render / Railway

---

## 📁 Project Structure

```
hkust-dorm-advisor_202602/
├── 📁 backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── chat.py             # Chat endpoints
│   │   │   ├── recommend.py        # Recommendation endpoints
│   │   │   └── profile.py          # User profile endpoints
│   │   ├── services/               # Business Logic
│   │   │   ├── bailian_service.py  # Bailian AI Service
│   │   │   ├── recommendation_service.py
│   │   │   └── rag_service.py      # RAG retrieval (planned)
│   │   ├── models/                 # Data Models
│   │   │   └── schemas.py          # Pydantic schemas
│   │   ├── database/               # Database Layer
│   │   │   └── supabase_client.py  # Supabase client
│   │   ├── middleware/             # Middleware
│   │   │   └── auth.py             # JWT authentication
│   │   ├── utils/                  # Utilities
│   │   │   └── constants.py        # System constants
│   │   ├── data/                   # Static Data
│   │   │   └── hall_facilities.json
│   │   └── main.py                 # Application entry
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment template
│   └── README.md
│
├── 📁 frontend/                    # Next.js Frontend
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # Landing page
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles
│   │   ├── login/page.tsx          # Login page
│   │   ├── setup/page.tsx          # User preference setup
│   │   └── chat/page.tsx           # Main chat interface
│   ├── components/                 # React Components
│   │   ├── ChatPanel.tsx           # Chat message panel
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── RecommendationPanel.tsx # AI analysis panel
│   │   ├── SetupForm.tsx           # User preference form
│   │   ├── FacilitiesModal.tsx     # Facility details modal
│   │   └── LandingPage.tsx         # Welcome page
│   ├── lib/                        # Utility Libraries
│   │   ├── supabase.ts             # Supabase client
│   │   ├── api.ts                  # API wrapper
│   │   └── constants.ts            # Frontend constants
│   ├── types/                      # TypeScript Types
│   │   └── index.ts
│   ├── package.json                # Dependencies
│   ├── next.config.js              # Next.js config
│   ├── tailwind.config.js          # Tailwind config
│   ├── tsconfig.json               # TypeScript config
│   ├── .env.local.example          # Environment template
│   └── README.md
│
├── 📁 docs/                        # Documentation
│   ├── API.md                      # API documentation
│   ├── DATABASE.md                 # Database schema
│   ├── DEPLOYMENT.md               # Deployment guide
│   └── QUICKSTART.md               # Quick reference
│
├── README.md                       # This file
├── TODO.md                         # Development roadmap
├── LOCAL_SETUP.md                  # Detailed setup guide
├── TESTING.md                      # Testing guide
└── .gitignore                      # Git ignore rules
```

---

## 🚀 Developer Onboarding Guide

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Required Version | Check Command | Download Link |
|------|-----------------|---------------|---------------|
| **Node.js** | 18.0.0+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0.0+ | `npm --version` | Comes with Node.js |
| **Python** | 3.9.0+ | `python --version` | [python.org](https://www.python.org/) |
| **pip** | Latest | `pip --version` | Comes with Python |
| **Git** | Latest | `git --version` | [git-scm.com](https://git-scm.com/) |

**Required Accounts & Keys:**
- ✅ **Alibaba Cloud Bailian** API Key & App ID (Required for AI features)
- ⚠️ **Supabase** account (Optional - only for production authentication)

---

### Initial Setup

#### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/Timthn/HKUST_DormAdvisor_v20260202.git

# Or via SSH (if configured)
git clone git@github-timthn:Timthn/HKUST_DormAdvisor_v20260202.git

# Navigate to project directory
cd HKUST_DormAdvisor_v20260202
```

#### 2. Verify Project Structure

```bash
# List all directories
ls -la

# You should see: backend/, frontend/, docs/, README.md, etc.
```

---

### Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Create Python Virtual Environment

**On Windows (PowerShell):**
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**On Mac/Linux (Bash/Zsh):**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

**Verify Activation:**
Your terminal prompt should show `(venv)` at the beginning.

#### Step 3: Install Python Dependencies

```bash
# Upgrade pip first
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

**Expected packages:**
- fastapi==0.109.0
- uvicorn==0.27.0
- python-dotenv==1.0.0
- pydantic==2.5.3
- supabase==2.3.4
- httpx (0.24-0.26)
- python-jose==3.3.0
- passlib==1.7.4

#### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Windows (PowerShell):
# copy .env.example .env
```

**Edit `backend/.env` with your actual values:**

```env
# ========================================
# Alibaba Cloud Bailian Configuration
# ========================================
# Get your API key from: https://bailian.console.aliyun.com/
BAILIAN_API_KEY=sk-your-actual-api-key-here
BAILIAN_APP_ID=your-actual-app-id-here

# ========================================
# Development Mode
# ========================================
# true = Skip authentication (for local testing)
# false = Require full authentication (production)
DEV_MODE=true

# ========================================
# Supabase Configuration (Optional in dev mode)
# ========================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# ========================================
# JWT Configuration (Optional in dev mode)
# ========================================
JWT_SECRET=your-random-secret-key-min-32-chars
JWT_ALGORITHM=HS256

# ========================================
# CORS & Server Configuration
# ========================================
FRONTEND_URL=http://localhost:3000
HOST=0.0.0.0
PORT=8000
```

**⚠️ Important Notes:**
- `BAILIAN_API_KEY` and `BAILIAN_APP_ID` are **REQUIRED**
- When `DEV_MODE=true`, Supabase and JWT configurations are optional
- Never commit your `.env` file to Git (already in `.gitignore`)

#### Step 5: Test Backend

```bash
# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['C:\\...\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify Backend is Running:**
- API Docs: http://localhost:8000/api/docs (Swagger UI)
- Alternative Docs: http://localhost:8000/api/redoc (ReDoc)
- Health Check: http://localhost:8000/ (should return a JSON response)

**Keep this terminal open** - the backend must run continuously.

---

### Frontend Setup

#### Step 1: Open a New Terminal

**Important:** Keep the backend terminal running. Open a **NEW** terminal window/tab.

#### Step 2: Navigate to Frontend Directory

```bash
cd frontend

# Or from project root:
# cd ../frontend
```

#### Step 3: Install Node.js Dependencies

```bash
# Install all dependencies
npm install

# Or use yarn if you prefer:
# yarn install
```

**This will install:**
- Next.js 14.1
- React 18.2
- TypeScript 5.8
- Tailwind CSS 3.4
- Supabase client libraries
- Axios, Lucide React, etc.

**Installation time:** ~2-5 minutes (depending on your internet speed)

#### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.local.example .env.local

# Windows (PowerShell):
# copy .env.local.example .env.local
```

**Edit `frontend/.env.local`:**

```env
# ========================================
# Development Mode
# ========================================
# true = Skip authentication, access chat directly
# false = Require login via Supabase
NEXT_PUBLIC_DEV_MODE=true

# ========================================
# Supabase Configuration (Optional in dev mode)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ========================================
# Backend API URL
# ========================================
NEXT_PUBLIC_API_URL=http://localhost:8000

# ========================================
# Optional: Analytics, etc.
# ========================================
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

**⚠️ Important Notes:**
- `NEXT_PUBLIC_API_URL` must match your backend URL
- `NEXT_PUBLIC_DEV_MODE=true` allows testing without login
- All `NEXT_PUBLIC_*` variables are exposed to the browser

#### Step 5: Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
> hkust-dorm-advisor-frontend@2.0.0 dev
> next dev

   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 3.2s
```

**Verify Frontend is Running:**
- Homepage: http://localhost:3000
- Chat Interface: http://localhost:3000/chat (dev mode allows direct access)
- Setup Page: http://localhost:3000/setup

---

### Running the Application

#### Summary: Starting Both Services

You need **TWO TERMINAL WINDOWS** running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate     # Mac/Linux
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Quick Test

1. **Open your browser:** http://localhost:3000
2. **Navigate to Chat:** http://localhost:3000/chat
3. **Type a test message:**
   - "介绍一下 Hall I"
   - "Which dorm has air conditioning?"
   - "I want a quiet dorm with a sea view"

4. **Expected Response:**
   - The AI should respond with dormitory information
   - Response time: 2-5 seconds

---

### Verification

#### Backend Health Check

```bash
# Test health endpoint
curl http://localhost:8000/

# Expected response:
# {"message": "HKUST Dorm Advisor Backend API"}
```

#### Frontend Build Test

```bash
cd frontend
npm run build

# Should complete without errors
# Creates .next/ directory with production build
```

#### API Documentation Check

Visit http://localhost:8000/api/docs to ensure all endpoints are loaded:

**Expected Endpoints:**
- `POST /api/chat/send` - Send chat message
- `POST /api/recommend/generate` - Generate recommendations
- `GET /api/profile/{user_id}` - Get user profile
- `PUT /api/profile/{user_id}` - Update user profile

---

## 💡 Development Mode

### What is Development Mode?

Development mode (`DEV_MODE=true`) **bypasses authentication** to let you focus on testing core features without setting up Supabase.

**Features in Dev Mode:**
- ✅ No login required
- ✅ Direct access to `/chat` interface
- ✅ Uses test user ID (`test-user-123`)
- ✅ AI chat works immediately
- ✅ Simplified onboarding

**Limitations:**
- ❌ No user persistence (refresh loses data)
- ❌ No multi-user support
- ❌ No chat history saved to database

### Switching to Production Mode

When ready for production:

1. **Set up Supabase** (see [LOCAL_SETUP.md](LOCAL_SETUP.md))
2. **Update environment variables:**
   ```env
   # backend/.env
   DEV_MODE=false
   
   # frontend/.env.local
   NEXT_PUBLIC_DEV_MODE=false
   ```
3. **Restart both servers**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [LOCAL_SETUP.md](LOCAL_SETUP.md) | Detailed local development guide |
| [TESTING.md](TESTING.md) | Testing procedures and test cases |
| [TODO.md](TODO.md) | Development roadmap and task list |
| [docs/API.md](docs/API.md) | Complete API reference |
| [docs/DATABASE.md](docs/DATABASE.md) | Database schema and setup |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Quick reference for common tasks |

---

## 🏗 System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌────────────────┐
│                 │  HTTPS  │                 │  HTTP   │                │
│   Next.js 14    │────────▶│   FastAPI       │────────▶│  Alibaba Cloud │
│   Frontend      │         │   Backend       │         │  Bailian AI    │
│   (Port 3000)   │◀────────│   (Port 8000)   │◀────────│                │
└─────────────────┘         └─────────────────┘         └────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌────────────────────────────────────────────┐
│              Supabase                      │
│  ┌──────────────┐    ┌──────────────┐     │
│  │  Auth        │    │  PostgreSQL  │     │
│  │  (JWT)       │    │  Database    │     │
│  └──────────────┘    └──────────────┘     │
│                                            │
│  Tables: profiles, chat_logs              │
└────────────────────────────────────────────┘
```

### Request Flow

1. **User Login**: Frontend → Supabase Auth → JWT Token → Frontend
2. **Chat Message**: Frontend → Backend API → Bailian AI → Backend → Frontend
3. **Save Preferences**: Frontend → Backend API → Supabase Database
4. **Generate Recommendations**: Backend reads profile → Constructs prompt → Bailian AI → Frontend

---

## ✨ Features

### ✅ Implemented

- [x] User authentication (Supabase Auth)
- [x] User preference setup (identity, budget, room types)
- [x] AI-powered chat interface
- [x] Dormitory recommendations
- [x] Facility details viewing
- [x] Responsive design (mobile/desktop)
- [x] Development mode for easy testing

### 🚧 Planned (from TODO.md)

- [ ] RAG (Retrieval-Augmented Generation) knowledge base
- [ ] Multi-session chat history
- [ ] Persistent recommendation storage
- [ ] Advanced user profiling
- [ ] Cloud-synced chat logs
- [ ] Multi-language support (EN/中文)

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'app'`**
```bash
# Solution: Make sure you're in the backend directory and venv is activated
cd backend
.\venv\Scripts\Activate.ps1  # Windows
python -m pip install -r requirements.txt
```

**Problem: `Port 8000 already in use`**
```bash
# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Mac/Linux: Find and kill process
lsof -ti:8000 | xargs kill -9
```

**Problem: `BAILIAN_API_KEY not set`**
```bash
# Verify your .env file exists and contains the key
cat backend/.env | grep BAILIAN_API_KEY

# Make sure there are no extra spaces or quotes
```

#### Frontend Issues

**Problem: `Module not found: Can't resolve '@/...'`**
```bash
# Solution: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem: `Cannot connect to backend`**
```bash
# Verify backend is running:
curl http://localhost:8000/

# Check NEXT_PUBLIC_API_URL in .env.local
# Should be: http://localhost:8000 (no trailing slash)
```

**Problem: `Build fails with TypeScript errors`**
```bash
# Run type checking
npm run build

# Fix errors shown, or temporarily skip:
# (Not recommended for production)
```

#### Environment Variable Issues

**Problem: Changes to `.env` not taking effect**
```bash
# Solution: Restart the server after changing .env
# Press Ctrl+C to stop
# Then restart: uvicorn app.main:app --reload
```

**Problem: `.env` file not found**
```bash
# Make sure you copied from example
cp .env.example .env  # Mac/Linux
copy .env.example .env  # Windows
```

### Getting Help

1. **Check documentation**: See [docs/](docs/) folder
2. **Review logs**: Check terminal output for error messages
3. **Search issues**: GitHub Issues tab
4. **Ask team**: Contact project maintainers

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Contribution Workflow

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HKUST_DormAdvisor_v20260202.git
   cd HKUST_DormAdvisor_v20260202
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

### Code Style

- **Frontend**: Use ESLint + Prettier
- **Backend**: Follow PEP 8 (use `black` formatter)
- **TypeScript**: Strict mode enabled
- **Testing**: Write tests for new features

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📧 Contact

- **Project Repository**: [GitHub](https://github.com/Timthn/HKUST_DormAdvisor_v20260202)
- **Issue Tracker**: [GitHub Issues](https://github.com/Timthn/HKUST_DormAdvisor_v20260202/issues)
- **Project Lead**: [Project Team]

---

<div align="center">

**Made with ❤️ for HKUST Students**

**Happy Coding! 🚀**

</div>
