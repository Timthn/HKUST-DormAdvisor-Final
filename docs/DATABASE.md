# 数据库设计文档

本文档详细说明 HKUST Dorm Advisor 的数据库设计，基于 Supabase (PostgreSQL)。

---

## 数据库架构

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth 内置表)
│  - id (UUID)    │
│  - email        │
│  - ...          │
└────────┬────────┘
         │
         │ 1:1
         ↓
┌─────────────────┐         1:N         ┌─────────────────┐
│    profiles     │──────────────────────→│   chat_logs     │
│  - id (FK)      │                       │  - id           │
│  - identity     │                       │  - user_id (FK) │
│  - budget_range │                       │  - role         │
│  - preferences  │                       │  - content      │
│  - updated_at   │                       │  - created_at   │
└─────────────────┘                       └─────────────────┘
```

---

## 表结构详解

### 1. profiles 表（用户画像）

存储用户的偏好设置和身份信息。

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  identity TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  preferences JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以加快查询
CREATE INDEX idx_profiles_identity ON profiles(identity);
CREATE INDEX idx_profiles_budget ON profiles(budget_range);
```

#### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | UUID | PRIMARY KEY, FK | 关联 auth.users 的 id |
| `identity` | TEXT | NOT NULL | 学生身份：Undergraduate/Postgraduate/Exchange Student |
| `budget_range` | TEXT | NOT NULL | 预算范围：HK$ 2000 - 3000 / HK$ 3000 - 5000 / etc. |
| `preferences` | JSONB | DEFAULT '{}' | JSON 格式的偏好设置 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 最后更新时间 |

#### preferences JSONB 结构

```json
{
  "room_types": ["Single Room", "Double Room"],
  "priorities": ["Quiet", "Near Gym", "Sea View"],
  "additional_info": "I prefer a quiet environment for studying"
}
```

#### 示例数据

```sql
INSERT INTO profiles (id, identity, budget_range, preferences) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Undergraduate',
  'HK$ 3000 - 5000',
  '{
    "room_types": ["Single Room"],
    "priorities": ["Quiet", "Near Library"],
    "additional_info": "Focus on studying"
  }'::JSONB
);
```

---

### 2. chat_logs 表（聊天历史）

存储用户与 AI 的所有对话记录。

```sql
CREATE TABLE chat_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以加快查询
CREATE INDEX idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX idx_chat_logs_created_at ON chat_logs(created_at DESC);

-- 创建复合索引以优化"获取用户最近聊天"查询
CREATE INDEX idx_chat_logs_user_time ON chat_logs(user_id, created_at DESC);
```

#### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 自增主键 |
| `user_id` | UUID | NOT NULL, FK | 关联 profiles 表 |
| `role` | TEXT | CHECK | 'user' 或 'assistant' |
| `content` | TEXT | NOT NULL | 消息内容 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

#### 示例数据

```sql
INSERT INTO chat_logs (user_id, role, content) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'user', 'Hall I 有海景吗？'),
('550e8400-e29b-41d4-a716-446655440000', 'assistant', '是的，Hall I 高层房间可以看到部分海景...');
```

---

## Row Level Security (RLS) 策略

为了确保数据安全，必须启用 RLS 并设置策略。

### profiles 表 RLS

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能读取自己的画像
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 用户只能插入自己的画像
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 用户只能更新自己的画像
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 用户可以删除自己的画像（可选）
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);
```

### chat_logs 表 RLS

```sql
-- 启用 RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- 用户只能读取自己的聊天记录
CREATE POLICY "Users can view own chat logs"
  ON chat_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的聊天记录
CREATE POLICY "Users can insert own chat logs"
  ON chat_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 禁止用户更新和删除聊天记录（保持审计完整性）
-- 如果需要删除，只能由管理员通过服务角色执行
```

---

## 数据库触发器

### 自动更新 updated_at

```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到 profiles 表
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 数据迁移脚本

### 初始化脚本

将以下 SQL 复制到 Supabase SQL Editor 执行：

```sql
-- ============================================
-- HKUST Dorm Advisor 数据库初始化脚本
-- ============================================

-- 1. 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  identity TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  preferences JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_identity ON profiles(identity);
CREATE INDEX IF NOT EXISTS idx_profiles_budget ON profiles(budget_range);

-- 2. 创建 chat_logs 表
CREATE TABLE IF NOT EXISTS chat_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_time ON chat_logs(user_id, created_at DESC);

-- 3. 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Users can view own chat logs" ON chat_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat logs" ON chat_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 创建触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 初始化完成
-- ============================================
```

---

## 常用查询示例

### 查询用户的完整画像

```sql
SELECT 
  p.id,
  u.email,
  p.identity,
  p.budget_range,
  p.preferences,
  p.updated_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '550e8400-e29b-41d4-a716-446655440000';
```

### 查询用户最近的 10 条聊天记录

```sql
SELECT 
  role,
  content,
  created_at
FROM chat_logs
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC
LIMIT 10;
```

### 统计每个用户的消息数量

```sql
SELECT 
  user_id,
  COUNT(*) as message_count
FROM chat_logs
GROUP BY user_id
ORDER BY message_count DESC;
```

### 查询特定预算范围的用户数量

```sql
SELECT 
  budget_range,
  COUNT(*) as user_count
FROM profiles
GROUP BY budget_range
ORDER BY user_count DESC;
```

---

## 备份与恢复

### 备份数据

Supabase 自动提供每日备份（付费计划）。手动备份：

```bash
# 使用 pg_dump
pg_dump -h <supabase-host> -U postgres -d postgres > backup.sql
```

### 恢复数据

```bash
psql -h <supabase-host> -U postgres -d postgres < backup.sql
```

---

## 性能优化建议

1. **合理使用索引**: 已为常用查询字段创建索引
2. **JSONB 查询优化**: 对频繁查询的 JSONB 字段创建 GIN 索引
   ```sql
   CREATE INDEX idx_preferences_gin ON profiles USING GIN (preferences);
   ```
3. **定期清理旧数据**: 考虑归档超过 6 个月的聊天记录
4. **监控慢查询**: 使用 Supabase Dashboard 的性能监控

---

## 未来扩展

根据 FSD 规划，可能需要添加：

1. **sessions 表**: 存储多会话管理
2. **recommendations 表**: 持久化推荐结果
3. **hall_reviews 表**: 用户评价和反馈
4. **notifications 表**: 通知系统

---

## 联系方式

如有数据库相关问题，请联系项目负责人或提交 GitHub Issue。
