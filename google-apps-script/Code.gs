/**
 * VIMEI Knowledge Tracker - Google Apps Script Backend
 * ======================================================
 * 部署步驟 / Deployment Steps:
 * 1. 開啟 Google Sheets → 擴充功能 → Apps Script
 * 2. 將此程式碼完整貼入
 * 3. 點擊「部署」→「新增部署作業」
 * 4. 類型選「網頁應用程式」，執行身份選「我」，存取權選「所有人」
 * 5. 複製產生的網址，貼入 js/config.js 的 APPS_SCRIPT_URL
 * 6. 將 js/config.js 的 DEMO_MODE 改為 false
 */

const SHEETS = {
  OBSERVATIONS:   'observations',
  SCHEDULES:      'schedules',
  GUEST_COMMENTS: 'guest_comments'
};

// ---- CORS Headers ----
function corsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- doGet: Handle read requests ----
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
    else result = { error: 'Unknown action: ' + action };
    return corsResponse(result);
  } catch (err) {
    return corsResponse({ error: err.message });
  }
}

// ---- doPost: Handle write requests ----
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;
    if      (action === 'submitObservation')  result = submitObservation(data);
    else if (action === 'submitFeedback')      result = submitFeedback(data);
    else if (action === 'submitGuestComment')  result = submitGuestComment(data);
    else if (action === 'updateSchedule')      result = updateSchedule(data);
    else result = { error: 'Unknown action: ' + action };
    return corsResponse(result);
  } catch (err) {
    return corsResponse({ error: err.message });
  }
}

// ---- Sheet Helpers ----

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
    if (String(data[i][colIdx]) === String(value)) return i + 1; // 1-indexed
  }
  return -1;
}

// ---- Observations ----

const OBS_HEADERS = ['id','traineeId','traineeName','date','department',
  'keyObservation','actionableIdea','attachmentUrl','submittedAt',
  'status','mentorComment','mentorName','feedbackAt','rating'];

function getAllObservations() {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  return sheetToArray(sheet);
}

function getObservations(traineeId) {
  const all = getAllObservations();
  return traineeId ? all.filter(r => r.traineeId === traineeId) : all;
}

function submitObservation(data) {
  const sheet = getOrCreateSheet(SHEETS.OBSERVATIONS, OBS_HEADERS);
  const id    = 'obs-' + new Date().getTime();
  const now   = new Date().toISOString();
  sheet.appendRow([
    id, data.traineeId, data.traineeName, data.date, data.department,
    data.keyObservation, data.actionableIdea, data.attachmentUrl || '',
    now, 'pending', '', '', '', 0
  ]);
  return { success: true, id };
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

// ---- Schedules ----

const SCHED_HEADERS = ['traineeId','date','dept','objective','updatedAt'];

function getAllSchedules() {
  const sheet = getOrCreateSheet(SHEETS.SCHEDULES, SCHED_HEADERS);
  const rows  = sheetToArray(sheet);
  const result = {};
  rows.forEach(r => {
    if (!result[r.traineeId]) result[r.traineeId] = {};
    result[r.traineeId][r.date] = { dept: r.dept, objective: r.objective };
  });
  return result;
}

function getSchedulesForTrainee(traineeId) {
  const all = getAllSchedules();
  return all[traineeId] || {};
}

function updateSchedule(data) {
  const sheet  = getOrCreateSheet(SHEETS.SCHEDULES, SCHED_HEADERS);
  const rowIdx = findRowIndex(sheet, 'traineeId', data.traineeId);
  // Check if row with matching traineeId AND date exists
  const rows   = sheetToArray(sheet);
  const existing = rows.findIndex(r => r.traineeId === data.traineeId && r.date === data.date);
  if (existing >= 0) {
    const sheetRow = existing + 2; // +1 for header, +1 for 1-index
    sheet.getRange(sheetRow, 3).setValue(data.dept);
    sheet.getRange(sheetRow, 4).setValue(data.objective);
    sheet.getRange(sheetRow, 5).setValue(new Date().toISOString());
  } else {
    sheet.appendRow([data.traineeId, data.date, data.dept, data.objective, new Date().toISOString()]);
  }
  return { success: true };
}

// ---- Guest Comments ----

const GC_HEADERS = ['id','obsId','comment','submittedAt'];

function getAllGuestComments() {
  const sheet = getOrCreateSheet(SHEETS.GUEST_COMMENTS, GC_HEADERS);
  return sheetToArray(sheet);
}

function getGuestComments(traineeId) {
  // For per-trainee filtering, we need obs IDs first - return all for simplicity
  return getAllGuestComments();
}

function submitGuestComment(data) {
  const sheet = getOrCreateSheet(SHEETS.GUEST_COMMENTS, GC_HEADERS);
  const id    = 'gc-' + new Date().getTime();
  sheet.appendRow([id, data.obsId, data.comment, new Date().toISOString()]);
  return { success: true, id };
}
