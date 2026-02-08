# HKUST Dorm Advisor - 前后端分离架构

<div align="center">

**AI 驱动的香港科技大学宿舍推荐系统**

*基于阿里云百炼 + Next.js + FastAPI + Supabase*

</div>

---

## 项目概述

HKUST Dorm Advisor 是一个智能宿舍推荐系统，使用 AI 技术为香港科技大学学生提供个性化的宿舍建议。项目采用前后端分离架构，支持跨平台开发（Windows + Mac）。

## 技术栈

### 前端
- **框架**: Next.js 14+ (React 19)
- **样式**: Tailwind CSS
- **认证**: Supabase Auth
- **部署**: Vercel

### 后端
- **框架**: FastAPI (Python)
- **AI 服务**: 阿里云百炼 (Bailian/Model Studio)
- **数据库**: Supabase (PostgreSQL)
- **部署**: Render / Railway

## 项目结构

```
hkust-dorm-advisor_202602/
├── 📁 backend/                     # FastAPI 后端项目
│   ├── app/
│   │   ├── api/                    # API 路由
│   │   │   ├── chat.py             # 聊天接口
│   │   │   ├── recommend.py        # 推荐接口
│   │   │   └── profile.py          # 用户画像接口
│   │   ├── services/               # 业务逻辑层
│   │   │   ├── bailian_service.py  # 百炼 AI 服务
│   │   │   ├── recommendation_service.py  # 推荐服务
│   │   │   └── rag_service.py      # RAG 检索服务
│   │   ├── models/                 # 数据模型
│   │   │   └── schemas.py          # Pydantic 模型
│   │   ├── database/               # 数据库配置
│   │   │   └── supabase_client.py  # Supabase 客户端
│   │   ├── middleware/             # 中间件
│   │   │   └── auth.py             # JWT 认证
│   │   ├── utils/                  # 工具函数
│   │   └── main.py                 # 应用入口
│   ├── requirements.txt            # Python 依赖
│   ├── .env.example                # 环境变量示例
│   └── README.md
│
├── 📁 frontend/                    # Next.js 前端项目
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # 主页（欢迎页）
│   │   ├── layout.tsx              # 全局布局
│   │   ├── login/page.tsx          # 登录页
│   │   ├── setup/page.tsx          # 偏好设置页
│   │   └── chat/page.tsx           # 聊天主界面
│   ├── components/                 # React 组件
│   │   ├── ChatPanel.tsx           # 聊天面板
│   │   ├── Sidebar.tsx             # 侧边栏
│   │   ├── RecommendationPanel.tsx # 推荐面板
│   │   ├── SetupForm.tsx           # 设置表单
│   │   ├── FacilitiesModal.tsx     # 设施详情弹窗
│   │   └── LandingPage.tsx         # 着陆页
│   ├── lib/                        # 工具函数
│   │   ├── supabase.ts             # Supabase 客户端
│   │   ├── api.ts                  # API 调用封装
│   │   └── constants.ts            # 常量配置（宿舍数据）
│   ├── types/                      # TypeScript 类型定义
│   │   └── index.ts
│   ├── package.json                # 依赖配置
│   ├── next.config.js              # Next.js 配置
│   ├── tailwind.config.js          # Tailwind CSS 配置
│   ├── tsconfig.json               # TypeScript 配置
│   ├── .env.local.example          # 环境变量示例
│   └── README.md
│
├── 📁 docs/                        # 项目文档
│   ├── API.md                      # API 接口文档
│   ├── DATABASE.md                 # 数据库设计
│   ├── DEPLOYMENT.md               # 部署指南
│   └── QUICKSTART.md               # 快速启动参考
│
├── README.md                       # 项目总览（本文件）
├── TODO.md                         # 开发任务清单
├── LOCAL_SETUP.md                  # 本地配置详细指南
├── TESTING.md                      # 测试指南
├── metadata.json                   # 项目元数据
└── .gitignore                      # Git 忽略文件
```

## 快速开始

### 📋 本地开发启动步骤

### 前置要求

- **Node.js** 18+ (前端)
- **Python** 3.9+ (后端)
- **阿里云百炼** API Key（必需）
- **Supabase** 账号（可选，暂时不需要）

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd hkust-dorm-advisor_202602
```

### 2. 最小配置（仅测试百炼 AI）

**后端配置**：
```powershell
cd backend
copy .env.example .env
```

编辑 `backend\.env`，**最小配置**：
```env
BAILIAN_API_KEY=your_actual_api_key
BAILIAN_APP_ID=your_actual_app_id
DEV_MODE=true
```

**前端配置**：
```powershell
cd frontend
copy .env.local.example .env.local
```

编辑 `frontend\.env.local`：
```env
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 启动后端

打开一个终端窗口：

```powershell
# 进入后端目录
cd backend

# 创建并激活虚拟环境（首次运行）
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Mac/Linux

# 安装依赖（首次运行或 requirements.txt 更新后）
pip install -r requirements.txt

# 启动后端服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

后端将在 `http://localhost:8000` 启动。

**验证后端**：访问 http://localhost:8000/api/docs 查看 API 文档。

### 4. 启动前端

**新开另一个终端窗口**：

```powershell
# 进入前端目录
cd frontend

# 安装依赖（首次运行或 package.json 更新后）
npm install

# 启动前端开发服务器
npm run dev
```

前端将在 `http://localhost:3000` 启动。

### 5. 开始测试

访问 http://localhost:3000/chat 直接进入聊天界面（开发模式无需登录）。

**测试消息示例**：
- "介绍一下 Hall I"
- "我想找安静的宿舍"
- "哪个宿舍有空调？"

详细测试步骤请查看 [`TESTING.md`](TESTING.md)。

---

## 💡 开发模式说明

当前配置使用**开发模式**（`DEV_MODE=true`）跳过用户认证，专注测试核心功能：

**开发模式特性**：
- ✅ 无需配置 Supabase
- ✅ 无需登录即可访问聊天界面
- ✅ 使用测试用户 ID（`test-user-123`）
- ✅ 可以直接测试百炼 AI 对话功能

**注意**：开发模式**仅用于本地测试**，生产环境必须关闭。

将来配置 Supabase 后，设置 `DEV_MODE=false` 即可启用完整功能。

---

## 📚 文档导航

- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - 详细本地开发配置指南
- **[TESTING.md](TESTING.md)** - 完整测试流程和用例
- **[docs/API.md](docs/API.md)** - API 接口文档
- **[docs/DATABASE.md](docs/DATABASE.md)** - 数据库设计
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - 部署指南
- **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - 快速启动参考

### 后端 `.env`

```env
# 阿里云百炼配置
BAILIAN_API_KEY=your_bailian_api_key
BAILIAN_APP_ID=your_app_id

# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# JWT Secret
JWT_SECRET=your_random_secret_key

# 前端地址（CORS）
FRONTEND_URL=http://localhost:3000
```

### 前端 `.env.local`

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 数据库设置

在 Supabase 中创建以下表：

### profiles 表

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  identity TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### chat_logs 表

```sql
CREATE TABLE chat_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

详细数据库设计见 [docs/DATABASE.md](docs/DATABASE.md)

## 系统架构

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│             │  HTTPS  │             │  HTTP   │              │
│  Next.js    │────────>│   FastAPI   │────────>│   Bailian    │
│  Frontend   │         │   Backend   │         │   AI API     │
│             │<────────│             │<────────│              │
└─────────────┘         └─────────────┘         └──────────────┘
       │                       │
       │                       │
       v                       v
┌─────────────────────────────────┐
│       Supabase                  │
│  ┌─────────┐   ┌─────────┐    │
│  │  Auth   │   │PostgreSQL│    │
│  └─────────┘   └─────────┘    │
└─────────────────────────────────┘
```

### 数据流

1. **用户登录**: 前端 → Supabase Auth → JWT Token
2. **偏好设置**: 前端 → 后端 API → Supabase 数据库
3. **聊天对话**: 前端 → 后端 API → 百炼 AI → 数据库 → 前端
4. **推荐生成**: 后端从数据库读取用户画像 → 构建 Prompt → 百炼 AI → 前端

## API 文档

后端启动后访问：
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

详细 API 说明见 [docs/API.md](docs/API.md)

## 主要功能

### ✅ 已实现
- [x] 用户认证（Supabase Auth）
- [x] 用户偏好设置
- [x] AI 聊天对话
- [x] 宿舍推荐生成
- [x] 设施详情查看
- [x] 前后端分离架构

### 🚧 计划实现（根据 FSD）
- [ ] RAG 知识库检索
- [ ] 多会话管理（数据库存储）
- [ ] 推荐结果持久化
- [ ] 更复杂的用户画像
- [ ] 聊天记录云端同步

## 开发指南

### 代码规范

- **前端**: 使用 TypeScript + ESLint
- **后端**: 遵循 PEP 8 (Python)
- **提交**: 使用语义化提交信息

### 分支管理

- `main`: 稳定版本
- `dev`: 开发分支
- `feature/*`: 功能分支

### 测试

```bash
# 后端测试
cd backend
pytest

# 前端测试
cd frontend
npm run test
```

## 部署

### 前端部署（Vercel）
1. 连接 GitHub 仓库到 Vercel
2. 设置根目录为 `frontend/`
3. 配置环境变量
4. 自动部署

### 后端部署（Render/Railway）
1. 连接 GitHub 仓库
2. 设置根目录为 `backend/`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. 配置环境变量

详细部署指南见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 跨平台开发

### Windows 开发者
- 使用 PowerShell 或 Windows Terminal
- Python 虚拟环境: `.\venv\Scripts\Activate.ps1`
- 注意文件路径使用反斜杠 `\`

### Mac/Linux 开发者
- 使用 Terminal / Bash / Zsh
- Python 虚拟环境: `source venv/bin/activate`
- 注意文件路径使用正斜杠 `/`

### 统一规范
- Git 使用 LF 换行符
- 相对路径而非绝对路径
- 环境变量管理敏感信息

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 常见问题

### Q: 后端启动失败？
A: 检查 Python 版本（需要 3.9+）和虚拟环境是否激活。

### Q: 前端无法连接后端？
A: 确认后端已启动，检查 `NEXT_PUBLIC_API_URL` 配置。

### Q: Supabase 连接失败？
A: 验证 URL 和 Key 是否正确，检查网络连接。

### Q: 百炼 API 报错？
A: 确认 API Key 和 App ID 是否有效，检查配额。

## 许可证

MIT License

## 联系方式

- **项目负责人**: [Your Name]
- **Email**: [your.email@example.com]
- **Issue Tracker**: GitHub Issues

---

**Happy Coding! 🚀**
