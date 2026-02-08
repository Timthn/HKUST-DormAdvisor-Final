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

### POST /api/chat/

发送聊天消息并获取 AI 回复。

**Request Body**:
```json
{
  "message": "Hall I 有海景吗？"
}
```

**Response**:
```json
{
  "answer": "是的，Hall I 高层房间可以看到部分海景...",
  "rag_source": null,
  "timestamp": "2026-02-09T12:00:00Z"
}
```

**状态码**:
- `200`: 成功
- `401`: 未授权（Token 无效）
- `500`: 服务器错误

---

### GET /api/chat/history

获取用户的聊天历史记录。

**Query Parameters**:
- `limit` (可选): 返回的消息数量，默认 50

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
  "advisor_comment": "Based on your budget of HK$4,000 and preference for quiet environment, I recommend the following halls...",
  "recommendations": [
    {
      "name": "Hall IV",
      "tags": ["Top Pick", "Renovated", "Balanced"],
      "score": 95,
      "reason": "Perfect match for your budget with modern facilities"
    },
    {
      "name": "Hall V",
      "tags": ["Quiet", "Single Room", "Private"],
      "score": 90,
      "reason": "Ideal for students seeking a peaceful study environment"
    },
    {
      "name": "Hall II",
      "tags": ["Sea View", "Value"],
      "score": 85,
      "reason": "Good value with beautiful ocean views"
    }
  ],
  "timestamp": "2026-02-09T12:00:00Z"
}
```

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
  "id": "uuid-string",
  "identity": "Undergraduate",
  "budget_range": "HK$ 3000 - 5000",
  "preferences": {
    "room_types": ["Single Room", "Double Room"],
    "priorities": ["Quiet", "Near Gym"],
    "additional_info": "I prefer a quiet environment for studying"
  },
  "updated_at": "2026-02-09T12:00:00Z"
}
```

**状态码**:
- `200`: 成功
- `401`: 未授权
- `404`: 画像不存在

---

### POST /api/profile/

创建或更新用户画像（完整更新）。

**Request Body**:
```json
{
  "identity": "Undergraduate",
  "budget_range": "HK$ 3000 - 5000",
  "preferences": {
    "room_types": ["Single Room"],
    "priorities": ["Quiet", "Near Library"],
    "additional_info": "I need a quiet place to focus on my studies"
  }
}
```

**Response**:
```json
{
  "id": "uuid-string",
  "identity": "Undergraduate",
  "budget_range": "HK$ 3000 - 5000",
  "preferences": {
    "room_types": ["Single Room"],
    "priorities": ["Quiet", "Near Library"],
    "additional_info": "I need a quiet place to focus on my studies"
  },
  "updated_at": "2026-02-09T12:05:00Z"
}
```

**状态码**:
- `200`: 成功
- `401`: 未授权
- `500`: 服务器错误

---

### PATCH /api/profile/

部分更新用户画像（只更新提供的字段）。

**Request Body** (所有字段可选):
```json
{
  "budget_range": "HK$ 5000 - 8000",
  "preferences": {
    "priorities": ["Quiet", "Near Gym", "Sea View"]
  }
}
```

**Response**: 同 POST /api/profile/

**状态码**:
- `200`: 成功
- `401`: 未授权
- `404`: 画像不存在
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
import { api } from '@/lib/api'

// 发送聊天消息
const response = await api.sendChatMessage('Hall I 有海景吗？')
console.log(response.answer)

// 生成推荐
const recommendations = await api.generateRecommendations()
console.log(recommendations.recommendations)

// 更新用户画像
await api.updateProfile({
  budget: 'HK$ 5000 - 8000',
  priorities: ['Quiet', 'Sea View']
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
