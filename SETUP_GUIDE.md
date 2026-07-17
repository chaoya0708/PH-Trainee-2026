# VIMEI Knowledge Tracker - 部署完整指南

## 第一步：測試本機 Demo 版本

開啟 `index.html` 確認系統正常運作：
- 管理者密碼：`0000`
- Diane 密碼：`1111`、Mark：`2222`、Jairuz：`3333`
- 訪客代碼：`vimei2026`

> 確認一切正常後，再進行以下步驟。

---

## 第二步：建立 Google Sheets 後台與完整程式碼 (最新終極版)

### 2.1 新增 Google 試算表
1. 前往 [Google Sheets](https://sheets.google.com)，點擊 **「+ 空白試算表」**
2. 命名為 **「VIMEI Tracker 後台」**
3. 記下這個試算表的網址備用

### 2.2 設定 Apps Script 終極程式碼 (Code.gs)
因為系統經過多次升級（加入了 PDF 閱讀器、防呆機制與企業權限繞過），請**直接使用以下這份最終版程式碼**。

1. 在試算表上方工具列點選：**「擴充功能」→「Apps Script」**
2. 將預設檔案 `程式碼.gs` (或 `Code.gs`) 裡面的內容**全部刪除**，並貼上以下完整程式碼：

<details>
<summary>👉 點擊展開：完整 Code.gs 程式碼 (請全選複製)</summary>

```javascript
function testAuth() {
  DriveApp.getRootFolder();
  console.log("授權成功！Google Drive 已經連線！");
}

const SHEETS = {
  OBSERVATIONS:   'observations',
  SCHEDULES:      'schedules',
  GUEST_COMMENTS: 'guest_comments',
  ASSESSMENTS:    'assessments'
};

function corsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  try {
    let result;
    if      (action === 'getAllObservations')  result = getAllObservations();
    else if (action === 'getObservations')     result = getObservations(e.parameter.traineeId);
    else if (action === 'getAllSchedules')     result = getAllSchedules();
    else if (action === 'getSchedules')        result = getSchedulesForTrainee(e.parameter.traineeId);
    else if (action === 'getAllGuestComments') result = getAllGuestComments();
    else if (action === 'getGuestComments')    result = getGuestComments(e.parameter.traineeId);
    else if (action === 'getAssessments')      result = getAssessments();
    else result = { error: 'Unknown action: ' + action };
    return corsResponse(result);
  } catch (err) {
    return corsResponse({ error: err.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;
    if      (action === 'submitObservation')          result = submitObservation(data);
    else if (action === 'submitFeedback')             result = submitFeedback(data);
    else if (action === 'submitGuestComment')         result = submitGuestComment(data);
    else if (action === 'updateSchedule')             result = updateSchedule(data);
    else if (action === 'submitAssessment')           result = submitAssessment(data);
    else if (action === 'updateAssessmentVisibility') result = updateAssessmentVisibility(data);
    
    // 編輯與刪除功能
    else if (action === 'updateAssessment')           result = updateAssessment(data);
    else if (action === 'deleteAssessment')           result = deleteAssessment(data);
    else if (action === 'updateObservation')          result = updateObservation(data);
    else if (action === 'deleteObservation')          result = deleteObservation(data);
    else result = { error: 'Unknown action: ' + action };
    
    return corsResponse(result);
  } catch (err) {
    return corsResponse({ error: err.message });
  }
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetToArray(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function findRowIndex(sheet, colName, value) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIdx = headers.indexOf(colName);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIdx]) === String(value)) return i + 1;
  }
  return -1;
}

const OBS_HEADERS = ['id','traineeId','traineeName','date','department','keyObservation','actionableIdea','attachmentUrl','submittedAt','status','mentorComment','mentorName','feedbackAt','rating'];

function getAllObservations() {
  return sheetToArray(getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS));
}

function getObservations(traineeId) {
  const all = getAllObservations();
  return traineeId ? all.filter(r => r.traineeId === traineeId) : all;
}

function submitObservation(params) {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  let attachmentUrl = params.attachmentUrl || "";
  
  if (params.fileData && params.fileData.base64) {
    let diagnosticInfo = "開始執行;";
    try {
      const b64String = params.fileData.base64;
      diagnosticInfo += "原始長度:" + (b64String ? b64String.length : "null") + ";";
      
      const parts = b64String.split(',');
      const data = parts.length > 1 ? parts[1] : parts[0];
      diagnosticInfo += "分割後長度:" + (data ? data.length : "null") + ";";
      
      if (!data || data.length === 0) {
        throw new Error("Base64 字串為空");
      }

      const decoded = Utilities.base64Decode(data);
      diagnosticInfo += "解碼成功;";
      
      const mime = params.fileData.mimeType || 'application/pdf';
      const name = params.fileData.fileName || 'upload.pdf';
      
      const blob = Utilities.newBlob(decoded);
      blob.setContentType(mime);
      blob.setName(name);
      diagnosticInfo += "Blob建立成功;";
      
      let folder;
      const folders = DriveApp.getFoldersByName("MA_Program_Uploads");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("MA_Program_Uploads");
      }
      
      const file = folder.createFile(blob);
      attachmentUrl = file.getUrl(); 
      diagnosticInfo += "檔案儲存成功;";
      
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        console.log("企業權限限制: " + shareErr);
      }
      
    } catch(err) {
      attachmentUrl = "上傳失敗: [" + diagnosticInfo + "] 錯誤: " + err.message;
    }
  }

  sheet.appendRow([
    params.id, params.traineeId, params.traineeName, params.date,
    params.department, params.keyObservation, params.actionableIdea || "",
    attachmentUrl, params.submittedAt, 'pending', '', '', '', 0
  ]);
  
  return { success: true };
}

function deleteObservation(params) {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === params.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Observation not found' };
}

function updateObservation(params) {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  const data = sheet.getDataRange().getValues();
  const updateData = params.data;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      if (updateData.date) sheet.getRange(i + 1, 4).setValue(updateData.date);
      if (updateData.department) sheet.getRange(i + 1, 5).setValue(updateData.department);
      if (updateData.keyObservation !== undefined) sheet.getRange(i + 1, 6).setValue(updateData.keyObservation);
      if (updateData.actionableIdea !== undefined) sheet.getRange(i + 1, 7).setValue(updateData.actionableIdea);
      if (updateData.attachmentUrl !== undefined) sheet.getRange(i + 1, 8).setValue(updateData.attachmentUrl);
      
      return { success: true };
    }
  }
  return { success: false, error: 'Observation not found' };
}

function submitFeedback(data) {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  const rowIdx = findRowIndex(sheet, 'id', data.obsId);
  if (rowIdx < 0) return { error: 'Observation not found' };
  const headers = sheet.getRange(1, 1, 1, OBS_HEADERS.length).getValues()[0];
  const col = h => headers.indexOf(h) + 1;
  sheet.getRange(rowIdx, col('status')).setValue('reviewed');
  sheet.getRange(rowIdx, col('mentorComment')).setValue(data.mentorComment || '');
  sheet.getRange(rowIdx, col('mentorName')).setValue(data.mentorName || '');
  sheet.getRange(rowIdx, col('feedbackAt')).setValue(getTaipeiTime());
  sheet.getRange(rowIdx, col('rating')).setValue(data.rating || 0);
  return { success: true };
}

const SCHED_HEADERS = ['traineeId','date','dept','objective','updatedAt'];

function getAllSchedules() {
  const rows  = sheetToArray(getOrCreateSheet(SHEETS.SCHEDULES, SCHED_HEADERS));
  const result = {};
  rows.forEach(r => {
    if (!result[r.traineeId]) result[r.traineeId] = {};
    result[r.traineeId][r.date] = { dept: r.dept, objective: r.objective };
  });
  return result;
}

function getSchedulesForTrainee(traineeId) {
  return getAllSchedules()[traineeId] || {};
}

function updateSchedule(data) {
  const sheet  = getOrCreateSheet(SHEETS.SCHEDULES, SCHED_HEADERS);
  const existing = sheetToArray(sheet).findIndex(r => r.traineeId === data.traineeId && r.date === data.date);
  if (existing >= 0) {
    const sheetRow = existing + 2;
    sheet.getRange(sheetRow, 3).setValue(data.dept);
    sheet.getRange(sheetRow, 4).setValue(data.objective);
    sheet.getRange(sheetRow, 5).setValue(getTaipeiTime());
  } else {
    sheet.appendRow([data.traineeId, data.date, data.dept, data.objective, getTaipeiTime()]);
  }
  return { success: true };
}

const GC_HEADERS = ['id','obsId','comment','submittedAt'];

function getAllGuestComments() {
  return sheetToArray(getOrCreateSheet(SHEETS.GUEST_COMMENTS, GC_HEADERS));
}

function getGuestComments(traineeId) {
  return getAllGuestComments();
}

function submitGuestComment(data) {
  const id = 'gc-' + new Date().getTime();
  getOrCreateSheet(SHEETS.GUEST_COMMENTS, GC_HEADERS).appendRow([id, data.obsId, data.comment, getTaipeiTime()]);
  return { success: true, id };
}

const ASSESS_HEADERS = ['id','traineeId','department','grade','competency1','competency2','competency3','competency4','comments','assessor','assessedAt','visibleToTrainee'];

function getAssessments() {
  return sheetToArray(getOrCreateSheet(SHEETS.ASSESSMENTS, ASSESS_HEADERS));
}

function submitAssessment(data) {
  const id = 'asm-' + new Date().getTime();
  getOrCreateSheet(SHEETS.ASSESSMENTS, ASSESS_HEADERS).appendRow([
    id, data.traineeId, data.department, data.grade,
    data.competency1, data.competency2, data.competency3, data.competency4,
    data.comments, data.assessor, getTaipeiTime(), false
  ]);
  return { success: true, id };
}

function updateAssessmentVisibility(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.ASSESSMENTS, ASSESS_HEADERS);
    const id = data.id;
    const visibleToTrainee = data.visibleToTrainee; 

    const sheetData = sheet.getDataRange().getValues();
    let targetRowIndex = -1;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == id) { 
        targetRowIndex = i + 1; 
        break;
      }
    }

    if (targetRowIndex !== -1) {
      sheet.getRange(targetRowIndex, 12).setValue(visibleToTrainee);
      return { success: true };
    } else {
      return { success: false, error: "找不到該筆考核紀錄" };
    }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function deleteAssessment(params) {
  const sheet = getOrCreateSheet(SHEETS.ASSESSMENTS, ASSESS_HEADERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === params.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Assessment not found' };
}

function updateAssessment(params) {
  const sheet = getOrCreateSheet(SHEETS.ASSESSMENTS, ASSESS_HEADERS);
  const data = sheet.getDataRange().getValues();
  const updateData = params.data;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      if (updateData.department) sheet.getRange(i + 1, 3).setValue(updateData.department);
      if (updateData.grade) sheet.getRange(i + 1, 4).setValue(updateData.grade);
      if (updateData.competency1 !== undefined) sheet.getRange(i + 1, 5).setValue(updateData.competency1);
      if (updateData.competency2 !== undefined) sheet.getRange(i + 1, 6).setValue(updateData.competency2);
      if (updateData.competency3 !== undefined) sheet.getRange(i + 1, 7).setValue(updateData.competency3);
      if (updateData.competency4 !== undefined) sheet.getRange(i + 1, 8).setValue(updateData.competency4);
      if (updateData.competency5 !== undefined) sheet.getRange(i + 1, 9).setValue(updateData.competency5);
      if (updateData.comments !== undefined) sheet.getRange(i + 1, 10).setValue(updateData.comments);
      if (updateData.assessor !== undefined) sheet.getRange(i + 1, 11).setValue(updateData.assessor);
      return { success: true };
    }
  }
  return { success: false, error: 'Assessment not found' };
}
```
</details>

### 2.3 解除權限封印 (設定 appsscript.json)
1. 點擊編輯器左側的 **「⚙️齒輪圖示 (專案設定)」**。
2. 將 **「在編輯器中顯示「appsscript.json」資訊清單檔案」** 打勾。
3. 點擊左側 **「< > (編輯器)」**，找到 `appsscript.json` 檔案。
4. 清空裡面的內容，並貼上以下設定檔：

```json
{
  "timeZone": "Asia/Taipei",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

### 2.4 發布應用程式 (最重要的一步！)
1. 點擊上方的「部署 (Deploy)」→「新增部署作業」 (如果是更新舊版，請選「管理部署」 > 點擊鉛筆圖示 > 版本選「建立新版本」)。
2. 確認兩個設定：
   - **執行身分 (Execute as)**：下拉選擇 **「我 (Me)」** (這是您個人的信箱)
   - **誰可以存取 (Who has access)**：下拉選擇 **「所有人 (Anyone)」**
3. 點擊 **「部署」**。
4. **【關鍵點】此時系統會跳出「需要授權」的視窗，請點擊「審查權限 ➡️ 登入帳號 ➡️ 進階 ➡️ 前往專案 ➡️ 允許」。**
5. 成功後，會獲得一串 **「網頁應用程式 URL」**，請把它複製下來。

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
