# HKUST Dorm Advisor - Frontend

Next.js 前端应用，为 HKUST 宿舍推荐系统提供用户界面。

## 技术栈

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Markdown**: react-markdown, remark-gfm（聊天消息渲染表格与格式）
- **Language**: TypeScript

## 项目结构

```
frontend/
├── app/                  # Next.js App Router
│   ├── page.tsx          # 主页（LandingPage）
│   ├── login/
│   │   └── page.tsx      # 登录页
│   ├── setup/
│   │   └── page.tsx      # 偏好设置页
│   ├── chat/
│   │   └── page.tsx      # 聊天主界面
│   ├── layout.tsx        # 根布局
│   └── globals.css       # 全局样式
├── components/           # React 组件
│   ├── LandingPage.tsx
│   ├── SetupForm.tsx
│   ├── ChatPanel.tsx
│   ├── RecommendationPanel.tsx
│   └── FacilitiesModal.tsx
├── lib/                  # 工具函数和配置
│   ├── supabase.ts       # Supabase 客户端
│   ├── api.ts            # API 调用封装
│   └── constants.ts      # 常量配置
├── types/
│   └── index.ts          # TypeScript 类型定义
├── package.json
├── next.config.js
└── tsconfig.json
```

## 快速开始

### 1. 最小配置（开发模式）

如果只想测试核心功能，无需完整配置：

```bash
cd frontend
npm install
npm run dev
```

**首次运行**需要配置 `.env.local` 文件：
```env
NEXT_PUBLIC_DEV_MODE=true  # 开启开发模式，跳过认证
NEXT_PUBLIC_API_URL=http://localhost:8000
```

应用将在 `http://localhost:3000` 启动。直接访问 http://localhost:3000/chat 即可测试（无需登录）。Windows 下也可使用 `start-dev.ps1`（若存在）启动。

### 2. 完整配置（生产环境）

**Windows:**
```powershell
cd frontend
npm install
```

**Mac/Linux:**
```bash
cd frontend
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入实际配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 页面路由

- `/` - 欢迎页面
- `/login` - 登录/注册页面
- `/setup` - 用户偏好设置
- `/chat` - 聊天和推荐主界面

## 组件说明

### LandingPage
欢迎页，提供登录和访客入口。

### SetupForm
收集用户偏好信息：
- 身份（本科生/研究生/交换生）
- 预算范围
- 房型偏好
- 优先考虑因素

### ChatPanel
聊天界面，用户与 AI 顾问对话。Bot 回复使用 react-markdown + remark-gfm 渲染，支持表格、粗体、列表等。Next.js 需在 `next.config.js` 中配置 `transpilePackages: ['react-markdown', 'remark-gfm']`。

### RecommendationPanel
右侧推荐面板：标题「Recommended Choices for You」、Refresh 按钮（重新拉推荐且保留表单、不清空列表）、宿舍卡片、可折叠偏好表单与「Update Recommendations」按钮。

### FacilitiesModal
展示具体宿舍的详细设施信息。

## API 集成

前端通过 `lib/api.ts` 与后端通信，所有 API 调用自动携带 Supabase JWT Token。

### 主要 API 调用

```typescript
import { api, streamChatMessage } from '@/lib/api'

// 获取用户画像（登录后判断是否跳 /chat 或 /setup）
const profile = await api.getProfile()

// 保存偏好
await api.saveProfile(formData)

// 生成推荐
const { recommendations } = await api.generateRecommendations()

// 聊天历史
const { messages } = await api.getChatHistory(50)

// 聊天消息为 SSE 流式，使用 streamChatMessage(message, onChunk, onDone, onError)
streamChatMessage(userMessage, onChunk, onDone, onError)
```

## 认证流程

1. 用户在首页 `/`（LandingPage）点击登录，在弹窗内输入邮箱密码
2. Supabase Auth 验证并返回 JWT Token，Token 由 Supabase SDK 管理
3. 前端调用 `api.getProfile()`；若已有 form 偏好则跳转 `/chat` 并载入历史与推荐，否则跳转 `/setup`
4. 所有 API 请求自动携带 Token，后端验证后返回数据

## 开发注意事项

### 跨平台兼容性
- 使用 npm 而非 pnpm/yarn（团队统一）
- 路径使用 `@/` 别名
- 避免使用平台特定的 Node.js API

### 样式规范
- 使用 Tailwind CSS 实用类
- 遵循 HKUST 品牌色（`hkust-blue`, `hkust-gold`）
- 响应式设计（支持移动端）

### 类型安全
- 所有组件使用 TypeScript
- 定义清晰的接口和类型
- 避免使用 `any`

## 部署

### Vercel 部署（推荐）

1. 连接 GitHub 仓库到 Vercel
2. Vercel 自动检测 Next.js 项目
3. 配置环境变量
4. 自动部署

### 环境变量配置
在 Vercel Dashboard 中设置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (生产环境后端 URL)

## 故障排除

### npm install 失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 构建错误
检查 TypeScript 类型错误：
```bash
npm run lint
```

### API 连接失败
- 确认后端服务已启动
- 检查 `NEXT_PUBLIC_API_URL` 配置
- 检查浏览器控制台 CORS 错误

## License

MIT
