# 本地开发环境配置指南

完整的 step-by-step 指南，帮助你快速配置本地开发环境并开始测试。

## 📋 前置要求

### 必需软件
- ✅ **Python 3.9+**（检查：`python --version`）
- ✅ **Node.js 18+**（检查：`node --version`）
- ✅ **npm**（随 Node.js 安装）
- ✅ **Git**（用于版本控制）

### Windows 用户特别注意
- 使用 **PowerShell**（不要使用 CMD）
- 如果脚本执行被阻止，以管理员身份运行：
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## 🚀 快速开始（5 分钟配置）

### Step 1: 配置后端环境

```powershell
# 1. 进入后端目录
cd c:\Users\aazh0\Desktop\hkust-dorm-advisor_202602\backend

# 2. 创建 Python 虚拟环境
python -m venv venv

# 3. 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 4. 安装依赖（所有版本已锁定在 requirements.txt）
pip install -r requirements.txt

# 5. 配置环境变量
copy .env.example .env
```

**编辑 `backend\.env` 文件**，填入以下配置：

```env
# 阿里云百炼配置（必填）
BAILIAN_API_KEY=your_actual_api_key_here
BAILIAN_APP_ID=your_actual_app_id_here

# 开发模式（跳过认证，仅用于本地测试）
DEV_MODE=true

# Supabase 配置（暂时使用占位符）
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=placeholder-key

# JWT Secret（本地测试用）
JWT_SECRET=dev-secret-key-for-local-testing-only-change-in-production

# CORS 配置
FRONTEND_URL=http://localhost:3000

# 服务器配置
HOST=0.0.0.0
PORT=8000
```

---

### Step 2: 配置前端环境

```powershell
# 1. 进入前端目录
cd c:\Users\aazh0\Desktop\hkust-dorm-advisor_202602\frontend

# 2. 安装依赖
npm install

# 3. 配置环境变量
copy .env.local.example .env.local
```

**编辑 `frontend\.env.local` 文件**，填入以下配置：

```env
# Supabase 配置（暂时使用占位符）
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key

# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Step 3: 启动服务

#### 方式一：使用启动脚本（推荐）

**后端**（在 backend 目录下）：
```powershell
.\start.ps1
```

**前端**（新开一个 PowerShell，在 frontend 目录下）：
```powershell
.\start.ps1
```

#### 方式二：手动启动

**后端**：
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app/main.py
```

**前端**：
```powershell
cd frontend
npm run dev
```

---

### Step 4: 验证安装

访问以下链接确认服务正常：

- ✅ **后端 API 文档**: http://localhost:8000/api/docs
- ✅ **后端健康检查**: http://localhost:8000/api/health
- ✅ **前端界面**: http://localhost:3000

---

## 🔧 详细配置说明

### 虚拟环境工作原理

**为什么使用虚拟环境？**
- 隔离项目依赖，不影响系统 Python
- 确保团队成员使用相同版本的库
- 方便部署和迁移

**虚拟环境文件说明**：
```
backend/
├── venv/              # 虚拟环境（不提交到 Git）
├── requirements.txt   # 依赖版本锁定文件
└── .env              # 环境变量（不提交到 Git）
```

**团队协作**：
- `venv/` 文件夹在 `.gitignore` 中
- 每个开发者本地创建自己的 `venv/`
- `requirements.txt` 确保所有人安装相同版本

### Mac 组员配置方式

你的 Mac 组员使用以下命令：

```bash
# 后端配置
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 文件

# 前端配置
cd frontend
npm install
cp .env.local.example .env.local
# 编辑 .env.local 文件

# 启动
# 后端
cd backend
./start.sh

# 前端
cd frontend
./start.sh
```

---

## 🧪 开发模式说明

### 什么是 DEV_MODE？

当前配置使用 `DEV_MODE=true` 来跳过用户认证，方便测试核心功能：

**开发模式下**：
- ✅ 不需要登录即可访问聊天界面
- ✅ 使用测试用户 ID（`test-user-123`）
- ✅ 可以直接测试百炼 AI 对话功能
- ⚠️ **仅用于本地开发，生产环境必须关闭**

**生产模式下**（将来）：
- 需要 Supabase 认证
- JWT Token 验证
- 完整的用户权限控制

---

## 📦 依赖管理

### 后端依赖（Python）

查看已安装的包：
```powershell
pip list
```

添加新依赖：
```powershell
# 1. 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 2. 安装新包
pip install package-name

# 3. 更新 requirements.txt
pip freeze > requirements.txt
```

### 前端依赖（Node.js）

查看已安装的包：
```powershell
npm list --depth=0
```

添加新依赖：
```powershell
npm install package-name
```

---

## 🐛 常见问题排查

### Q1: PowerShell 脚本无法执行

**错误**：`因为在此系统上禁止运行脚本...`

**解决**：
```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q2: 端口被占用

**错误**：`Address already in use` 或 `端口 8000/3000 已被占用`

**解决**：
```powershell
# Windows: 查找占用端口的进程
netstat -ano | findstr :8000
# 终止进程（替换 PID）
taskkill /PID <进程ID> /F

# 或者修改端口
# 后端: 编辑 backend/.env 中的 PORT
# 前端: 编辑 frontend/package.json 的 dev 命令
```

### Q3: Python 版本不对

**错误**：`Python version 3.9+ required`

**解决**：
```powershell
# 检查版本
python --version

# 如果版本过旧，下载最新 Python
# https://www.python.org/downloads/
```

### Q4: npm install 失败

**错误**：网络问题或权限问题

**解决**：
```powershell
# 清理缓存
npm cache clean --force
rm -r node_modules
rm package-lock.json
npm install

# 或使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### Q5: 虚拟环境激活失败

**错误**：`venv\Scripts\Activate.ps1 cannot be loaded`

**解决**：
- 确保使用 PowerShell（不是 CMD）
- 执行策略设置（见 Q1）
- 重新创建虚拟环境：
  ```powershell
  rm -r venv
  python -m venv venv
  ```

### Q6: 百炼 API 调用失败

**错误**：`API Request failed: 401` 或 `Invalid API Key`

**解决**：
1. 检查 `backend\.env` 中的 `BAILIAN_API_KEY` 是否正确
2. 确认 API Key 没有过期
3. 查看后端日志获取详细错误信息

---

## 🎯 下一步

配置完成后，你可以：

1. **测试百炼 AI**
   - 访问 http://localhost:8000/api/docs
   - 尝试调用聊天接口

2. **测试前端界面**
   - 访问 http://localhost:3000
   - 直接进入聊天页面测试对话

3. **查看测试指南**
   - 阅读 [`TESTING.md`](TESTING.md) 了解详细测试流程

4. **配置 Supabase**
   - 将来需要时，参考 [`docs/DATABASE.md`](docs/DATABASE.md)
   - 更新环境变量中的 Supabase 配置

---

## 📚 相关文档

- [README.md](README.md) - 项目总览
- [TESTING.md](TESTING.md) - 测试指南
- [docs/API.md](docs/API.md) - API 接口文档
- [docs/QUICKSTART.md](docs/QUICKSTART.md) - 快速启动
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - 部署指南

---

**配置完成！开始开发吧！🎉**
