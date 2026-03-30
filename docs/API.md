# API 接口文档

本文档详细说明 HKUST Dorm Advisor 后端 API 的所有接口。

**Base URL**: `http://localhost:8000` (开发环境)

**认证**: 所有受保护的 API 都需要在 Header 中携带 JWT Token：

```
Authorization: Bearer <your_jwt_token>
```

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
- **多轮对话**：后端从 `chat_logs` 读取该用户最近 10 条消息（按 `created_at`、`id` 排序），与当前轮的 context（用户身份/预算/偏好 + 用户问题）一起组成 `messages` 发送给百炼，因此“再说多一点”等追问会带上文。
- 用户消息在流式传输**开始前**插入 `chat_logs`
- AI 完整回复在流式传输**结束后**经过去除脚注引用（如 `[^0]`）再插入 `chat_logs`
- 后端自动处理 `memory_id` 懒初始化（首次对话时调用 Bailian CreateMemory API）

**状态码**:
- `200`: 成功（流式响应）
- `401`: 未授权（Token 无效）
- `500`: 服务器错误

---

### GET /api/chat/history

获取用户的聊天历史记录。**取该用户时间上最新的 `limit` 条**（默认 50），再按 `created_at`、`id` 升序返回，保证同一轮 user/assistant 顺序正确；刷新页面后展示的是最近对话而非最早一批。

**Query Parameters**:
- `limit` (可选): 返回的消息条数上限，默认 50（最新 N 条）

**Response**:
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
- `404`: 用户画像不存在
- `500`: 服务器错误

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

所有错误响应都遵循以下格式：

```json
{
  "detail": "Error message here",
  "error_code": "OPTIONAL_ERROR_CODE"
}
```

### 常见错误码

- `401 Unauthorized`: Token 无效或过期
- `404 Not Found`: 资源不存在
- `422 Validation Error`: 请求参数验证失败
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

- **每用户**: 100 请求/分钟
- **百炼 API**: 根据阿里云配额限制

---

## 版本历史

- **v2.0.0** (2026-02-09): 前后端分离架构，完整 RESTful API
- **v1.0.0** (2025-11-30): 原型版本（单体应用）
