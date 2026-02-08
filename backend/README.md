# HKUST Dorm Advisor - Backend API

FastAPI backend服务，为 HKUST 宿舍推荐系统提供 AI 驱动的 RESTful API。

## 技术栈

- **Framework**: FastAPI 0.109+
- **AI Service**: 阿里云百炼 (Alibaba Cloud Bailian/Model Studio)
- **Database**: Supabase (PostgreSQL + Auth)
- **Language**: Python 3.9+

## 项目结构

```
backend/
├── app/
│   ├── api/              # API 路由
│   │   ├── chat.py       # 聊天接口
│   │   ├── recommend.py  # 推荐接口
│   │   └── profile.py    # 用户画像接口
│   ├── services/         # 业务逻辑层
│   │   ├── bailian_service.py      # 百炼 API 服务
│   │   ├── rag_service.py          # RAG 检索服务
│   │   └── recommendation_service.py
│   ├── models/           # 数据模型
│   │   └── schemas.py    # Pydantic 模型
│   ├── database/         # 数据库配置
│   │   └── supabase_client.py
│   ├── middleware/       # 中间件
│   │   └── auth.py       # JWT 验证
│   ├── utils/            # 工具函数
│   │   └── constants.py  # 常量配置
│   └── main.py           # 应用入口
├── requirements.txt      # Python 依赖
├── .env.example          # 环境变量模板
└── README.md
```

## 快速开始

### 1. 最小配置（开发模式）

如果只想测试百炼 AI 功能，无需完整配置：

**Windows:**
```powershell
cd backend
.\start.ps1  # 自动创建虚拟环境并安装依赖
```

**首次运行**需要配置 `.env` 文件：
```env
BAILIAN_API_KEY=your_api_key
BAILIAN_APP_ID=your_app_id
DEV_MODE=true  # 开启开发模式，跳过认证
```

**Mac/Linux:**
```bash
cd backend
chmod +x start.sh
./start.sh
```

服务器将在 `http://localhost:8000` 启动。

### 2. 完整配置（生产环境）

**Windows:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入实际配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# Bailian 配置
BAILIAN_API_KEY=your_actual_api_key
BAILIAN_APP_ID=your_actual_app_id

# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# JWT Secret
JWT_SECRET=your_random_secret_key

# 前端地址（用于 CORS）
FRONTEND_URL=http://localhost:3000
```

### 3. 启动开发服务器

**Windows:**
```powershell
python app/main.py
```

**Mac/Linux:**
```bash
python3 app/main.py
```

或使用 uvicorn 命令：
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

服务器将在 `http://localhost:8000` 启动。

## API 文档

启动服务器后，访问：
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## 主要 API 端点

### 认证
所有 API 请求必须在 Header 中携带 JWT Token：
```
Authorization: Bearer <your_jwt_token>
```

### 聊天接口
- `POST /api/chat/` - 发送聊天消息
- `GET /api/chat/history` - 获取聊天历史

### 推荐接口
- `POST /api/recommend/` - 生成宿舍推荐
- `GET /api/recommend/refresh` - 刷新推荐

### 用户画像接口
- `GET /api/profile/` - 获取用户画像
- `POST /api/profile/` - 创建/更新用户画像
- `PATCH /api/profile/` - 部分更新用户画像

## 数据库设计

需要在 Supabase 中创建以下表：

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

## 开发注意事项

### 跨平台兼容性
- 使用 `os.path` 而非硬编码路径
- 使用相对路径导入
- 虚拟环境隔离依赖

### 安全性
- **不要**将 `.env` 文件提交到 Git
- 使用环境变量管理敏感信息
- JWT Token 验证所有受保护端点

### 测试
```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest
```

## 部署

### Render.com 部署
1. 连接 GitHub 仓库
2. 设置 Build Command: `pip install -r requirements.txt`
3. 设置 Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. 配置环境变量

### Railway 部署
1. 连接 GitHub 仓库
2. Railway 会自动检测 Python 项目
3. 配置环境变量
4. 自动部署

## 故障排除

### 导入错误
确保从 `backend/` 目录运行，并使用虚拟环境。

### 数据库连接失败
检查 Supabase URL 和 Key 是否正确配置。

### CORS 错误
确保 `FRONTEND_URL` 环境变量指向正确的前端地址。

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT
