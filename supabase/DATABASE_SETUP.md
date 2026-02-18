# 資料庫設定指南

## 前置準備

確保你已經有 Supabase 專案。

## 執行步驟

### 1. 在 Supabase Dashboard 執行 SQL

依序執行以下遷移檔案：

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 點選左側選單的 **SQL Editor**
4. 點擊 **New Query**
5. 依序執行以下遷移：

#### 遷移 1: Profiles 表（使用者名片）
```bash
# 執行 supabase/migrations/002_create_profiles_table.sql
```
建立表格：
- `profiles` - 使用者名片資料

#### 遷移 2: Vault 表（價值庫）
```bash
# 執行 supabase/migrations/001_create_vault_tables.sql
```
建立表格：
- `value_domains` - 價值領域
- `stories` - 故事
- `story_insights` - 故事洞察

### 2. 驗證表格建立成功

在 **Table Editor** 中檢查以下表格是否已建立：
- `profiles` - 使用者名片
- `value_domains` - 價值領域
- `stories` - 故事
- `story_insights` - 故事洞察

### 3. 驗證 RLS 政策

在 **Authentication** > **Policies** 中檢查每個表格的 RLS 政策是否正確設定。

## 表格結構

### profiles
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 (auth.users ID) |
| profile_data | JSONB | 名片資料 (姓名、職稱、聯絡方式等) |
| avatar_url | TEXT | 頭像 URL |
| company_card_url | TEXT | 公司名片 URL |
| qr_code_url | TEXT | QR Code URL |
| created_at | TIMESTAMPTZ | 建立時間 |
| updated_at | TIMESTAMPTZ | 更新時間 |

### value_domains
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | UUID | 使用者 ID |
| name | VARCHAR(255) | 領域名稱 |
| description | TEXT | 描述 |
| icon | VARCHAR(50) | 圖示 (預設: 💎) |
| color | VARCHAR(7) | 顏色 (預設: #ee8c2b) |
| story_count | INTEGER | 故事數量 |
| created_at | TIMESTAMPTZ | 建立時間 |
| updated_at | TIMESTAMPTZ | 更新時間 |

### stories
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | UUID | 使用者 ID |
| domain_id | UUID | 領域 ID (外鍵) |
| title | VARCHAR(500) | 標題 |
| content | TEXT | 內容 |
| tags | TEXT[] | 標籤陣列 |
| usage_count | INTEGER | 使用次數 |
| success_rate | DECIMAL(5,2) | 成功率 (0-100) |
| created_at | TIMESTAMPTZ | 建立時間 |
| updated_at | TIMESTAMPTZ | 更新時間 |
| last_used_at | TIMESTAMPTZ | 最後使用時間 |

### story_insights
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | UUID | 使用者 ID |
| story_id | UUID | 故事 ID (外鍵) |
| contact_id | UUID | 聯絡人 ID (外鍵) |
| platform | VARCHAR(20) | 平台 (linkedin, facebook, line, wechat, email) |
| result | VARCHAR(10) | 結果 (positive, neutral, negative) |
| feedback | TEXT | 回饋 |
| created_at | TIMESTAMPTZ | 建立時間 |

## 注意事項

1. **執行順序**: 先執行 `002_create_profiles_table.sql`，再執行 `001_create_vault_tables.sql`
2. **外鍵依賴**: `story_insights` 表依賴 `contacts` 表，請確保 `contacts` 表已存在（從舊專案遷移）。
3. **RLS 政策**: 所有表格都啟用了 Row Level Security，確保使用者只能存取自己的資料。
4. **自動函數**: 已建立自動更新 `updated_at` 和計數器函數的觸發器。
5. **公開存取**: `profiles` 表允許公開存取（用於名片分享功能）。
