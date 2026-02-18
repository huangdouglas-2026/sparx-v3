# LinkedIn 連結故障排除指南

> **Spark - LinkedIn 整合**
> 最後更新：2026-02-10

---

## 🔍 診斷步驟

### 步驟 1：訪問診斷頁面

在瀏覽器中打開：
```
http://localhost:3000/debug/linkedin
```

這個頁面會顯示：
- ✅ Client ID 是否已設定
- ✅ Client Secret 是否已設定
- ✅ Redirect URI 是否正確
- ✅ 當前連結狀態

---

## ⚠️ 常見問題與解決方案

### 問題 1：`redirect_uri_mismatch`

**症狀：**
```
Error: redirect_uri_mismatch
```

**原因：**
LinkedIn Developer Portal 中的 Redirect URL 與實際使用的 URL 不匹配。

**解決方案：**
1. 前往 [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. 選擇你的應用程式
3. 點擊「Auth」標籤
4. 在「Redirect URLs」中添加：
   ```
   http://localhost:3000/api/auth/callback/linkedin
   ```
5. 如果是生產環境，也要添加：
   ```
   https://your-domain.com/api/auth/callback/linkedin
   ```

**注意事項：**
- URL 必須**完全匹配**（包括協議、域名、端口、路徑）
- 不要有結尾的斜線 `/`
- 使用 `http://` 而不是 `https://`（本地開發）

---

### 問題 2：`invalid_client`

**症狀：**
```
Error: invalid_client
```

**原因：**
Client ID 或 Client Secret 錯誤。

**解決方案：**
1. 檢查 `.env.local` 文件
2. 確認 `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` 正確
3. 確認 `LINKEDIN_CLIENT_SECRET` 正確
4. **重要：** 修改 `.env.local` 後必須**重啟開發伺服器**

```bash
# 停止當前伺服器 (Ctrl+C)
# 重新啟動
npm run dev
```

---

### 問題 3：`unauthorized_client`

**症狀：**
```
Error: unauthorized_client
```

**原因：**
應用程式尚未獲得 LinkedIn 審核，或缺少必要的權限。

**解決方案：**
1. 在 LinkedIn Developer Portal 中檢查應用程式狀態
2. 確認以下權限已啟用：
   - `openid`
   - `profile`
   - `email`
   - `w_member_social`
3. 某些權限可能需要申請 LinkedIn 審核

---

### 問題 4：環境變數未載入

**症狀：**
診斷頁面顯示「❌ 未設定」

**解決方案：**
1. 確認 `.env.local` 文件存在於專案根目錄
2. 確認檔案內容格式正確：
   ```env
   NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```
3. **重啟開發伺服器**

---

### 問題 5：授權頁面顯示後無法完成

**症狀：**
- 可以打開 LinkedIn 授權頁面
- 點擊「允許」後出現錯誤

**可能原因：**
1. 資料庫表未創建
2. 用戶未登入
3. Token 交換失敗

**解決方案：**

**A. 檢查資料庫表：**
```sql
-- 在 Supabase SQL Editor 中執行
SELECT * FROM social_connections;
SELECT * FROM social_activities;
```

如果表不存在，執行 migration：
```bash
npx supabase db push
```

**B. 確認用戶已登入：**
- 確保在登入狀態下進行 LinkedIn 連結

**C. 檢查瀏覽器控制台：**
- 按 F12 開啟開發者工具
- 查看 Console 標籤的錯誤訊息

---

## 🔧 進階診斷

### 檢查瀏覽器控制台

1. 打開開發者工具（F12）
2. 切換到 Console 標籤
3. 點擊「連結 LinkedIn」
4. 尋找以下日誌：

```
✅ 應該看到的日誌：
🔗 LinkedIn OAuth Debug: { clientId: 'Set', redirectUri: '...', ... }
✅ Generated LinkedIn Auth URL: https://www.linkedin.com/oauth/v2/authorization?...

❌ 錯誤日誌：
❌ NEXT_PUBLIC_LINKEDIN_CLIENT_ID is not set
❌ Missing credentials
```

### 檢查 Network 標籤

1. 打開開發者工具（F12）
2. 切換到 Network 標籤
3. 點擊「連結 LinkedIn」
4. 檢查以下請求：

**LinkedIn 授權請求：**
- URL: `https://www.linkedin.com/oauth/v2/authorization`
- Status: 應該是 302（重定向）

**Token 交換請求：**
- URL: `https://www.linkedin.com/oauth/v2/accessToken`
- Status: 應該是 200 OK
- Response: 應該包含 `access_token`

---

## 📝 LinkedIn Developer Portal 設定檢查清單

使用此清單確保所有設定正確：

- [ ] 應用程式已創建
- [ ] Client ID 已複製到 `.env.local`
- [ ] Client Secret 已複製到 `.env.local`
- [ ] Redirect URLs 已設定：
  - [ ] `http://localhost:3000/api/auth/callback/linkedin`
  - [ ] `https://your-production-domain.com/api/auth/callback/linkedin`
- [ ] OAuth 2.0 權限已啟用：
  - [ ] `openid`
  - [ ] `profile`
  - [ ] `email`
  - [ ] `w_member_social`
- [ ] 應用程式狀態為「Live」或「Development」

---

## 🚀 測試流程

完整的測試流程：

1. **檢查環境變數**
   ```bash
   cat .env.local | grep LINKEDIN
   ```

2. **重啟開發伺服器**
   ```bash
   # 停止當前 (Ctrl+C)
   npm run dev
   ```

3. **訪問診斷頁面**
   ```
   http://localhost:3000/debug/linkedin
   ```

4. **確認設定正確**
   - Client ID: ✅ 已設定
   - Client Secret: ✅ 已設定
   - Redirect URI: ✅ 正確

5. **點擊「測試 LinkedIn 連結」**
   - 應該會開啟 LinkedIn 授權頁面
   - 點擊「允許」

6. **檢查結果**
   - 成功：重定向回 `/profile?message=linkedin_connected`
   - 失敗：查看控制台錯誤訊息

---

## 📞 獲取幫助

如果以上步驟都無法解決問題：

1. **收集資訊：**
   - 瀏覽器控制台的錯誤訊息（截圖）
   - Network 標籤的失敗請求（截圖）
   - `.env.local` 中的 LinkedIn 配置（隱藏 Secret）

2. **查看文檔：**
   - [LinkedIn OAuth 2.0 文檔](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
   - [LINKEDIN_INTEGRATION_REPORT.md](./LINKEDIN_INTEGRATION_REPORT.md)

3. **檢查已知限制：**
   - LinkedIn API 有限制（參見 LINKEDIN_INTEGRATION_REPORT.md）
   - 某些功能需要應用程式審核

---

**最後更新：** 2026-02-10
**相關文檔：** [LINKEDIN_INTEGRATION_REPORT.md](./LINKEDIN_INTEGRATION_REPORT.md)
