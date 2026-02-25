#!/bin/bash

# 获取脚本所在目录的绝对路径
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== HKUST Dorm Advisor Launcher ===${NC}"

# 检查环境
echo -e "${BLUE}[INFO] Checking environment...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python3 is not installed.${NC}"
    exit 1
fi
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed.${NC}"
    exit 1
fi

# 确保子脚本有执行权限
chmod +x "$BACKEND_DIR/start.sh"
chmod +x "$FRONTEND_DIR/start.sh"

# 定义清理函数，确保退出时杀死子进程
cleanup() {
    echo -e "\n${RED}[INFO] Stopping all services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# 捕获 SIGINT (Ctrl+C) 和 SIGTERM
trap cleanup SIGINT SIGTERM

# 启动后端
echo -e "${GREEN}[BACKEND] Starting Backend Server...${NC}"
cd "$BACKEND_DIR"
./start.sh &
BACKEND_PID=$!

# 等待几秒钟让后端先初始化（可选）
sleep 2

# 启动前端
echo -e "${GREEN}[FRONTEND] Starting Frontend Server...${NC}"
cd "$FRONTEND_DIR"
./start.sh &
FRONTEND_PID=$!

# 等待两个进程结束
wait $BACKEND_PID $FRONTEND_PID
