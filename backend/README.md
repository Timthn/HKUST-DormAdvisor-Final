# HKUST Dorm Advisor - Backend API

FastAPI 后端，为 HKUST 宿舍推荐系统提供 AI 驱动的 API（百炼双 Agent、Supabase、可选 DeepSeek Extractor）。

## 技术栈

- **Framework**: FastAPI 0.109+
- **AI**: 阿里云百炼（对话 Agent + 推荐 Agent 各一应用 ID）
- **Extractor**（隐性偏好）: DeepSeek API（`openai` 客户端）
- **Database / Auth**: Supabase (PostgreSQL + Auth)
- **Language**: Python 3.9+

## 项目结构

```
backend/
├── app/
│   ├── api/
│   │   ├── chat.py          # 流式/非流式聊天、历史
│   │   ├── recommend.py     # 推荐
│   │   └── profile.py      # 用户画像
│   ├── services/
│   │   ├── bailian_service.py   # 百炼（双实例：对话 / 推荐）
│   │   ├── recommendation_service.py
│   │   └── extractor_service.py  # DeepSeek 推断 preferences
│   ├── models/
│   │   └── schemas.py
│   ├── database/
│   │   └── supabase_client.py
│   ├── middleware/
│   │   └── auth.py         # JWT（支持 JWKS / HS256，见代码）
│   └── main.py
├── requirements.txt
├── .env.example
├── start.ps1               # Windows：建 venv、装依赖、启动（无 start.sh，Mac/Linux 见下）
└── README.md
```

更完整的数据库与接口说明见仓库根目录 [`docs/DATABASE.md`](../docs/DATABASE.md)、[`docs/API.md`](../docs/API.md)。

## 快速开始

### 1. 安装与虚拟环境

**Windows（推荐 `start.ps1`）：**

```powershell
cd backend
.\start.ps1
```

若首次运行会复制 `.env.example` 为 `.env`，需编辑后再执行 `.\start.ps1`。

**Mac / Linux / 手动：**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env       # Windows: copy .env.example .env
```

### 2. 环境变量

复制 [`backend/.env.example`](./.env.example) 为 `.env`。必填至少包含：

| 变量 | 说明 |
|------|------|
| `BAILIAN_API_KEY` | 百炼 API Key |
| `BAILIAN_APP_ID_CHAT` | 对话 Agent 应用 ID |
| `BAILIAN_APP_ID_RECOMMEND` | 推荐 Agent 应用 ID |
| `DEEPSEEK_API_KEY` | Extractor 模块（无 key 时 extractor 跳过） |

本地联调可设 `DEV_MODE=true`（跳过 JWT，`get_supabase()` 为 `None`，不写数据库）。需要持久化聊天 / 画像 / 推荐时设 `DEV_MODE=false` 并配置 Supabase 与 `JWT_SECRET`（须与 Supabase JWT Secret 一致）。详见根目录 `README.md` 与 `docs/DEPLOYMENT.md`。

### 3. 启动

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

或：

```bash
python app/main.py
```

- API 文档：http://localhost:8000/api/docs  
- ReDoc：http://localhost:8000/api/redoc  
- 健康检查：`GET /`、`GET /api/health`

## 主要 API 端点

**认证**：生产环境在 Header 携带 `Authorization: Bearer <jwt>`。`DEV_MODE=true` 时可不传（测试用户 `test-user-123`）。

| 模块 | 方法 | 路径 |
|------|------|------|
| 聊天 | POST | `/api/chat/stream` — SSE 流式 |
| 聊天 | POST | `/api/chat/` — 非流式 JSON |
| 聊天 | GET | `/api/chat/history` — 历史（`limit` 默认 50） |
| 推荐 | POST | `/api/recommend/` |
| 推荐 | GET | `/api/recommend/refresh` — 与 POST 等价 |
| 画像 | GET | `/api/profile/` |
| 画像 | POST | `/api/profile/` — 仅 UPDATE `form_preferences`（行由 Supabase Trigger 创建） |

## 数据库

表结构、RLS、`chat_logs` 扩展列等请以 **[`docs/DATABASE.md`](../docs/DATABASE.md)** 为准，勿使用本文件旧版示例 SQL。

## 开发注意事项

- **不要**将 `.env` 提交到 Git。
- 从 **`backend/`** 目录运行，保证 `app` 包可导入。
- `DEV_MODE=true` 时 profile/recommend 等依赖 Supabase 的接口无法正常访问数据库（客户端为 `None`）。

## 部署

- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- 环境变量：生产务必 `DEV_MODE=false`，并配置双百炼 App ID、`DEEPSEEK_API_KEY`、`SUPABASE_*`、`JWT_SECRET`、`FRONTEND_URL` 等。详见 **[`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md)**。

## 故障排除

| 问题 | 处理 |
|------|------|
| `ModuleNotFoundError: app` | 当前工作目录应为 `backend/` |
| 401 | 检查 JWT；`JWT_SECRET` 是否与 Supabase 一致（HS256） |
| Supabase 连接 | `DEV_MODE=false` 且配置 `SUPABASE_URL` + `SUPABASE_KEY` |
| CORS | 设置 `FRONTEND_URL` 为前端来源 |

## License

MIT
