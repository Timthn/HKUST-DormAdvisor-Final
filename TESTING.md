# 测试指南

本文档提供详细的测试步骤和用例，帮助你验证项目功能是否正常运行。

## 📋 测试准备

### 前置条件
- ✅ 后端已配置并启动（`backend\start.ps1`）
- ✅ 前端已配置并启动（`frontend\start.ps1`）
- ✅ 百炼 API Key 已配置在 `backend\.env`

### 测试环境
- 后端: http://localhost:8000
- 前端: http://localhost:3000
- API 文档: http://localhost:8000/api/docs

---

## 🧪 测试流程

### Test 1: 后端健康检查

**目的**: 验证后端服务正常启动

**步骤**:
1. 打开浏览器访问: http://localhost:8000
2. 应该看到 JSON 响应:
   ```json
   {
     "status": "healthy",
     "service": "HKUST Dorm Advisor API",
     "version": "2.0.0"
   }
   ```

3. 访问: http://localhost:8000/api/health
4. 应该看到:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "ai_service": "ready"
   }
   ```

**预期结果**: ✅ 两个端点都返回正常状态

---

### Test 2: Swagger API 文档

**目的**: 验证 API 文档可访问

**步骤**:
1. 访问: http://localhost:8000/api/docs
2. 应该看到 Swagger UI 界面
3. 展开任意 API 端点查看文档

**预期结果**: ✅ Swagger UI 正常显示，可以看到所有 API 端点

---

### Test 3: 开发模式聊天测试（无认证）

**目的**: 在开发模式下测试聊天功能

**前置配置**:
确保以下环境变量已设置：
- `backend\.env`: `DEV_MODE=true`
- `frontend\.env.local`: `NEXT_PUBLIC_DEV_MODE=true`

**步骤**:
1. 访问前端: http://localhost:3000
2. 点击任意按钮进入主界面
3. 直接访问聊天页面: http://localhost:3000/chat
4. 应该看到聊天界面（无需登录）
5. 在输入框输入测试消息: "介绍一下 Hall I"
6. 点击发送或按 Enter

**预期结果**: 
- ✅ 无需登录即可访问聊天界面
- ✅ 消息发送成功
- ✅ 收到 AI 回复（来自百炼 API）
- ✅ 控制台显示 "DEV_MODE: Using test user"

---

### Test 4: 百炼 AI 对话测试

**目的**: 验证百炼 API 集成正常

**测试用例**:

#### 4.1 基础问答
**输入**: "HKUST 有哪些宿舍？"
**预期**: AI 列出 Hall I-VI

#### 4.2 详细查询
**输入**: "Hall IV 的特点是什么？"
**预期**: AI 介绍 Hall IV 的设施和特色

#### 4.3 推荐请求
**输入**: "我预算 4000，想要安静的环境，推荐哪个宿舍？"
**预期**: AI 根据需求推荐合适的宿舍

#### 4.4 对比查询
**输入**: "Hall I 和 Hall V 有什么区别？"
**预期**: AI 对比两个宿舍的特点

---

### Test 5: API 端点测试（使用 Swagger）

**目的**: 直接测试后端 API

**步骤**:
1. 访问: http://localhost:8000/api/docs
2. 找到 `/api/chat/` 端点
3. 点击 "Try it out"
4. 在 Request body 输入:
   ```json
   {
     "message": "介绍一下 Hall I"
   }
   ```
5. 点击 "Execute"
6. 查看 Response

**预期结果**:
```json
{
  "answer": "Hall I 是 HKUST 最具社交氛围的宿舍...",
  "rag_source": null,
  "timestamp": "2026-02-09T..."
}
```

**注意**: 在开发模式下（DEV_MODE=true），无需提供 Authorization header

---

### Test 6: 前端界面测试

**目的**: 验证前端所有页面正常

#### 6.1 主页
- 访问: http://localhost:3000
- ✅ 看到 LandingPage 欢迎页面
- ✅ 有登录和访客按钮

#### 6.2 登录页（可跳过）
- 访问: http://localhost:3000/login
- ✅ 看到登录表单
- ⚠️ 暂时无法登录（Supabase 未配置）

#### 6.3 设置页
- 访问: http://localhost:3000/setup
- ✅ 看到偏好设置表单
- ✅ 可以选择身份、预算、房型

#### 6.4 聊天页（开发模式）
- 访问: http://localhost:3000/chat
- ✅ 无需登录直接访问
- ✅ 看到聊天界面和推荐面板

---

### Test 7: 错误处理测试

**目的**: 验证错误情况的处理

#### 7.1 后端未启动
**步骤**:
1. 停止后端服务（Ctrl+C）
2. 在前端聊天界面发送消息

**预期结果**: 
- ❌ 前端显示错误提示
- 控制台显示连接错误

#### 7.2 无效的 API Key
**步骤**:
1. 编辑 `backend\.env`，将 `BAILIAN_API_KEY` 改为无效值
2. 重启后端
3. 发送聊天消息

**预期结果**:
- ❌ 返回 API 错误信息
- 后端日志显示百炼 API 错误

#### 7.3 空消息
**步骤**:
1. 在聊天输入框不输入内容
2. 点击发送

**预期结果**:
- ✅ 消息不发送（输入框验证）

---

## 🔍 测试检查清单

### 后端测试 ✅

- [ ] 健康检查端点正常 (`/` 和 `/api/health`)
- [ ] Swagger UI 可访问 (`/api/docs`)
- [ ] 开发模式可跳过认证（DEV_MODE=true）
- [ ] 聊天 API 返回正确响应
- [ ] 百炼 AI 集成正常
- [ ] CORS 配置正确（前端可访问）
- [ ] 错误处理正常

### 前端测试 ✅

- [ ] 主页正常显示
- [ ] 聊天界面可访问（开发模式）
- [ ] 消息发送和接收正常
- [ ] UI 响应流畅
- [ ] 开发模式提示显示
- [ ] 浏览器控制台无错误

---

## 🐛 常见测试问题

### 问题 1: 后端返回 401 Unauthorized

**原因**: 未开启开发模式
**解决**: 
```env
# backend/.env
DEV_MODE=true
```
重启后端服务

### 问题 2: 前端无法访问聊天页面

**原因**: 前端开发模式未开启
**解决**:
```env
# frontend/.env.local
NEXT_PUBLIC_DEV_MODE=true
```
重启前端服务

### 问题 3: 百炼 API 返回错误

**可能原因**:
1. API Key 无效
2. App ID 错误
3. 配额用完
4. 网络问题

**排查步骤**:
1. 检查 `backend\.env` 中的配置
2. 查看后端控制台日志
3. 访问百炼控制台确认配额

### 问题 4: 前端连接后端失败

**原因**: 后端未启动或端口错误
**解决**:
1. 确认后端正在运行
2. 检查 `frontend\.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

---

## 📊 性能测试（可选）

### 响应时间测试

使用浏览器开发者工具 Network 面板：
1. 打开 DevTools (F12)
2. 切换到 Network 标签
3. 发送聊天消息
4. 查看 API 请求的响应时间

**预期**:
- API 响应时间: < 3 秒（取决于百炼 API）
- 页面加载时间: < 2 秒

---

## 📝 测试报告模板

完成测试后，填写以下报告：

```
测试日期: ________
测试人员: ________

后端测试:
✅ 健康检查通过
✅ API 文档可访问
✅ 聊天功能正常
__ 其他: ________

前端测试:
✅ 界面显示正常
✅ 消息收发正常
__ 其他: ________

发现的问题:
1. ________
2. ________

备注: ________
```

---

## 🚀 下一步

测试通过后，你可以：

1. **配置 Supabase**
   - 创建 Supabase 项目
   - 运行数据库脚本
   - 关闭开发模式测试完整功能

2. **添加新功能**
   - 参考 API 文档添加新端点
   - 扩展前端界面

3. **准备部署**
   - 参考 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
   - 配置生产环境变量

---

**测试愉快！🎉**
