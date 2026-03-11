# 数据库设计文档

本文档详细说明 HKUST Dorm Advisor 的数据库设计，基于 Supabase (PostgreSQL)。

---

## 数据库架构

```
┌─────────────────┐
│   auth.users    │  (Supabase Auth 内置表)
│  - id (UUID)    │
│  - email        │
└────────┬────────┘
         │ DB Trigger (on INSERT → auto-create profile)
         ↓
┌──────────────────────────┐         1:N         ┌─────────────────┐
│         profiles         │──────────────────────→│   chat_logs     │
│  - user_id (PK, FK)      │                       │  - id           │
│  - form_preferences      │                       │  - user_id (FK) │
│  - inferred_preferences  │                       │  - role         │
│  - memory_id             │                       │  - content      │
│  - last_recommendation   │                       │  - created_at   │
│  - updated_at            │                       └─────────────────┘
└──────────────────────────┘

┌──────────────────────────┐
│          halls           │  (静态数据，管理员维护)
│  - hall_id (PK)          │
│  - name                  │
│  - static_info (JSONB)   │
└──────────────────────────┘
```

---

## 表结构详解

### 1. profiles 表（用户画像）

存储用户的偏好设置、AI 推断的隐性偏好、Bailian 长期记忆 ID 和最近推荐结果。

```sql
CREATE TABLE profiles (
  user_id      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  form_preferences      JSONB       DEFAULT '{}'::JSONB,
  inferred_preferences  TEXT,
  memory_id             TEXT        UNIQUE,
  last_recommendation   JSONB,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_memory_id ON profiles(memory_id);
```

#### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `user_id` | UUID | PRIMARY KEY, FK | 关联 auth.users 的 id，由 DB Trigger 自动填入 |
| `form_preferences` | JSONB | DEFAULT '{}' | SetupForm 提交的用户偏好（结构见下） |
| `inferred_preferences` | TEXT | nullable | Extractor 模块分析对话后写入的隐性偏好描述 |
| `memory_id` | TEXT | UNIQUE, nullable | Bailian 长期记忆 ID，首次对话时懒初始化 |
| `last_recommendation` | JSONB | nullable | 最近一次推荐结果，由推荐服务写入 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 最后更新时间 |

#### form_preferences JSONB 结构

```json
{
  "identity": "Undergraduate",
  "gender": "Male",
  "budget_range": "HK$ 3000 - 5000",
  "room_types": ["Single Room"],
  "priorities": ["Quiet", "Near Library"],
  "additional_info": "I need a quiet place to focus on my studies"
}
```

#### last_recommendation JSONB 结构

推荐服务生成推荐后，将 LLM 输出的 `hall_id` + `reason` 与 `halls.static_info` 拼接后整体存入此字段。前端可直接读取，无需再查询 halls 表。最多 3 条。

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| `hall_id` | string | LLM 输出 | 宿舍 ID，如 `"1"`–`"9"` 或 `"JHC"` |
| `name` | string | halls.name | 宿舍全名 |
| `reason` | string | LLM 输出 | 针对用户偏好的个性化推荐理由 |
| `image_url` | string \| null | halls.static_info | 宿舍图片 URL |
| `price_info` | string \| null | halls.static_info（按身份选择 local / non_local 后拼接） | 费用信息 |
| `facilities` | string[] | halls.static_info | 设施列表 |
| `website_url` | string \| null | halls.static_info | 官方网页 |

```json
[
  {
    "hall_id": "7",
    "name": "Chan Sui Kau & Chan Lam Moon Chun Hall (Hall 7)",
    "reason": "Hall 7 offers en-suite bathrooms shared by small groups and a pantry on each floor, matching your preference for convenience and privacy.",
    "image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall7_ext.jpg",
    "price_info": "Single: HK$37,252 | Double: HK$25,020 (Per year, excl. air-conditioning fee)",
    "facilities": ["En-suite Bathroom (Shared by 4–6)", "Laundry Room", "Pantry on each floor", "Common Rooms"],
    "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall7"
  }
]
```

#### 示例数据

```sql
-- profiles 行由 DB Trigger 自动创建，无需手动 INSERT
-- 用户提交 SetupForm 后，后端调用 UPDATE：
UPDATE profiles
SET form_preferences = '{
  "identity": "Undergraduate",
  "gender": "Male",
  "budget_range": "HK$ 3000 - 5000",
  "room_types": ["Single Room"],
  "priorities": ["Quiet", "Near Library"],
  "additional_info": "Focus on studying"
}'::JSONB,
updated_at = NOW()
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
```

---

### 2. chat_logs 表（聊天历史）

存储用户与 AI 的所有对话记录。

```sql
CREATE TABLE chat_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
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

### 3. halls 表（宿舍静态信息）

存储 HKUST 各宿舍的静态信息，由管理员维护，共 12 条记录（Hall I–XII）。

```sql
CREATE TABLE halls (
  hall_id     TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  static_info JSONB   NOT NULL DEFAULT '{}'::JSONB
);
```

#### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `hall_id` | TEXT | PRIMARY KEY | 宿舍字符串标识，如 "1"–"9"、"JCH" |
| `name` | TEXT | NOT NULL | 宿舍名称，如 "Hall IV" |
| `static_info` | JSONB | NOT NULL | 宿舍详情（结构见下） |

#### static_info JSONB 结构

```json
{
  "image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall7_ext.jpg",
  "price_info": {
    "new_local": "Double: HK$19,460",
    "continuing_local": "Double: HK$19,460",
    "new_non_local": "Double: HK$25,168",
    "continuing_non_local": "Double: HK$24,464"
  },
  "available_room_types": ["Double"],
  "facilities": ["En-suite Bathroom (Shared by 4–6)", "Laundry Room", "Pantry on each floor", "Common Rooms"],
  "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall7"
}
```

#### static_info 字段详情

| 字段 | 类型 | 说明 |
|------|------|------|
| `image_url` | string | 宿舍外观图片 URL |
| `price_info` | object | 按身份和是否新生分开的年费；后端会整体透传给前端 |
| `price_info.new_local` | string | 新入学本地本科生年费 |
| `price_info.continuing_local` | string | 继续修读本地本科生年费 |
| `price_info.new_non_local` | string | 新入学非本地 / Exchange 学生年费 |
| `price_info.continuing_non_local` | string | 继续修读非本地 / Exchange 学生年费 |
| `available_room_types` | string[] | 可选房型列表，如 `["Double", "Triple"]` |
| `facilities` | string[] | 设施列表，每项为一条字符串 |
| `website_url` | string | 宿舍官方网页链接 |

#### 说明

- `halls` 表不启用 RLS（仅管理员写入，所有用户可读）
- 推荐服务在生成推荐后，根据 Bailian 返回的 `hall_id` 列表查询此表来补全宿舍信息
- `price_info` 为 JSONB 对象；后端 `recommendation_service.py` 如检测到包含 `new_local` / `continuing_local` / `new_non_local` / `continuing_non_local` 四个字段，会将整个对象直接透传给前端，由前端分别展示各类价格；如仍为旧结构（只有 `local` / `non_local`），则后端会保留旧逻辑按身份选取并返回字符串

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
  USING (auth.uid() = user_id);

-- ⚠️ 不设置 INSERT 策略 — profiles 行由 DB Trigger 自动创建
-- 用户只能更新自己的画像（后端使用 Service Role Key 执行 UPDATE）
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
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

### 用户注册时自动创建 Profile 行

当新用户在 Supabase Auth 注册后，自动在 `profiles` 表插入空记录。这是 POST `/api/profile/` 端点只做 UPDATE 不做 INSERT 的前提。

```sql
-- 触发器函数
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 绑定到 auth.users 的 INSERT 事件
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();
```

**⚠️ 重要**: 此触发器必须在 Supabase Dashboard → SQL Editor 中手动执行。后端代码不负责创建 profile 行。

---

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
-- HKUST Dorm Advisor 数据库初始化脚本 v2
-- 2026-03-01 更新：新 profiles 架构 + halls 表 + DB Trigger
-- ============================================

-- 1. 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  user_id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  form_preferences      JSONB       DEFAULT '{}'::JSONB,
  inferred_preferences  TEXT,
  memory_id             TEXT        UNIQUE,
  last_recommendation   JSONB,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_memory_id ON profiles(memory_id);

-- 2. 创建 chat_logs 表
CREATE TABLE IF NOT EXISTS chat_logs (
  id         BIGSERIAL    PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  role       TEXT         NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_time ON chat_logs(user_id, created_at DESC);

-- 3. 创建 halls 表
CREATE TABLE IF NOT EXISTS halls (
  hall_id     TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  static_info JSONB   NOT NULL DEFAULT '{}'::JSONB
);

-- 4. 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
-- halls 表不启用 RLS（公开可读）

-- 5. profiles RLS 策略（注意：无 INSERT 策略，由 Trigger 负责）
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- 6. chat_logs RLS 策略
CREATE POLICY "Users can view own chat logs"
  ON chat_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat logs"
  ON chat_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 用户注册时自动创建 profile 行
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- ============================================
-- 初始化完成 v2
-- ============================================
```

### halls 表种子数据

执行完上述初始化脚本后，在 Supabase SQL Editor 中运行以下 INSERT 以填充宿舍数据。⚠️ 标记 `-- VERIFY` 的价格需在 https://shrl.hkust.edu.hk 确认后填入实际数值。Hall 7 已使用验证数据。

```sql
-- ============================================
-- halls 表种子数据
-- HKUST Student Halls (Hall 1–9 + JHC)
-- ⚠️ Prices marked VERIFY must be confirmed at https://shrl.hkust.edu.hk
-- ============================================

INSERT INTO halls (hall_id, name, static_info) VALUES

('1', 'Lee Shau Kee Hall (Hall 1)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall1_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "En-suite Bathroom", "Laundry Room", "Common Room", "Study Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall1"}'::jsonb),
('2', 'Lee Shau Kee Hall (Hall 2)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall2_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "En-suite Bathroom", "Laundry Room", "Common Room", "Study Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall2"}'::jsonb),
('3', 'S.H. Ho Hall (Hall 3)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall3_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "Laundry Room", "Common Room", "Study Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall3"}'::jsonb),
('4', 'Cheng Yu Tung Hall (Hall 4)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall4_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "Laundry Room", "Common Room", "Sea View"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall4"}'::jsonb),
('5', 'Chinachem Group Hall (Hall 5)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall5_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "Laundry Room", "Common Room", "Study Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall5"}'::jsonb),
('6', 'Shaw Hall (Hall 6)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall6_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "Laundry Room", "Common Room", "Study Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall6"}'::jsonb),
('7', 'Chan Sui Kau & Chan Lam Moon Chun Hall (Hall 7)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall7_ext.jpg", "price_info": {"local": "Single: HK$37,252 | Double: HK$25,020", "non_local": "Single: HK$43,008 | Double: HK$29,448"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["En-suite Bathroom (Shared by 4–6)", "Laundry Room", "Pantry on each floor", "Common Rooms"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall7"}'::jsonb),
('8', 'Sino Group of Companies Hall (Hall 8)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall8_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "Laundry Room", "Common Room", "Study Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall8"}'::jsonb),
('9', 'UC Jockey Club Hall (Hall 9)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/hall9_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX | Double: HK$XX,XXX", "non_local": "Single: HK$XX,XXX | Double: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single / Double Rooms", "Laundry Room", "Common Room", "Study Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/ug/ughall9"}'::jsonb),
('JHC', 'Jockey Hall Complex (JHC)', '{"image_url": "https://shrl.hkust.edu.hk/sites/default/files/jhc_ext.jpg", "price_info": {"local": "Single: HK$XX,XXX", "non_local": "Single: HK$XX,XXX"}, "price_note": "Per year, excl. air-conditioning fee", "facilities": ["Single Rooms", "Laundry Room", "Common Room"], "website_url": "https://shrl.hkust.edu.hk/residential-halls/jockey-hall-complex"}'::jsonb);
```

> 填入实际价格后，在 Supabase Dashboard → SQL Editor 执行一次。后续更新单行可使用：`UPDATE halls SET static_info = '...'::jsonb WHERE hall_id = 'X';`

---

## 常用查询示例

### 查询用户的完整画像

```sql
SELECT 
  p.user_id,
  u.email,
  p.form_preferences,
  p.inferred_preferences,
  p.memory_id,
  p.last_recommendation,
  p.updated_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.user_id = '550e8400-e29b-41d4-a716-446655440000';
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

### 查询指定宿舍的静态信息

```sql
SELECT hall_id, name, static_info
FROM halls
WHERE hall_id IN ('4', '5', 'JHC')
ORDER BY hall_id;
```

---

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
  p.form_preferences->>'budget_range' as budget_range,
  COUNT(*) as user_count
FROM profiles p
GROUP BY p.form_preferences->>'budget_range'
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

#

---


---

