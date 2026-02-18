# Vault 資料庫設定指南

## 前置準備

確保你已經有 Supabase 專案，並且已經建立 `contacts` 表（從之前的專案）。

## 執行步驟

### 1. 在 Supabase Dashboard 執行 SQL

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 點選左側選單的 **SQL Editor**
4. 點擊 **New Query**
5. 將 `supabase/migrations/001_create_vault_tables.sql` 的內容貼上
6. 點擊 **Run** 執行

### 2. 驗證表格建立成功

在 **Table Editor** 中檢查以下表格是否已建立：
- `value_domains` - 價值領域
- `stories` - 故事
- `story_insights` - 故事洞察

### 3. 驗證 RLS 政策

在 **Authentication** > **Policies** 中檢查每個表格的 RLS 政策是否正確設定。

## 表格結構

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

1. **外鍵依賴**: `story_insights` 表依賴 `contacts` 表，請確保 `contacts` 表已存在。
2. **RLS 政策**: 所有表格都啟用了 Row Level Security，確保使用者只能存取自己的資料。
3. **自動函數**: 已建立自動更新 `updated_at` 和計數器函數的觸發器。
