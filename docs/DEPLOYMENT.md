# 部署指南

本文档详细说明如何将 HKUST Dorm Advisor 部署到生产环境。

---

## 部署架构

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   Vercel    │──────→│   Render    │──────→│   Bailian    │
│  (Frontend) │       │  (Backend)  │       │   (AI API)   │
└─────────────┘       └─────────────┘       └──────────────┘
       │                     │
       └──────────┬──────────┘
                  ↓
          ┌──────────────┐
          │   Supabase   │
          │  (Database)  │
          └──────────────┘
```

---

## 前置准备

### 1. 账号注册

- [Vercel](https://vercel.com) - 前端托管
- [Render](https://render.com) 或 [Railway](https://railway.app) - 后端托管
- [Supabase](https://supabase.com) - 数据库和认证
- [阿里云](https://www.aliyun.com) - 百炼 API

### 2. 准备配置信息

整理以下信息备用：
- Supabase URL 和 Keys
- 百炼 API Key 和 App ID
- GitHub 仓库地址
- 自定义域名（可选）

---

## 第一步：部署数据库（Supabase）

### 1. 创建项目

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `hkust-dorm-advisor`
   - Database Password: 设置强密码并保存
   - Region: 选择离目标用户最近的区域（如 `Southeast Asia (Singapore)`）

### 2. 初始化数据库

1. 进入项目后，点击左侧 "SQL Editor"
2. 复制 [docs/DATABASE.md](DATABASE.md) 中的初始化脚本
3. 粘贴并点击 "Run" 执行

### 3. 获取配置信息

1. 点击左侧 "Settings" → "API"
2. 复制以下信息：
   - `Project URL` (用作 SUPABASE_URL)
   - `anon public` key (用作 SUPABASE_ANON_KEY)
   - `service_role` key (用作 SUPABASE_SERVICE_KEY，仅后端使用)

---

## 第二步：部署后端（Render）

### 方案 A: 使用 Render

#### 1. 连接 GitHub

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 "New +" → "Web Service"
3. 选择 "Connect a repository"
4. 授权并选择你的 GitHub 仓库

#### 2. 配置服务

填写以下信息：

- **Name**: `hkust-dorm-advisor-backend`
- **Region**: 选择离 Supabase 同一区域
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### 3. 设置环境变量

点击 "Environment" 添加以下变量（与 `backend/.env.example` 一致；**生产环境务必将 `DEV_MODE` 设为 `false`**）：

| 变量 | 说明 |
|------|------|
| `BAILIAN_API_KEY` | 阿里云百炼 API Key |
| `BAILIAN_APP_ID_CHAT` | 对话 Agent 应用 ID |
| `BAILIAN_APP_ID_RECOMMEND` | 推荐 Agent 应用 ID |
| `DEEPSEEK_API_KEY` | Extractor 模块（隐性偏好）使用的 DeepSeek API Key |
| `DEV_MODE` | 生产必须 `false`（为 `true` 时后端不连接 Supabase，仅适合本地无库联调） |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_KEY` | 后端使用 Supabase 客户端时读取此变量；生产部署建议使用 **service_role** key（服务端写 `chat_logs` / `profiles`）。勿将 service role 暴露给浏览器；`.env.example` 中的 `SUPABASE_SERVICE_KEY` 为预留别名，当前 Python 代码仅以 `SUPABASE_KEY` 创建客户端 |
| `JWT_SECRET` | 须与 Supabase Dashboard → Settings → API → **JWT Secret** 完全一致（HS256 校验用） |
| `JWT_ALGORITHM` | 可选，默认 `HS256`；若使用 JWKS 校验 RS256/ES256，仍需配置 `SUPABASE_URL` |
| `FRONTEND_URL` | 前端线上地址，用于 CORS（须与 Vercel 实际域名一致，含 `https://`） |
| `HOST` / `PORT` | 可选；Render 通常由平台注入 `PORT`，Start Command 已使用 `$PORT` |

示例（值请替换）：

```
DEV_MODE=false
BAILIAN_API_KEY=your_bailian_api_key
BAILIAN_APP_ID_CHAT=your_chat_app_id
BAILIAN_APP_ID_RECOMMEND=your_recommend_app_id
DEEPSEEK_API_KEY=your_deepseek_api_key
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=your_supabase_jwt_secret_same_as_dashboard
FRONTEND_URL=https://your-vercel-app.vercel.app
```

#### 4. 部署

点击 "Create Web Service"，Render 会自动开始构建和部署。

部署完成后，复制服务 URL（如 `https://hkust-dorm-advisor-backend.onrender.com`）。

---

### 方案 B: 使用 Railway

#### 1. 创建项目

1. 登录 [Railway Dashboard](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的仓库

#### 2. 配置服务

1. Railway 会自动检测 Python 项目
2. 点击项目 → "Settings"
3. 设置 Root Directory: `backend`

#### 3. 设置环境变量

点击 "Variables" 添加上表与 Render **相同**的环境变量（含双百炼 App ID、`DEEPSEEK_API_KEY`、`DEV_MODE=false` 等）。

#### 4. 部署

Railway 自动部署。复制生成的服务 URL。

---

## 第三步：部署前端（Vercel）

### 1. 导入项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

### 2. 配置项目

填写以下信息：

- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. 设置环境变量

点击 "Environment Variables" 添加：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_DEV_MODE=false
```

`NEXT_PUBLIC_DEV_MODE` 生产环境应为 `false`，否则前端可能跳过登录逻辑；与后端 `DEV_MODE` 配合使用。

### 4. 部署

点击 "Deploy"，Vercel 会自动构建和部署。

部署完成后会得到一个 URL（如 `https://hkust-dorm-advisor.vercel.app`）。

### 5. 更新后端 CORS

回到 Render/Railway，更新后端的 `FRONTEND_URL` 环境变量为 Vercel 的实际 URL。

---

## 第四步：配置自定义域名（可选）

### 前端域名（Vercel）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名（如 `dorm.hkust.edu.hk`）
3. 按照提示在域名提供商处添加 DNS 记录

### 后端域名（Render）

1. 在 Render 服务设置中点击 "Custom Domain"
2. 添加你的域名（如 `api.dorm.hkust.edu.hk`）
3. 按照提示配置 DNS

---

## 第五步：验证部署

### 1. 检查后端

访问 `https://your-backend-url/api/docs`，应该能看到 Swagger UI。

测试健康检查：
```bash
curl https://your-backend-url/api/health
```

应返回：
```json
{
  "status": "ok",
  "database": "connected",
  "ai_service": "ready"
}
```

### 2. 检查前端

访问 `https://your-frontend-url`，应该能看到欢迎页面。

### 3. 端到端测试

1. 注册新账号
2. 填写偏好设置
3. 发送聊天消息
4. 查看推荐结果

---

## 持续部署（CI/CD）

### 自动部署设置

Vercel 和 Render 都支持自动部署：

1. **推送到 main 分支**：自动触发生产环境部署
2. **推送到其他分支**：Vercel 自动创建预览部署
3. **Pull Request**：自动创建预览环境

### 部署流程

```
开发者提交代码 → GitHub
      ↓
   触发 Webhook
      ↓
┌─────────────────┐
│ Vercel/Render   │
│ 自动构建和部署   │
└─────────────────┘
      ↓
   部署成功通知
```

---

## 监控和日志

### Vercel 前端监控

1. 在项目 Dashboard 查看：
   - 部署历史
   - 错误日志
   - 访问分析

### Render/Railway 后端监控

1. 在服务 Dashboard 查看：
   - CPU 和内存使用
   - 请求日志
   - 错误追踪

### Supabase 数据库监控

1. 在项目 Dashboard 查看：
   - 数据库性能
   - API 使用情况
   - 慢查询分析

---

## 性能优化

### 前端优化

1. **启用 Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **图片优化**：使用 Next.js Image 组件

3. **代码分割**：Next.js 自动处理

### 后端优化

1. **启用 Redis 缓存**（可选）
   ```python
   # 缓存用户画像和聊天历史
   ```

2. **数据库连接池**：Supabase 自动管理

3. **API 限流**：添加 FastAPI 限流中间件

---

## 备份策略

### 数据库备份

Supabase 提供：
- **自动备份**：每日备份（Pro 计划）
- **手动备份**：通过 SQL Editor 导出

### 代码备份

- GitHub 作为主要代码仓库
- 定期创建 Git Tags 标记版本

---

## 回滚策略

### 前端回滚

在 Vercel Dashboard:
1. 进入 "Deployments"
2. 找到上一个稳定版本
3. 点击 "Promote to Production"

### 后端回滚

在 Render/Railway:
1. 回退 Git 分支到稳定版本
2. 或在 Dashboard 选择之前的部署版本

---

## 安全检查清单

- [ ] 所有环境变量已设置（含双百炼 App、`DEEPSEEK_API_KEY`、生产 `DEV_MODE=false`）
- [ ] `JWT_SECRET` 与 Supabase JWT Secret 一致；service role 仅在后端环境使用
- [ ] Supabase RLS 策略已启用
- [ ] CORS 仅允许前端域名（`FRONTEND_URL`）
- [ ] 如需 API 限流，在网关或托管平台侧配置（应用内未内置）
- [ ] HTTPS 已启用
- [ ] 敏感信息不在代码中

---

## 成本估算

### 免费套餐

- **Vercel**: 免费（Hobby 计划）
  - 100 GB 带宽/月
  - 无限部署
  
- **Render**: 免费（Free 计划）
  - 750 小时/月
  - 自动休眠（15 分钟无活动）
  
- **Supabase**: 免费
  - 500 MB 数据库
  - 50,000 月活用户
  
- **百炼**: 按量付费
  - 具体查看阿里云定价

### 生产环境推荐

- **Vercel Pro**: $20/月
- **Render Standard**: $7/月
- **Supabase Pro**: $25/月
- **总计**: ~$52/月

---

## 故障排除

### 部署失败

1. **检查构建日志**：查看具体错误信息
2. **验证依赖版本**：确保 requirements.txt 和 package.json 正确
3. **环境变量**：确认所有必需变量已设置

### API 连接失败

1. **CORS 错误**：检查后端 FRONTEND_URL 配置
2. **401 错误**：验证 JWT Token 配置
3. **500 错误**：查看后端日志

### 数据库连接失败

1. **检查 Supabase 状态**：访问 status.supabase.com
2. **验证连接字符串**：确保 URL 和 Key 正确
3. **RLS 策略**：确认策略已正确设置

---

## 联系支持

- **Vercel**: https://vercel.com/support
- **Render**: https://render.com/docs
- **Supabase**: https://supabase.com/support

---
