# HKUST Dorm Advisor | 香港科大宿舍推荐系统

<div align="center">

**🏠 AI驱动的香港科技大学宿舍推荐系统**  
**AI-Powered HKUST Dormitory Recommendation System**

*基于 Alibaba Cloud Bailian + Next.js + FastAPI + Supabase 构建*

[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

</div>

---

## 📖 目录 | Table of Contents

- [项目概述 | Project Overview](#-项目概述--project-overview)
- [技术栈 | Tech Stack](#-技术栈--tech-stack)
- [项目结构 | Project Structure](#-项目结构--project-structure)
- [开发者入门指南 | Developer Onboarding Guide](#-开发者入门指南--developer-onboarding-guide)
  - [环境要求 | Prerequisites](#环境要求--prerequisites)
  - [初始设置 | Initial Setup](#初始设置--initial-setup)
  - [后端配置 | Backend Setup](#后端配置--backend-setup)
  - [前端配置 | Frontend Setup](#前端配置--frontend-setup)
  - [运行应用 | Running the Application](#运行应用--running-the-application)
  - [验证测试 | Verification](#验证测试--verification)
- [开发模式说明 | Development Mode](#-开发模式说明--development-mode)
- [项目文档 | Documentation](#-项目文档--documentation)
- [系统架构 | System Architecture](#-系统架构--system-architecture)
- [功能清单 | Features](#-功能清单--features)
- [常见问题 | Troubleshooting](#-常见问题--troubleshooting)
- [贡献指南 | Contributing](#-贡献指南--contributing)

---

## 🎯 项目概述 | Project Overview

HKUST Dorm Advisor 是一个智能宿舍推荐系统，使用 AI 技术为香港科技大学学生提供个性化的住宿建议。项目采用现代化的前后端分离架构，支持跨平台开发。

An intelligent dormitory recommendation system that leverages AI technology to provide personalized accommodation suggestions for HKUST students. Built with modern frontend-backend separation architecture for cross-platform development.

**核心功能 | Key Features:**
- 🤖 AI 智能对话，解答宿舍相关问题
- 📊 基于用户偏好的个性化推荐
- 🔐 Supabase 安全认证
- 📱 响应式设计，支持所有设备
- 🚀 快速、可扩展的架构

---

## 🛠 技术栈 | Tech Stack

### 前端 | Frontend
- **框架 Framework**: Next.js 14+ (App Router)
- **语言 Language**: TypeScript 5.8
- **UI 库 Library**: React 18.2
- **样式 Styling**: Tailwind CSS 3.4
- **图标 Icons**: Lucide React
- **HTTP 客户端 Client**: Axios 1.6
- **认证 Auth**: Supabase Auth
- **Markdown 渲染 Markdown**: react-markdown + remark-gfm（聊天回复支持表格、粗体等）
- **部署 Deployment**: Vercel

### 后端 | Backend
- **框架 Framework**: FastAPI 0.109
- **语言 Language**: Python 3.9+
- **服务器 Server**: Uvicorn (auto-reload)
- **AI 服务 AI Service**: 阿里云百炼 (Alibaba Cloud Bailian)
- **数据库 Database**: Supabase (PostgreSQL)
- **认证 Auth**: JWT (python-jose)
- **异步 HTTP Async HTTP**: httpx
- **部署 Deployment**: Render / Railway

---

## 📁 项目结构 | Project Structure

```
hkust-dorm-advisor_202602/
├── 📁 backend/                     # FastAPI 后端
│   ├── app/
│   │   ├── api/                    # API 路由
│   │   │   ├── chat.py             # 聊天接口
│   │   │   ├── recommend.py        # 推荐接口
│   │   │   └── profile.py          # 用户资料接口
│   │   ├── services/               # 业务逻辑
│   │   │   ├── bailian_service.py  # 百炼 AI 服务
│   │   │   ├── recommendation_service.py
│   │   │   ├── extractor_service.py  # DeepSeek 隐性偏好分析（Extractor）
│   │   │   └── rag_service.py      # RAG 检索（规划中）
│   │   ├── models/                 # 数据模型
│   │   │   └── schemas.py          # Pydantic 模型
│   │   ├── database/               # 数据库层
│   │   │   └── supabase_client.py  # Supabase 客户端
│   │   ├── middleware/             # 中间件
│   │   │   └── auth.py             # JWT 认证
│   │   ├── utils/                  # 工具函数
│   │   │   └── constants.py        # 系统常量
│   │   ├── data/                   # 静态数据
│   │   │   └── hall_facilities.json
│   │   └── main.py                 # 应用入口
│   ├── requirements.txt            # Python 依赖
│   ├── .env.example                # 环境变量模板
│   └── README.md
│
├── 📁 frontend/                    # Next.js 前端
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # 首页
│   │   ├── layout.tsx              # 根布局
│   │   ├── globals.css             # 全局样式
│   │   ├── login/page.tsx          # 登录页
│   │   ├── setup/page.tsx          # 偏好设置页
│   │   └── chat/page.tsx           # 聊天主界面
│   ├── components/                 # React 组件
│   │   ├── ChatPanel.tsx           # 聊天消息面板
│   │   ├── Sidebar.tsx             # 侧边导航栏
│   │   ├── RecommendationPanel.tsx # AI 分析面板
│   │   ├── SetupForm.tsx           # 用户偏好表单
│   │   ├── FacilitiesModal.tsx     # 设施详情弹窗
│   │   └── LandingPage.tsx         # 欢迎页
│   ├── lib/                        # 工具库
│   │   ├── supabase.ts             # Supabase 客户端
│   │   ├── api.ts                  # API 封装
│   │   └── constants.ts            # 前端常量
│   ├── types/                      # TypeScript 类型
│   │   └── index.ts
│   ├── package.json                # 依赖配置
│   ├── next.config.js              # Next.js 配置
│   ├── tailwind.config.js          # Tailwind 配置
│   ├── tsconfig.json               # TypeScript 配置
│   ├── .env.local.example          # 环境变量模板
│   └── README.md
│
├── 📁 docs/                        # 项目文档
│   ├── API.md                      # API 接口文档
│   ├── DATABASE.md                 # 数据库设计
│   ├── DEPLOYMENT.md               # 部署指南
│   └── QUICKSTART.md               # 快速参考
│
├── README.md                       # 项目总览（本文件）
├── TODO.md                         # 开发任务清单
├── LOCAL_SETUP.md                  # 本地配置详细指南
├── TESTING.md                      # 测试指南
└── .gitignore                      # Git 忽略规则
```

---

## 🚀 开发者入门指南 | Developer Onboarding Guide

### 环境要求 | Prerequisites

在开始之前，请确保已安装以下工具：

| 工具 Tool | 要求版本 Required | 检查命令 Check | 下载链接 Download |
|----------|------------------|---------------|------------------|
| **Node.js** | 18.0.0+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0.0+ | `npm --version` | Node.js 自带 |
| **Python** | 3.9.0+ | `python --version` | [python.org](https://www.python.org/) |
| **pip** | 最新 Latest | `pip --version` | Python 自带 |
| **Git** | 最新 Latest | `git --version` | [git-scm.com](https://git-scm.com/) |

**必需账号与密钥 | Required Accounts & Keys:**
- ✅ **阿里云百炼** API Key + 两个 Agent 应用 ID（对话 Agent + 推荐 Agent 各一个）
- ✅ **DeepSeek** API Key（Extractor 模块使用）
- ⚠️ **Supabase** 账号（可选，仅生产环境需要）

---

### 初始设置 | Initial Setup

#### 1. 克隆仓库 | Clone Repository

```bash
# 通过 HTTPS 克隆
git clone https://github.com/Timthn/HKUST_DormAdvisor_v20260202.git

# 或通过 SSH 克隆（如果已配置）
git clone git@github-timthn:Timthn/HKUST_DormAdvisor_v20260202.git

# 进入项目目录
cd HKUST_DormAdvisor_v20260202
```

#### 2. 验证项目结构 | Verify Structure

```bash
# 列出所有目录
ls -la

# 应该看到: backend/, frontend/, docs/, README.md 等
```

---

### 后端配置 | Backend Setup

#### 步骤 1: 进入后端目录 | Navigate to Backend

```bash
cd backend
```

#### 步骤 2: 创建 Python 虚拟环境 | Create Virtual Environment

**Windows (PowerShell):**
```powershell
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 如果遇到执行策略错误，运行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Mac/Linux (Bash/Zsh):**
```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate
```

**验证激活 | Verify:**
终端提示符前应显示 `(venv)`

#### 步骤 3: 安装 Python 依赖 | Install Dependencies

```bash
# 升级 pip
pip install --upgrade pip

# 安装所有依赖
pip install -r requirements.txt

# 验证安装
pip list
```

**应包含的主要包 | Expected Packages:**
- fastapi==0.109.0
- uvicorn==0.27.0
- python-dotenv==1.0.0
- pydantic==2.5.3
- supabase==2.3.4
- httpx (0.24-0.26)
- python-jose==3.3.0
- passlib==1.7.4

#### 步骤 4: 配置环境变量 | Configure Environment

```bash
# 复制环境变量模板
cp .env.example .env

# Windows (PowerShell):
# copy .env.example .env
```

**编辑 `backend/.env` 文件，填入实际值：**

```env
# ========================================
# 阿里云百炼配置
# Alibaba Cloud Bailian Configuration
# ========================================
# 从以下网址获取: https://bailian.console.aliyun.com/
BAILIAN_API_KEY=sk-你的实际API密钥
BAILIAN_APP_ID_CHAT=你的对话Agent应用ID
BAILIAN_APP_ID_RECOMMEND=你的推荐Agent应用ID

# ========================================
# 开发模式 | Development Mode
# ========================================
# true = 跳过认证（本地测试用）
# false = 需要完整认证（生产环境）
DEV_MODE=true

# ========================================
# Supabase 配置（开发模式下可选）
# Supabase Configuration (Optional in dev)
# ========================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# ========================================
# JWT 配置（开发模式下可选）
# JWT Configuration (Optional in dev)
# ========================================
JWT_SECRET=your-random-secret-key-min-32-chars
JWT_ALGORITHM=HS256

# ========================================
# DeepSeek API（Extractor 模块）
# DeepSeek API (for Extractor module)
# ========================================
DEEPSEEK_API_KEY=your-deepseek-api-key

# ========================================
# CORS 和服务器配置
# CORS & Server Configuration
# ========================================
FRONTEND_URL=http://localhost:3000
HOST=0.0.0.0
PORT=8000
```

> **CRITICAL — `JWT_SECRET`**: This value must be **identical** to the **JWT Secret** shown in your Supabase project dashboard under `Settings → API → JWT Settings`. The backend uses this secret to verify tokens issued by Supabase Auth. If the two values differ, every authenticated endpoint will return `401 Unauthorized`.

**⚠️ 重要提示 | Important:**
- `BAILIAN_API_KEY`、`BAILIAN_APP_ID_CHAT`、`BAILIAN_APP_ID_RECOMMEND` 是**必需**的（三个都要填）
- `DEEPSEEK_API_KEY` 是**必需**的（Extractor 模块使用）
- 开发模式 (`DEV_MODE=true`) 下，Supabase 和 JWT 配置可选
- 切勿将 `.env` 文件提交到 Git（已在 `.gitignore` 中）
- 开发模式 (`DEV_MODE=true`) 下，Supabase 和 JWT 配置可选
- 切勿将 `.env` 文件提交到 Git（已在 `.gitignore` 中）

#### 步骤 5: 启动后端 | Start Backend

```bash
# 启动后端服务器
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**预期输出 | Expected Output:**
```
INFO:     Will watch for changes in these directories: ['C:\\...\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**验证后端运行 | Verify Backend:**
- API 文档 Docs: http://localhost:8000/api/docs (Swagger UI)
- 备用文档 Alternative: http://localhost:8000/api/redoc (ReDoc)
- 健康检查 Health: http://localhost:8000/ (应返回 JSON)

**保持此终端窗口运行 | Keep This Terminal Running**

---

### 前端配置 | Frontend Setup

#### 步骤 1: 打开新终端 | Open New Terminal

**重要 | Important:** 保持后端终端运行，打开一个**新的**终端窗口/标签页。

#### 步骤 2: 进入前端目录 | Navigate to Frontend

```bash
cd frontend

# 或从项目根目录：
# cd ../frontend
```

#### 步骤 3: 安装 Node.js 依赖 | Install Dependencies

```bash
# 安装所有依赖
npm install

# 或使用 yarn:
# yarn install
```

**📦 npm install 工作原理 | How npm install Works:**

`npm install` 会自动读取 `package.json` 文件，并安装所有列出的依赖包及其子依赖。

**`npm install` automatically reads `package.json` and installs all listed dependencies and their sub-dependencies.**

```
package.json (您定义的直接依赖)
     ↓
npm install (读取并解析依赖树)
     ↓
package-lock.json (锁定所有依赖的确切版本)
     ↓
node_modules/ (下载并安装数百个包)
```

**将安装以下包 | Will Install:**
- Next.js 14.1
- React 18.2
- TypeScript 5.8
- Tailwind CSS 3.4
- Supabase 客户端库
- Axios, Lucide React
- react-markdown, remark-gfm（聊天 Markdown 与表格渲染）

**📝 说明 | Note:**
- **`package.json`**: 定义项目直接需要的 7 个依赖
- **`package-lock.json`**: 自动生成，记录所有依赖（含间接依赖）的完整版本信息
- **`node_modules/`**: 实际安装的所有包（数百个文件夹）

**安装时间 | Installation Time:** 约 2-5 分钟（取决于网速）

#### 步骤 4: 配置环境变量 | Configure Environment

```bash
# 复制环境变量模板
cp .env.local.example .env.local

# Windows (PowerShell):
# copy .env.local.example .env.local
```

**编辑 `frontend/.env.local` 文件：**

```env
# ========================================
# 开发模式 | Development Mode
# ========================================
# true = 跳过认证，直接访问聊天界面
# false = 需要通过 Supabase 登录
NEXT_PUBLIC_DEV_MODE=true

# ========================================
# Supabase 配置（开发模式下可选）
# Supabase Configuration (Optional in dev)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ========================================
# 后端 API 地址
# Backend API URL
# ========================================
NEXT_PUBLIC_API_URL=http://localhost:8000

# ========================================
# 可选：Analytics 等
# Optional: Analytics, etc.
# ========================================
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

**⚠️ 重要提示 | Important:**
- `NEXT_PUBLIC_API_URL` 必须与后端 URL 匹配
- `NEXT_PUBLIC_DEV_MODE=true` 允许无需登录测试
- 所有 `NEXT_PUBLIC_*` 变量会暴露到浏览器

#### 步骤 5: 启动前端开发服务器 | Start Development Server

```bash
npm run dev
```

**预期输出 | Expected Output:**
```
> hkust-dorm-advisor-frontend@2.0.0 dev
> next dev

   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 3.2s
```

**验证前端运行 | Verify Frontend:**
- 首页 Homepage: http://localhost:3000
- 聊天界面 Chat: http://localhost:3000/chat（开发模式可直接访问）
- 设置页 Setup: http://localhost:3000/setup

---

### 运行应用 | Running the Application

#### 总结：启动两个服务 | Summary: Start Both Services

您需要**两个终端窗口**同时运行：

**终端 1 - 后端 | Terminal 1 - Backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate     # Mac/Linux
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**终端 2 - 前端 | Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 快速测试 | Quick Test

1. **打开浏览器 | Open Browser:** http://localhost:3000
2. **进入聊天页 | Go to Chat:** http://localhost:3000/chat
3. **发送测试消息 | Type Test Message:**
   - "介绍一下 Hall I"
   - "Which dorm has air conditioning?"
   - "I want a quiet dorm with a sea view"
   - "我想找有空调的安静宿舍"

4. **预期响应 | Expected Response:**
   - AI 应该返回宿舍相关信息
   - 响应时间：2-5 秒

---

### 验证测试 | Verification

#### 后端健康检查 | Backend Health Check

```bash
# 测试健康端点
curl http://localhost:8000/

# 预期响应:
# {"message": "HKUST Dorm Advisor Backend API"}
```

#### 前端构建测试 | Frontend Build Test

```bash
cd frontend
npm run build

# 应无错误完成
# 会在 .next/ 目录生成生产构建
```

#### API 文档检查 | API Documentation Check

访问 http://localhost:8000/api/docs 确保所有端点已加载：

**预期端点 | Expected Endpoints:**
- `POST /api/chat/stream` - 发送聊天消息（SSE 流式）
- `GET /api/chat/history` - 获取聊天历史
- `POST /api/recommend/` - 生成推荐
- `GET /api/recommend/refresh` - 刷新推荐
- `GET /api/profile/` - 获取当前用户画像
- `POST /api/profile/` - 更新用户画像（form_preferences）

---

## 💡 开发模式说明 | Development Mode

### 什么是开发模式？ | What is Development Mode?

开发模式 (`DEV_MODE=true`) **跳过身份认证**，让您专注于测试核心功能，无需配置 Supabase。

**开发模式特性 | Features:**
- ✅ 无需登录 | No login required
- ✅ 直接访问 `/chat` 界面 | Direct access to chat
- ✅ 使用测试用户 ID (`test-user-123`)
- ✅ AI 聊天立即可用 | AI chat works immediately
- ✅ 简化的入门流程 | Simplified onboarding

**限制 | Limitations:**
- ❌ 无用户持久化（刷新会丢失数据）| No user persistence
- ❌ 不支持多用户 | No multi-user support
- ❌ 聊天历史不保存到数据库 | Chat history not saved

### 切换到生产模式 | Switch to Production Mode

准备好生产环境时：

1. **配置 Supabase**（见 [LOCAL_SETUP.md](LOCAL_SETUP.md)）
2. **更新环境变量 | Update Environment:**
   ```env
   # backend/.env
   DEV_MODE=false
   
   # frontend/.env.local
   NEXT_PUBLIC_DEV_MODE=false
   ```
3. **重启两个服务器 | Restart Both Servers**

---

## 📚 项目文档 | Documentation

| 文档 Document | 描述 Description |
|--------------|-----------------|
| [LOCAL_SETUP.md](LOCAL_SETUP.md) | 详细的本地开发配置指南 |
| [TESTING.md](TESTING.md) | 测试流程和测试用例 |
| [TODO.md](TODO.md) | 开发路线图和任务清单 |
| [docs/API.md](docs/API.md) | 完整 API 接口文档 |
| [docs/DATABASE.md](docs/DATABASE.md) | 数据库架构和设置 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 生产环境部署指南 |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | 常用操作快速参考 |

---

## 🏗 系统架构 | System Architecture

```
┌─────────────────┐         ┌──────────────────────────────────┐
│                 │  HTTPS  │          FastAPI 后端             │
│   Next.js 14    │────────▶│          (Port 8000)              │
│   前端          │◀────────│                                   │
│   (Port 3000)   │  SSE /  │  ┌──────────────────────────┐   │
│                 │  JSON   │  │ chat.py (SSE StreamingResp)│   │──▶ Bailian Chat Agent
└─────────────────┘         │  ├──────────────────────────┤   │
                             │  │ recommend.py              │   │──▶ Bailian Recommend Agent
                             │  ├──────────────────────────┤   │
                             │  │ extractor_service.py      │   │──▶ DeepSeek API
                             │  └──────────────────────────┘   │
                             └──────────────────────────────────┘
                                              │
                                              ▼
                             ┌──────────────────────────────────┐
                             │            Supabase               │
                             │  Auth  │  profiles  │ chat_logs  │
                             │        │  halls     │            │
                             └──────────────────────────────────┘
```

### 请求流程 | Request Flow

1. **用户登录 | User Login**: 前端 → Supabase Auth → JWT Token → 前端
2. **聊天消息 | Chat (SSE)**: 前端 → `POST /api/chat/stream` → 后端从 `chat_logs` 取最近 10 条作为多轮历史 → 与当前用户问题一并送 Bailian Chat Agent → SSE 流式返回 → 前端用 react-markdown 渲染（表格、粗体等）；用户消息与 AI 回复写入 `chat_logs`
3. **Extractor（后台）**: 每 20 条用户消息后自动触发 → DeepSeek API 分析对话 → 更新 `profiles.inferred_preferences`
4. **生成推荐 | Recommendations**: `POST /api/recommend/` → 读取 `form_preferences` + `inferred_preferences` → Bailian Recommend Agent → 查 `halls` 表补全信息 → 写入 `profiles.last_recommendation` → 返回前端
5. **保存偏好 | Save Prefs**: 前端 SetupForm → `POST /api/profile/` → 更新 `profiles.form_preferences`（UPDATE only，行由 DB Trigger 创建）

---

## ✨ 功能清单 | Features

### ✅ 已实现 | Implemented

- [x] 用户认证（Supabase Auth）| User Authentication
- [x] 用户偏好设置（form_preferences）| User Preferences via SetupForm
- [x] AI 流式聊天（SSE StreamingResponse）| Streaming AI Chat
- [x] 多轮对话（最近 10 条历史送 Bailian）| Multi-turn Chat with History
- [x] 聊天回复 Markdown 渲染（表格、粗体、列表）| Markdown Rendering in Chat
- [x] Bailian 长期记忆（memory_id 懒初始化）| Long-term Memory
- [x] Extractor 模块（DeepSeek 隐性偏好分析）| Hidden Preference Extraction
- [x] 宿舍推荐（双 Agent 架构）| Dormitory Recommendations
- [x] 推荐结果持久化（profiles.last_recommendation）| Persistent Recommendations
- [x] 设施详情查看 | Facility Details
- [x] 响应式设计（手机/桌面）| Responsive Design
- [x] 开发模式便捷测试 | Development Mode

### 🚧 规划中 | Planned (from TODO.md)

- [ ] RAG 知识库检索 | RAG Knowledge Base
- [ ] 多会话聊天历史 | Multi-session History（当前已支持单用户多轮对话与历史持久化）
- [ ] 推荐结果持久化 | Persistent Recommendations
- [ ] 高级用户画像 | Advanced Profiling
- [ ] 云端聊天记录同步 | Cloud Chat Sync
- [ ] 多语言支持（英文/中文）| Multi-language Support

---

## 🔧 常见问题 | Troubleshooting

### 后端问题 | Backend Issues

**问题 Problem: `ModuleNotFoundError: No module named 'app'`**
```bash
# 解决方案: 确保在 backend 目录且虚拟环境已激活
cd backend
.\venv\Scripts\Activate.ps1  # Windows
python -m pip install -r requirements.txt
```

**问题 Problem: `端口 8000 已被占用 | Port 8000 in use`**
```bash
# Windows: 查找并终止进程
netstat -ano | findstr :8000
taskkill /PID <进程ID> /F

# Mac/Linux: 查找并终止进程
lsof -ti:8000 | xargs kill -9
```

**问题 Problem: `BAILIAN_API_KEY 未设置 | Not Set`**
```bash
# 验证 .env 文件存在且包含密钥
cat backend/.env | grep BAILIAN_API_KEY

# 确保没有多余的空格或引号
```

### 前端问题 | Frontend Issues

**问题 Problem: `Module not found: Can't resolve '@/...'`**
```bash
# 解决方案: 重新安装依赖
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**问题 Problem: `无法连接后端 | Cannot connect to backend`**
```bash
# 验证后端正在运行:
curl http://localhost:8000/

# 检查 .env.local 中的 NEXT_PUBLIC_API_URL
# 应该是: http://localhost:8000 (无尾部斜杠)
```

**问题 Problem: `TypeScript 构建错误 | Build Fails`**
```bash
# 运行类型检查
npm run build

# 修复显示的错误
```

### 环境变量问题 | Environment Variable Issues

**问题 Problem: `.env` 修改未生效 | Changes Not Taking Effect**
```bash
# 解决方案: 修改 .env 后重启服务器
# 按 Ctrl+C 停止
# 然后重新启动: uvicorn app.main:app --reload
```

**问题 Problem: `.env` 文件未找到 | File Not Found**
```bash
# 确保从示例文件复制
cp .env.example .env  # Mac/Linux
copy .env.example .env  # Windows

   ```

2. **克隆你的 Fork | Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HKUST_DormAdvisor_v20260202.git
   cd HKUST_DormAdvisor_v20260202
   ```

3. **创建功能分支 | Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **进行更改 | Make Changes**
   - 遵循代码风格指南
   - 添加测试（如适用）
   - 更新文档

5. **提交更改 | Commit Changes**
   ```bash
   git add .
   git commit -m "feat: 添加你的功能描述"
   ```

6. **推送到你的 Fork | Push to Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request | Open PR**
   - 前往原始仓库
   - 点击 "New Pull Request"
   - 选择你的分支

### 提交信息规范 | Commit Message Guidelines

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 添加新功能 | add new feature
fix: 修复 bug | fix bug
docs: 更新文档 | update documentation
style: 代码格式 | format code
refactor: 重构代码 | refactor code
test: 添加测试 | add tests
chore: 更新依赖 | update dependencies
```

### 代码规范 | Code Style

- **前端 Frontend**: 使用 ESLint + Prettier
- **后端 Backend**: 遵循 PEP 8（使用 `black` 格式化）
- **TypeScript**: 启用严格模式
- **测试 Testing**: 为新功能编写测试

---

## 📄 许可证 | License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 📧 联系方式 | Contact

- **项目仓库 | Repository**: [GitHub](https://github.com/Timthn/HKUST_DormAdvisor_v20260202)
- **问题追踪 | Issue Tracker**: [GitHub Issues](https://github.com/Timthn/HKUST_DormAdvisor_v20260202/issues)
- **项目负责人 | Project Lead**: [Project Team]

---

<div align="center">

**用心打造，为科大学生服务 ❤️**  
**Made with ❤️ for HKUST Students**

**Happy Coding! 🚀**

</div>
