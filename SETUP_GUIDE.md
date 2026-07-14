# VIMEI Knowledge Tracker - 部署完整指南

## 第一步：測試本機 Demo 版本

開啟 `index.html` 確認系統正常運作：
- 管理者密碼：`0000`
- Diane 密碼：`1111`、Mark：`2222`、Jairuz：`3333`
- 訪客代碼：`vimei2026`

> 確認一切正常後，再進行以下步驟。

---

## 第二步：建立 Google Sheets 後台 (正式模式)

### 2.1 新增 Google 試算表

1. 前往 [Google Sheets](https://sheets.google.com)，點擊 **「+ 空白試算表」**
2. 命名為 **「VIMEI Tracker 後台」**
3. 記下這個試算表的網址備用

### 2.2 設定 Apps Script

1. 在試算表上方工具列點選：**「擴充功能」→「Apps Script」**
2. 刪除左側程式碼框中的所有預設內容
3. 複製 `google-apps-script/Code.gs` 檔案中的**完整程式碼**貼入
4. 點擊 **「儲存」**（磁碟圖示）
5. 點擊 **「部署」→「新增部署作業」**
   - 類型：選擇 **「網頁應用程式」**
   - 說明：輸入 `VIMEI v1`
   - 執行身分：選擇 **「我（您的 Google 帳號）」**
   - 誰可以存取：選擇 **「所有人」**
6. 點擊 **「部署」**，複製產生的 **「網頁應用程式 URL」**

### 2.3 填入網址並切換為正式模式

打開 `js/config.js`，進行以下兩處修改：

```javascript
// 第 1 處：改為 false
DEMO_MODE: false,

// 第 2 處：貼入剛才複製的 Apps Script URL
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/你的ID/exec',
```

---

## 第三步：上傳至 GitHub Pages

### 3.1 建立 GitHub Repository

1. 登入 [GitHub](https://github.com)，點擊右上角 **「+」→「New repository」**
2. 名稱輸入：`vimei-tracker`（全小寫）
3. 設定為 **Public**（公開，這樣學生才能用網址開啟）
4. 不需要勾選任何初始化選項，直接點 **「Create repository」**

### 3.2 上傳所有檔案

**方法 A（最簡單）：直接在網頁上傳**

1. 在剛建立的 repository 頁面，點擊 **「uploading an existing file」** 連結
2. 將整個 `MA Program` 資料夾中的所有內容拖曳到網頁上
3. 在下方的 Commit 說明輸入：`Initial deploy`
4. 點擊 **「Commit changes」**

**方法 B（進階）：使用 Git 指令**

```bash
cd "/Users/sofiacykung/Documents/antigravity_demo/MA Program"
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/你的帳號/vimei-tracker.git
git push -u origin main
```

### 3.3 開啟 GitHub Pages

1. 進入 repository 的 **「Settings」** 頁面
2. 左側選單找到 **「Pages」**
3. Source 選擇 **「Deploy from a branch」**
4. Branch 選擇 **「main」**，資料夾選 **「/ (root)」**
5. 點擊 **「Save」**

等待約 1–2 分鐘，網頁即可從以下網址開啟：

```
https://你的GitHub帳號.github.io/vimei-tracker/
```

---

## 第四步：修改預設密碼

**在發給學生之前**，請先到 `js/config.js` 修改密碼：

```javascript
ADMIN_PIN:   '您自訂的密碼',   // 只有您知道
GUEST_CODE:  '您自訂的代碼',   // 給其他主管的訪客代碼

TRAINEES: [
  { id: 'diane',  ..., pin: '自訂四位數' },
  { id: 'mark',   ..., pin: '自訂四位數' },
  { id: 'jairuz', ..., pin: '自訂四位數' },
]
```

修改後重新上傳 `js/config.js` 到 GitHub，即可生效。

---

## 空間與費用說明

| 項目 | 說明 |
|------|------|
| **GitHub Pages** | 免費，每個 Repository 限制 1GB（程式碼本身只有幾十 KB，完全不是問題） |
| **Google Sheets** | 免費，每天 20,000 次 API 呼叫（三位學生的使用量遠低於此限制） |
| **圖片儲存** | 學生使用 Google Drive 分享連結，不佔 GitHub 空間 |
| **總費用** | **完全免費** |

---

## 常見問題

**Q: 學生上傳的照片會儲存到哪裡？**
> 照片本身請學生上傳至個人 Google Drive 後取得分享連結，連結文字會儲存在 Google Sheets，不佔 GitHub 空間。

**Q: 萬一學生忘記 PIN 碼怎麼辦？**
> 您可以在 `js/config.js` 直接查看或修改各人的 PIN 碼，然後重新上傳此檔案到 GitHub。

**Q: 訪客主管會看到其他學生的資料嗎？**
> 訪客可以看到所有學生的觀察日誌（唯讀），並留下簡短評語。如需更嚴格的隱私設計，請告知。

**Q: 如何新增更多學員？**
> 在 `js/config.js` 的 `TRAINEES` 陣列中新增一筆物件即可。
