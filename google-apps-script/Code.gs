/**
 * VIMEI Knowledge Tracker - Google Apps Script Backend
 */

function testAuth() {
  DriveApp.getRootFolder();
  console.log("授權成功！Google Drive 已經連線！");
}

const SHEETS = {
  OBSERVATIONS:   'observations',
  SCHEDULES:      'schedules',
  GUEST_COMMENTS: 'guest_comments',
  ASSESSMENTS:    'assessments',
  RESOURCES:      'resources'
};

function getTaipeiTime() {
  return Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd'T'HH:mm:ss+08:00");
}

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
    else if (action === 'getAllResources')     result = getAllResources();
    else if (action === 'getInitData') {
      const role = e.parameter.role;
      const tId = e.parameter.traineeId;
      if (role === 'trainee') {
        result = {
          observations: getObservations(tId),
          guestComments: getGuestComments(tId),
          schedules: getSchedulesForTrainee(tId),
          assessments: getAssessments(),
          resources: getAllResources()
        };
      } else {
        result = {
          observations: getAllObservations(),
          guestComments: getAllGuestComments(),
          schedules: getAllSchedules(),
          assessments: getAssessments(),
          resources: getAllResources()
        };
      }
    }
    else result = { error: 'Unknown action: ' + action };
    return corsResponse(result);
  } catch (err) {
    return corsResponse({ error: err.message });
  }
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return corsResponse({ error: 'Invalid JSON' });
  }

  const action = data.action;
  const isReadAction = [
    'getAllObservations', 'getObservations', 'getAllSchedules', 'getSchedules',
    'getAllGuestComments', 'getGuestComments', 'getAssessments', 'getAllResources',
    'getInitData'
  ].includes(action);

  let lock = null;
  if (!isReadAction) {
    lock = LockService.getScriptLock();
    try {
      // 鎖定最高 15 秒，避免同時多人寫入造成行號錯亂 (Race Condition)
      lock.waitLock(15000);
    } catch (err) {
      return corsResponse({ error: '系統目前較為忙碌，請稍後再試。 (System is busy, please try again later)' });
    }
  }

  try {
    let result;
    if      (action === 'submitObservation')          result = submitObservation(data);
    else if (action === 'submitFeedback')             result = submitFeedback(data);
    else if (action === 'submitGuestComment')         result = submitGuestComment(data);
    else if (action === 'updateSchedule')             result = updateSchedule(data);
    else if (action === 'submitAssessment')           result = submitAssessment(data);
    else if (action === 'updateAssessmentVisibility') result = updateAssessmentVisibility(data);
    else if (action === 'updateAssessment')           result = updateAssessment(data);
    else if (action === 'deleteAssessment')           result = deleteAssessment(data);
    else if (action === 'updateObservation')          result = updateObservation(data);
    else if (action === 'deleteObservation')          result = deleteObservation(data);
    else if (action === 'uploadFile')                 result = uploadFile(data);
    else if (action === 'submitResource')             result = submitResource(data);
    else if (action === 'deleteResource')             result = deleteResource(data);
    // Add get actions for POST requests (CORS fix)
    else if (action === 'getAllObservations')         result = getAllObservations();
    else if (action === 'getObservations')            result = getObservations(data.traineeId);
    else if (action === 'getAllSchedules')            result = getAllSchedules();
    else if (action === 'getSchedules')               result = getSchedulesForTrainee(data.traineeId);
    else if (action === 'getAllGuestComments')        result = getAllGuestComments();
    else if (action === 'getGuestComments')           result = getGuestComments(data.traineeId);
    else if (action === 'getAssessments')             result = getAssessments();
    else if (action === 'getAllResources')            result = getAllResources();
    else if (action === 'getInitData') {
      const role = data.role;
      const tId = data.traineeId;
      if (role === 'trainee') {
        result = {
          observations: getObservations(tId),
          guestComments: getGuestComments(tId),
          schedules: getSchedulesForTrainee(tId),
          assessments: getAssessments(),
          resources: getAllResources()
        };
      } else {
        result = {
          observations: getAllObservations(),
          guestComments: getAllGuestComments(),
          schedules: getAllSchedules(),
          assessments: getAssessments(),
          resources: getAllResources()
        };
      }
    }
    else result = { error: 'Unknown action: ' + action };
    
    return corsResponse(result);
  } catch (err) {
    return corsResponse({ error: err.message });
  } finally {
    // 釋放鎖，讓其他請求可以繼續
    if (lock) lock.releaseLock();
  }
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    if (existingHeaders.length < headers.length) {
      for (let i = existingHeaders.length; i < headers.length; i++) {
        sheet.getRange(1, i + 1).setValue(headers[i]);
      }
    }
  }
  return sheet;
}

function sheetToArray(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { 
      let val = row[i];
      if (h === 'date' && Object.prototype.toString.call(val) === '[object Date]') {
        const yyyy = val.getFullYear();
        const mm = String(val.getMonth() + 1).padStart(2, '0');
        const dd = String(val.getDate()).padStart(2, '0');
        val = `${yyyy}-${mm}-${dd}`;
      } else if (h === 'date' && typeof val === 'string' && val.includes('T')) {
        val = val.split('T')[0];
      }
      obj[h] = val; 
    });
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

const OBS_HEADERS = ['id','traineeId','traineeName','date','department','keyObservation','actionableIdea','attachmentUrl','submittedAt','status','mentorComment','mentorName','feedbackAt','rating','targetWeek'];

function getAllObservations() {
  return sheetToArray(getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS));
}

function getObservations(traineeId) {
  const all = getAllObservations();
  return traineeId ? all.filter(r => r.traineeId === traineeId) : all;
}

// ----------------------------------------------------
// 檔案上傳 (考核專用)
// ----------------------------------------------------
function uploadFile(data) {
  const folderName = data.folderName || "MA_Program_Uploads";
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  
  const base64Str = data.base64.split(',')[1] || data.base64;
  const decoded = Utilities.base64Decode(base64Str);
  const blob = Utilities.newBlob(decoded, data.mimeType, data.filename);
  const file = folder.createFile(blob);
  
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (shareErr) {
    console.log("企業權限限制: " + shareErr);
  }
  return { success: true, url: file.getUrl() };
}

// ----------------------------------------------------
// 學生週記 (Observations)
// ----------------------------------------------------
function submitObservation(params) {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  let attachmentUrl = params.attachmentUrl || "";
  
  const obsId = params.id || ('obs-' + new Date().getTime());
  
  if (params.fileData && params.fileData.base64) {
    let diagnosticInfo = "開始執行;";
    try {
      const b64String = params.fileData.base64;
      diagnosticInfo += "原始長度:" + (b64String ? b64String.length : "null") + ";";
      const parts = b64String.split(',');
      const data = parts.length > 1 ? parts[1] : parts[0];
      diagnosticInfo += "分割後長度:" + (data ? data.length : "null") + ";";
      
      if (!data || data.length === 0) throw new Error("Base64 字串為空");

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
    obsId, params.traineeId, params.traineeName, params.date,
    params.department, params.keyObservation, params.actionableIdea || "",
    attachmentUrl, getTaipeiTime(), 'pending', '', '', '', params.selfRating || 0, params.targetWeek || ''
  ]);
  return { success: true, id: obsId };
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
      let rowData = data[i];
      if (updateData.date) rowData[3] = updateData.date;
      if (updateData.department) rowData[4] = updateData.department;
      if (updateData.keyObservation !== undefined) rowData[5] = updateData.keyObservation;
      if (updateData.actionableIdea !== undefined) rowData[6] = updateData.actionableIdea;
      if (updateData.attachmentUrl !== undefined) rowData[7] = updateData.attachmentUrl;
      if (updateData.targetWeek !== undefined) rowData[14] = updateData.targetWeek;
      
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return { success: true };
    }
  }
  return { success: false, error: 'Observation not found' };
}

function submitFeedback(data) {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  const sheetData = sheet.getDataRange().getValues();
  let rowIdx = -1;
  let rowData = [];
  for (let i = 1; i < sheetData.length; i++) {
    if (String(sheetData[i][0]) === String(data.obsId)) {
      rowIdx = i + 1;
      rowData = sheetData[i];
      break;
    }
  }
  if (rowIdx < 0) return { error: 'Observation not found' };

  const col = h => OBS_HEADERS.indexOf(h);
  rowData[col('status')] = 'reviewed';
  rowData[col('mentorComment')] = data.mentorComment || '';
  rowData[col('mentorName')] = data.mentorName || '';
  rowData[col('feedbackAt')] = getTaipeiTime();
  rowData[col('rating')] = data.rating || 0;
  
  sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  return { success: true };
}

// ----------------------------------------------------
// 班表與留言 (Schedules & Guest Comments)
// ----------------------------------------------------
const SCHED_HEADERS = ['traineeId','date','dept','objective','updatedAt'];

function getAllSchedules() {
  const rows  = sheetToArray(getOrCreateSheet(SHEETS.SCHEDULES, SCHED_HEADERS));
  const result = {};
  rows.forEach(r => {
    if (!result[r.traineeId]) result[r.traineeId] = {};
    let dateStr = r.date;
    if (Object.prototype.toString.call(dateStr) === '[object Date]') {
      dateStr = Utilities.formatDate(dateStr, "Asia/Taipei", "yyyy-MM-dd");
    } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    result[r.traineeId][dateStr] = { dept: r.dept, objective: r.objective };
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

// ----------------------------------------------------
// 主管考核 (Assessments) 
// ----------------------------------------------------
// 統一修復 ASSESS_HEADERS (加入 competency5, visibleToTrainee, attachmentUrl)
const ASSESS_HEADERS = ['id','traineeId','department','grade','competency1','competency2','competency3','competency4','competency5','comments','assessor','assessedAt','visibleToTrainee','attachmentUrl'];

function getAssessments() {
  return sheetToArray(getOrCreateSheet(SHEETS.ASSESSMENTS, ASSESS_HEADERS));
}

function submitAssessment(data) {
  const sheet = getOrCreateSheet(SHEETS.ASSESSMENTS, ASSESS_HEADERS);
  const id = 'asm-' + new Date().getTime();
  sheet.appendRow([
    id, data.traineeId, data.department, data.grade,
    data.competency1, data.competency2, data.competency3, data.competency4, data.competency5 || 3,
    data.comments, data.assessor, getTaipeiTime(), false, data.attachmentUrl || ''
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
      sheet.getRange(targetRowIndex, 13).setValue(visibleToTrainee);
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
      let rowData = data[i];
      if (updateData.department) rowData[2] = updateData.department;
      if (updateData.grade) rowData[3] = updateData.grade;
      if (updateData.competency1 !== undefined) rowData[4] = updateData.competency1;
      if (updateData.competency2 !== undefined) rowData[5] = updateData.competency2;
      if (updateData.competency3 !== undefined) rowData[6] = updateData.competency3;
      if (updateData.competency4 !== undefined) rowData[7] = updateData.competency4;
      if (updateData.competency5 !== undefined) rowData[8] = updateData.competency5;
      if (updateData.comments !== undefined) rowData[9] = updateData.comments;
      if (updateData.assessor !== undefined) rowData[10] = updateData.assessor;
      if (updateData.attachmentUrl !== undefined) rowData[13] = updateData.attachmentUrl;
      
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return { success: true };
    }
  }
  return { success: false, error: 'Assessment not found' };
}

// ----------------------------------------------------
// 學習資源 (Resources)
// ----------------------------------------------------
const RES_HEADERS = ['id', 'title', 'category', 'url', 'uploadedBy', 'uploadedAt'];

function getAllResources() {
  return sheetToArray(getOrCreateSheet(SHEETS.RESOURCES, RES_HEADERS));
}

function submitResource(data) {
  const sheet = getOrCreateSheet(SHEETS.RESOURCES, RES_HEADERS);
  const id = 'res-' + new Date().getTime();
  sheet.appendRow([
    id, data.title, data.category, data.url, data.uploadedBy, getTaipeiTime()
  ]);
  return { success: true, id };
}

function deleteResource(params) {
  const sheet = getOrCreateSheet(SHEETS.RESOURCES, RES_HEADERS);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === params.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Resource not found' };
}
