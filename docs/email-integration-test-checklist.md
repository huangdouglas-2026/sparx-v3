# Email-First 社交整合測試清單

> **建立日期：** 2026-02-10
> **目的：** 測試 Gmail API + Email 解析器的完整流程

---

## ✅ 測試前準備

### 1. 環境變數設定

- [ ] Google Cloud Console 已建立 OAuth 憑證
- [ ] `.env.local` 已更新：
  ```env
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=已填寫
  GOOGLE_CLIENT_SECRET=已填寫
  ```
- [ ] 重新導向 URI 已設定：`http://localhost:3001/api/auth/callback/google`
- [ ] Gmail API 已啟用

### 2. 資料庫遷移

- [ ] Supabase Dashboard SQL Editor 已執行遷移 6
- [ ] `social_notifications` 表格已建立
- [ ] `social_connections` 表格已更新支援 Google
- [ ] RLS 政策已正確設定

### 3. 伺服器準備

- [ ] 已重啟開發伺服器：`npm run dev`
- [ ] 瀏覽器可訪問：`http://localhost:3001`

---

## 🧪 功能測試

### 測試 1：Google OAuth 起始

**步驟：**
1. 瀏覽器訪問：`http://localhost:3001/api/auth/google`
2. 檢查 JSON 回應

**預期結果：**
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**狀態：** ⬜ 通過 / ❌ 失敗

**失敗診斷：**
- 檢查 `.env.local` 是否有 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- 檢查伺服器是否正確載入環境變數

---

### 測試 2：Google OAuth 完整流程

**步驟：**
1. 訪問：`http://localhost:3001/profile`
2. 點擊「社交媒體整合」區塊中的「連結」按鈕（Google Gmail）
3. 完成 Google OAuth 授權流程
4. 檢查是否重新導向回 Profile 頁面

**預期結果：**
- URL 變更為：`/profile?message=google_connected`
- Profile 頁面顯示「✓ 已連結」或類似的成功提示
- 不再看到「連結」按鈕，而是顯示「管理」按鈕

**狀態：** ⬜ 通過 / ❌ 失敗

**失敗診斷：**
- 檢查瀏覽器 Console 錯誤訊息
- 檢查伺服器 Terminal 日誌
- 確認重新導向 URI 完全符合

---

### 測試 3：連結狀態儲存

**步驟：**
1. 開啟 Supabase Dashboard → Table Editor
2. 查看 `social_connections` 表格
3. 確認有一筆 `platform = 'google'` 的記錄

**預期結果：**
| 欄位 | 值 |
|------|-----|
| platform | `google` |
| access_token | 非空的字串 |
| refresh_token | 可選 |
| expires_at | 未來的時間戳 |
| last_synced_at | 當前時間戳 |

**狀態：** ⬜ 通過 / ❌ 失敗

---

### 測試 4：Email 同步功能

**步驟：**
1. 確保已完成 Google OAuth 連結
2. 在 Profile 頁面點擊「🔄 立即同步 Email」按鈕
3. 檢查是否顯示成功訊息

**預期結果：**
- 顯示 alert：`✅ 同步完成！處理了 X 封郵件`
- 按鈕文字變更為「上次同步：剛剛」

**狀態：** ⬜ 通過 / ❌ 失敗

**失敗診斷：**
- 檢查瀏覽器 Network Tab 的 API 請求
- 檢查伺服器 Terminal 的錯誤日誌
- 確認 Gmail access_token 仍有權限

---

### 測試 5：Today 頁面顯示通知

**步驟：**
1. 訪問：`http://localhost:3001/today`
2. 檢查是否顯示「最近通知」區塊
3. 如果有通知，檢查顯示是否正確

**預期結果（有通知時）：**
```
┌─────────────────────────────────────────┐
│  📬 最近通知 (5)          最近 7 天      │
│  ┌───────────────────────────────────┐  │
│  │ 💬 王小明 LinkedIn    剛剛         │  │
│  │ 在你的貼文留言了...               │  │
│  │ [💬 快速回應] [🔖 保存]          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**預期結果（無通知時）：**
```
┌─────────────────────────────────────────┐
│  📭                                   │
│  尚未連結社交媒體                       │
│  [前往設定]                            │
└─────────────────────────────────────────┘
```

**狀態：** ⬜ 通過 / ❌ 失敗

---

## 🔍 除錯技巧

### 查看連結狀態

在瀏覽器 Console 執行：
```javascript
// 檢查是否有 Google 連結
fetch('/api/debug/connections')
  .then(r => r.json())
  .then(console.log);
```

### 手動測試同步 API

使用 curl 或 Postman：
```bash
curl -X POST http://localhost:3001/api/sync/emails \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 檢查 Gmail API 權限

在 Google Cloud Console 檢查：
- Gmail API 是否已啟用
- OAuth 憑證範圍是否包含：`https://www.googleapis.com/auth/gmail.readonly`

---

## 📊 測試結果記錄

| 測試項目 | 狀態 | 問題描述 | 解決方案 |
|---------|------|----------|----------|
| OAuth 起始 | ⬜ | | |
| OAuth 流程 | ⬜ | | |
| 連結儲存 | ⬜ | | |
| Email 同步 | ⬜ | | |
| Today 顯示 | ⬜ | | |

---

## 🐛 常見問題

### 問題 1：redirect_uri_mismatch

**錯誤訊息：**
```
Error: redirect_uri_mismatch
```

**解決方案：**
- 確認 Google Cloud Console 的重新導向 URI 包含正確的 port（3001）
- 確認協議（http 或 https）與開發伺服器一致

### 問題 2：access_token 無效

**錯誤訊息：**
```
Error: Invalid Credentials
```

**解決方案：**
- 重新進行 OAuth 流程
- 刪除舊的連結記錄並重新連結
- 檢查 access_token 是否過期（`expires_at` 欄位）

### 問題 3：無法讀取 Email

**錯誤訊息：**
```
Error: insufficient permissions
```

**解決方案：**
- 確認 OAuth scope 包含：`https://www.googleapis.com/auth/gmail.readonly`
- 重新進行 OAuth 流程

---

## 📝 測試完成後

### 下一步

一旦所有測試通過：

1. **測試 Email 解析器**
   - 發送測試 Email 到測試帳號
   - 驗證 LinkedIn/Facebook Email 是否正確解析

2. **整合 AI 分析**
   - 將社交通知與 AI 引擎連接
   - 偵測重要活動（升遷、新工作等）

3. **優化同步頻率**
   - 設定背景定時任務（cron job）
   - 測試自動同步

---

**測試人員：** ___________
**測試日期：** ___________
**簽名：** ___________
