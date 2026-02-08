# HKUST Dorm Advisor - 快速启动指南

## 🚀 5 分钟快速启动（推荐）

### 使用统一启动脚本

```powershell
# Windows
cd hkust-dorm-advisor_202602
.\start-dev.ps1
```

```bash
# Mac/Linux
cd hkust-dorm-advisor_202602
chmod +x start-dev.sh
./start-dev.sh
```

脚本会自动检查环境并启动前后端服务。

---

## 📝 最小配置（仅测试百炼 AI）

如果是第一次运行，需要配置环境变量：

### 后端配置

```powershell
cd backend
copy .env.example .env
```

编辑 `backend\.env`：
```env
BAILIAN_API_KEY=your_api_key
BAILIAN_APP_ID=your_app_id
DEV_MODE=true
```

### 前端配置

```powershell
cd frontend
copy .env.local.example .env.local
```

编辑 `frontend\.env.local`：
```env
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Windows 启动脚本

### 后端启动 (backend\start.ps1)

```powershell
# 检查虚拟环境
if (!(Test-Path ".\venv")) {
    Write-Host "创建虚拟环境..." -ForegroundColor Yellow
    python -m venv venv
}

# 激活虚拟环境
Write-Host "激活虚拟环境..." -ForegroundColor Green
.\venv\Scripts\Activate.ps1

# 安装依赖
Write-Host "安装依赖..." -ForegroundColor Green
pip install -r requirements.txt

# 检查环境变量
if (!(Test-Path ".env")) {
    Write-Host "警告: .env 文件不存在，请先配置环境变量" -ForegroundColor Red
    Copy-Item .env.example .env
    Write-Host "已创建 .env 文件，请编辑后重新运行" -ForegroundColor Yellow
    exit
}

# 启动服务器
Write-Host "启动后端服务器..." -ForegroundColor Green
python app/main.py
```

### 前端启动 (frontend\start.ps1)

```powershell
# 检查依赖
if (!(Test-Path ".\node_modules")) {
    Write-Host "安装依赖..." -ForegroundColor Yellow
    npm install
}

# 检查环境变量
if (!(Test-Path ".env.local")) {
    Write-Host "警告: .env.local 文件不存在，请先配置环境变量" -ForegroundColor Red
    Copy-Item .env.local.example .env.local
    Write-Host "已创建 .env.local 文件，请编辑后重新运行" -ForegroundColor Yellow
    exit
}

# 启动开发服务器
Write-Host "启动前端开发服务器..." -ForegroundColor Green
npm run dev
```

---

## Mac/Linux 启动脚本

### 后端启动 (backend/start.sh)

```bash
#!/bin/bash

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "安装依赖..."
pip install -r requirements.txt

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "警告: .env 文件不存在，请先配置环境变量"
    cp .env.example .env
    echo "已创建 .env 文件，请编辑后重新运行"
    exit 1
fi

# 启动服务器
echo "启动后端服务器..."
python3 app/main.py
```

### 前端启动 (frontend/start.sh)

```bash
#!/bin/bash

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 检查环境变量
if [ ! -f ".env.local" ]; then
    echo "警告: .env.local 文件不存在，请先配置环境变量"
    cp .env.local.example .env.local
    echo "已创建 .env.local 文件，请编辑后重新运行"
    exit 1
fi

# 启动开发服务器
echo "启动前端开发服务器..."
npm run dev
```

---

## 使用方法

### Windows 用户

1. **启动后端**：
   ```powershell
   cd backend
   .\start.ps1
   ```

2. **启动前端**（新开终端）：
   ```powershell
   cd frontend
   .\start.ps1
   ```

### Mac/Linux 用户

1. **添加执行权限**：
   ```bash
   chmod +x backend/start.sh
   chmod +x frontend/start.sh
   ```

2. **启动后端**：
   ```bash
   cd backend
   ./start.sh
   ```

3. **启动前端**（新开终端）：
   ```bash
   cd frontend
   ./start.sh
   ```

---

## 一键启动（推荐）

### Windows (start.ps1)

在项目根目录创建：

```powershell
# 启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\start.ps1"

# 等待 2 秒
Start-Sleep -Seconds 2

# 启动前端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; .\start.ps1"

Write-Host "前后端启动中..." -ForegroundColor Green
Write-Host "后端: http://localhost:8000" -ForegroundColor Cyan
Write-Host "前端: http://localhost:3000" -ForegroundColor Cyan
```

### Mac/Linux (start.sh)

在项目根目录创建：

```bash
#!/bin/bash

# 打开新终端窗口启动后端
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && ./start.sh"'

# 等待 2 秒
sleep 2

# 打开新终端窗口启动前端
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/frontend && ./start.sh"'

echo "前后端启动中..."
echo "后端: http://localhost:8000"
echo "前端: http://localhost:3000"
```

---

## 停止服务

### Windows
按 `Ctrl + C` 停止服务器

### Mac/Linux
按 `Ctrl + C` 停止服务器

---

## 常见问题

### Q: PowerShell 脚本执行策略错误？

A: 以管理员身份运行 PowerShell，执行：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 端口被占用？

A: 更改端口配置：
- 后端: 编辑 `backend/.env` 中的 `PORT`
- 前端: 编辑 `frontend/package.json` 中的 dev 命令

### Q: 虚拟环境激活失败？

A: Windows 用户确保使用 PowerShell 而非 CMD

---

## 开发工具推荐

- **Windows**: Windows Terminal + PowerShell
- **Mac**: iTerm2 + zsh
- **VSCode 扩展**: 
  - Python
  - ESLint
  - Tailwind CSS IntelliSense
  - Thunder Client (API 测试)
