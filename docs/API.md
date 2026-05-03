# API 接口文档

本文档详细说明 HKUST Dorm Advisor 后端 API 的所有接口。

**Base URL**: `http://localhost:8000` (开发环境)

**认证**: 生产环境下，受保护接口需在 Header 携带 Supabase 签发的 JWT：

```
Authorization: Bearer <your_jwt_token>
```

后端校验逻辑见 `middleware/auth.py`：支持 **RS256 / ES256**（通过 `SUPABASE_URL` 拉取 JWKS）或 **HS256**（使用与 Supabase Dashboard 一致的 `JWT_SECRET`）。

**开发模式**：若后端设置 `DEV_MODE=true` 且请求未带 `Authorization`，将使用固定测试用户 `test-user-123`（此时可不传 Token；不适合生产）。

---

## 认证

### 获取 Token

通过 Supabase Auth SDK 登录后自动获取 JWT Token。前端无需手动调用此接口。

---

## 聊天 API

### POST /api/chat/stream

发送聊天消息，获取 AI 流式回复（Server-Sent Events）。

**Request Body**:
```json
{
  "message": "Hall I 有海景吗？"
}
```

**Response**: `Content-Type: text/event-stream`

流式 SSE 事件，每条事件格式如下：
```
data: {"text": "是的，"}

data: {"text": "Hall I 高层房间"}

data: {"text": "可以看到部分海景..."}

data: [DONE]
```

如发生错误，会收到：
```
data: {"error": "错误描述"}
```

**说明**:
- **多轮对话**：从 `chat_logs` 读取该用户最近最多 **10** 条消息参与拼接；当前用户消息的正文内还会附带 **压缩后的最近 3 轮**对话摘要（控制 token，见 `chat.py`）。
- 用户消息在流式传输**开始前**插入 `chat_logs`（可含 `history_sent`、`profile_sent`、`inferred_preferences_sent` 等审计字段，见 `DATABASE.md`）。
- AI 完整回复在流式传输**结束后**经过去除脚注引用（如 `[^0]`）再插入 `chat_logs`（助手行可含 `chunk_returned`）。
- **`memory_id`**：仅当 `profiles.memory_id` 已存在时传给百炼；后端**不会**在此处新建 memory。

**状态码**:
- `200`: 成功（流式响应）
- `401`: 未授权（Token 无效）
- `500`: 服务器错误

---

### POST /api/chat/

非流式聊天（与 `/stream` 使用相同的多轮历史与上下文拼装逻辑）。响应为 JSON，适用于不需要 SSE 的客户端。

**Request Body**: 同 `POST /api/chat/stream`
```json
{
  "message": "Hall I 有海景吗？"
}
```

**Response** (`application/json`):
```json
{
  "answer": "是的，Hall I 高层房间可以看到部分海景...",
  "timestamp": "2026-02-09T12:00:05.123456"
}
```

**状态码**: `200` / `401` / `500`（同流式接口语义）

---

### GET /api/chat/history

获取用户的聊天历史记录。**取该用户时间上最新的 `limit` 条**（默认 50），再按 `created_at`、`id` 升序返回，保证同一轮 user/assistant 顺序正确；刷新页面后展示的是最近对话而非最早一批。

**Query Parameters**:
- `limit` (可选): 返回的消息条数上限，默认 50（最新 N 条）

**Response**: 后端对 `chat_logs` 使用 `select('*')`，除下方示例外，还可能包含 `history_sent`、`profile_sent`、`inferred_preferences_sent`、`chunk_returned` 等列（见 `DATABASE.md`）。前端可只使用 `id`、`role`、`content`、`created_at`。

```json
{
  "messages": [
    {
      "id": 1,
      "user_id": "uuid-string",
      "role": "user",
      "content": "Hall I 有海景吗？",
      "created_at": "2026-02-09T12:00:00Z"
    },
    {
      "id": 2,
      "user_id": "uuid-string",
      "role": "assistant",
      "content": "是的，Hall I 高层房间...",
      "created_at": "2026-02-09T12:00:05Z"
    }
  ]
}
```

---

## 推荐 API

### POST /api/recommend/

生成个性化宿舍推荐。

**Request Body**: 无（后端自动从数据库读取用户画像）

**Response**:
```json
{
  "recommendations": [
    {
      "hall_id": "7",
      "name": "Chan Sui Kau & Chan Lam Moon Chun Hall (Hall 7)",
      "reason": "Hall 7 offers en-suite bathrooms shared by small groups and a pantry on each floor, matching your preference for convenience and privacy.",
      "image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall7_ext.jpg",
      "price_info": {
        "new_local": "Double: HK$19,460",
        "continuing_local": "Double: HK$19,460",
        "new_non_local": "Double: HK$25,168",
        "continuing_non_local": "Double: HK$24,464"
      },
      "facilities": ["En-suite Bathroom (Shared by 4–6)", "Laundry Room", "Pantry on each floor", "Common Rooms"],
      "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall7"
    },
    {
      "hall_id": "4",
      "name": "Cheng Yu Tung Hall (Hall 4)",
      "reason": "Hall 4 features sea view rooms and is close to the main academic buildings, ideal for students who prioritize location.",
      "image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall4_ext.jpg",
      "price_info": {
        "new_local": "Double: HK$19,460",
        "continuing_local": "Double: HK$19,460",
        "new_non_local": "Double: HK$25,168",
        "continuing_non_local": "Double: HK$24,464"
      },
      "facilities": ["Single / Double Rooms", "Laundry Room", "Common Room", "Sea View"],
      "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall4"
    },
    {
      "hall_id": "JCH",
      "name": "Jockey Hall Complex (JCH)",
      "reason": "JCH offers single rooms at a competitive price, suitable for students who value personal space on a budget.",
      "image_url": "https://shrl.hkust.edu.hk/sites/default/files/jhc_ext.jpg",
      "price_info": {
        "new_local": "Single: HK$19,460",
        "continuing_local": "Single: HK$19,460",
        "new_non_local": "Single: HK$25,168",
        "continuing_non_local": "Single: HK$24,464"
      },
      "facilities": ["Single Rooms", "Laundry Room", "Common Room"],
      "website_url": "https://shrl.hkust.edu.hk/residential-halls/jockey-hall-complex"
    }
  ],
  "timestamp": "2026-03-01T12:00:00Z"
}
```

> 推荐结果同时会持久化到 `profiles.last_recommendation`，下次加载时可直接读取。

**状态码**:
- `200`: 成功
- `401`: 未授权
- `500`: 服务器错误（推荐 Agent 输出无法解析、画像读取失败等均以错误详情返回）

> 说明：推荐接口当前实现未单独返回 `404`；画像或推荐流程失败时多为 `500`。

---

### GET /api/recommend/refresh

刷新推荐（与 POST 功能相同，更符合 RESTful 语义）。

**Response**: 同 POST /api/recommend/

---

## 用户画像 API

### GET /api/profile/

获取当前用户的画像数据。

**Response**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "form_preferences": {
    "identity": "Local Undergraduate",
    "gender": "Male",
    "budget_range": "HK$ 3000 - 5000",
    "room_types": ["Single Room"],
    "priorities": ["Quiet", "Near Library"],
    "additional_info": "I need a quiet place to focus on my studies"
  },
  "inferred_preferences": "The student appears to value silent study hours late at night and shows a strong preference for single-occupancy rooms based on repeated mentions of privacy.",
  "memory_id": "mem-abc123xyz",
  "last_recommendation": null,
  "updated_at": "2026-03-01T12:00:00Z"
}
```

**状态码**:
- `200`: 成功
- `401`: 未授权
- `404`: 画像不存在

---

### POST /api/profile/

更新用户的表单偏好（`form_preferences`）。**本端点只执行 UPDATE，不执行 INSERT**。Profile 行由 Supabase DB Trigger 在用户注册时自动创建。

**Request Body**:
```json
{
  "form_preferences": {
    "identity": "Local Undergraduate",
    "gender": "Male",
    "budget_range": "HK$ 3000 - 5000",
    "room_types": ["Single Room"],
    "priorities": ["Quiet", "Near Library"],
    "additional_info": "I need a quiet place to focus on my studies"
  }
}
```

**Response**: 同 `GET /api/profile/` 格式。

**状态码**:
- `200`: 成功
- `401`: 未授权
- `404`: Profile 不存在（DB Trigger 未执行，需检查 Supabase 配置）
- `500`: 服务器错误

---

## 健康检查 API

### GET /

根路径健康检查。

**Response**:
```json
{
  "status": "healthy",
  "service": "HKUST Dorm Advisor API",
  "version": "2.0.0"
}
```

---

### GET /api/health

详细健康检查。

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "ai_service": "ready"
}
```

---

## 错误响应格式

FastAPI 默认错误体一般为：

```json
{
  "detail": "Error message or validation detail"
}
```

校验失败（如请求体不符合 Schema）时，`detail` 可能为字段错误列表。

### 常见 HTTP 状态

- `401 Unauthorized`: Token 无效、过期或未提供（非 DEV_MODE）
- `404 Not Found`: 资源不存在（如 `GET /api/profile/` 无画像行）
- `422 Unprocessable Entity`: 请求参数 / Body 校验失败
- `500 Internal Server Error`: 服务器内部错误

---

## 前端集成示例

```typescript
// 发送聊天消息（SSE 流式）
const response = await fetch(`${API_URL}/api/chat/stream`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ message: 'Hall I 有海景吗？' })
})

const reader = response.body!.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n')
  buffer = lines.pop() ?? ''
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const payload = line.slice(6)
      if (payload === '[DONE]') return
      const { text } = JSON.parse(payload)
      // append text to UI
    }
  }
}

// 生成推荐（非流式）
const rec = await fetch(`${API_URL}/api/recommend/`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
const { recommendations } = await rec.json()

// 更新用户画像
await fetch(`${API_URL}/api/profile/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    form_preferences: {
      identity: 'Local Undergraduate',
      gender: 'Male',
      budget_range: 'HK$ 3000 - 5000',
      room_types: ['Single Room'],
      priorities: ['Quiet'],
      additional_info: ''
    }
  })
})
```

---

## 限流和配额

- **本仓库后端**：未内置按用户限流中间件；若需限制 QPS，请在 **反向代理 / API 网关**（或托管平台规则）上配置。
- **百炼 / DeepSeek**：按各云厂商账号配额与计费策略限制。

---

## 版本历史

- **v2.0.0** (2026-02-09): 前后端分离架构，完整 RESTful API
- **v1.0.0** (2025-11-30): 原型版本（单体应用）

文档修订说明：与当前 `main.py`、`chat.py`、`recommend.py`、`middleware/auth.py` 行为对齐（双百炼 App、`memory_id` 策略、`chat_logs` 扩展列、非流式 `POST /api/chat/` 等）。
