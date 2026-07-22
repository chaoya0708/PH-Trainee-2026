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
  ASSESSMENTS:    'assessments'
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
    else if (action === 'updateAssessment')           result = updateAssessment(data);
    else if (action === 'deleteAssessment')           result = deleteAssessment(data);
    else if (action === 'updateObservation')          result = updateObservation(data);
    else if (action === 'deleteObservation')          result = deleteObservation(data);
    else if (action === 'uploadFile')                 result = uploadFile(data);
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

// ----------------------------------------------------
// 檔案上傳 (考核專用)
// ----------------------------------------------------
function uploadFile(data) {
  // 優先使用前端傳來的 folderId，否則退回預設的考核資料夾
  const FOLDER_ID = data.folderId || '1RaGvfMc_15uRQw8tLtDZT7Bk2hRZe9IT'; 
  const folder = DriveApp.getFolderById(FOLDER_ID);
  
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
  sheet.getRange(rowIdx, col('feedbackAt')).setValue(new Date().toISOString());
  sheet.getRange(rowIdx, col('rating')).setValue(data.rating || 0);
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
    sheet.getRange(sheetRow, 5).setValue(new Date().toISOString());
  } else {
    sheet.appendRow([data.traineeId, data.date, data.dept, data.objective, new Date().toISOString()]);
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
  getOrCreateSheet(SHEETS.GUEST_COMMENTS, GC_HEADERS).appendRow([id, data.obsId, data.comment, new Date().toISOString()]);
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
      if (updateData.department) sheet.getRange(i + 1, 3).setValue(updateData.department);
      if (updateData.grade) sheet.getRange(i + 1, 4).setValue(updateData.grade);
      if (updateData.competency1 !== undefined) sheet.getRange(i + 1, 5).setValue(updateData.competency1);
      if (updateData.competency2 !== undefined) sheet.getRange(i + 1, 6).setValue(updateData.competency2);
      if (updateData.competency3 !== undefined) sheet.getRange(i + 1, 7).setValue(updateData.competency3);
      if (updateData.competency4 !== undefined) sheet.getRange(i + 1, 8).setValue(updateData.competency4);
      if (updateData.competency5 !== undefined) sheet.getRange(i + 1, 9).setValue(updateData.competency5);
      if (updateData.comments !== undefined) sheet.getRange(i + 1, 10).setValue(updateData.comments);
      if (updateData.assessor !== undefined) sheet.getRange(i + 1, 11).setValue(updateData.assessor);
      if (updateData.attachmentUrl !== undefined) sheet.getRange(i + 1, 14).setValue(updateData.attachmentUrl);
      return { success: true };
    }
  }
  return { success: false, error: 'Assessment not found' };
}
