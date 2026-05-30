const SPREADSHEET_ID = "";
const SHEET_NAME = "Tasks";
const HEADERS = [
  "task_id",
  "title",
  "description",
  "stage",
  "priority",
  "category",
  "sort_order",
  "created_at",
  "updated_at"
];
const ALLOWED_STAGES = ["idea", "discussion", "waiting", "executing", "completed"];
const ALLOWED_PRIORITIES = ["low", "medium", "high"];

function doGet() {
  try {
    const sheet = getTaskSheet();
    return jsonOutput({ ok: true, tasks: readTasks(sheet) });
  } catch (error) {
    return jsonOutput({ ok: false, error: error.message });
  }
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const sheet = getTaskSheet();

    if (payload.action === "create_task") {
      const task = normalizeTask(payload.task);
      sheet.appendRow(HEADERS.map((header) => task[header]));
      return jsonOutput({ ok: true, task });
    }

    if (payload.action === "update_tasks") {
      updateTasks(sheet, payload.tasks || []);
      return jsonOutput({ ok: true, tasks: readTasks(sheet) });
    }

    throw new Error("Unsupported action.");
  } catch (error) {
    return jsonOutput({ ok: false, error: error.message });
  }
}

function getTaskSheet() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("Spreadsheet not found. Create this script from the Sheet or set SPREADSHEET_ID.");
  }

  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = HEADERS.some((header, index) => currentHeaders[index] !== header);
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function readTasks(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  return sheet
    .getRange(2, 1, lastRow - 1, HEADERS.length)
    .getValues()
    .map((row) => rowToTask(row))
    .filter((task) => task.task_id && task.title && ALLOWED_STAGES.includes(task.stage))
    .sort((firstTask, secondTask) => {
      if (firstTask.stage === secondTask.stage) {
        return firstTask.sort_order - secondTask.sort_order;
      }
      return ALLOWED_STAGES.indexOf(firstTask.stage) - ALLOWED_STAGES.indexOf(secondTask.stage);
    });
}

function rowToTask(row) {
  const task = {};
  HEADERS.forEach((header, index) => {
    task[header] = row[index];
  });
  task.sort_order = Number(task.sort_order) || 0;
  return task;
}

function normalizeTask(rawTask) {
  const now = new Date().toISOString();
  const title = String(rawTask && rawTask.title ? rawTask.title : "").trim();
  const stage = String(rawTask && rawTask.stage ? rawTask.stage : "").trim();
  const priority = String(rawTask && rawTask.priority ? rawTask.priority : "medium").trim();

  if (!title || title.length > 120) {
    throw new Error("Task title is required and must be 120 characters or less.");
  }
  if (!ALLOWED_STAGES.includes(stage)) {
    throw new Error("Invalid task stage.");
  }
  if (!ALLOWED_PRIORITIES.includes(priority)) {
    throw new Error("Invalid task priority.");
  }

  return {
    task_id: String(rawTask.task_id || Utilities.getUuid()),
    title,
    description: String(rawTask.description || "").slice(0, 500),
    stage,
    priority,
    category: String(rawTask.category || "General"),
    sort_order: Number(rawTask.sort_order) || 0,
    created_at: String(rawTask.created_at || now),
    updated_at: String(rawTask.updated_at || now)
  };
}

function updateTasks(sheet, taskUpdates) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return;
  }

  const updatesById = {};
  taskUpdates.forEach((task) => {
    if (!task || !task.task_id || !ALLOWED_STAGES.includes(task.stage)) {
      return;
    }
    updatesById[String(task.task_id)] = {
      stage: String(task.stage),
      sort_order: Number(task.sort_order) || 0,
      updated_at: String(task.updated_at || new Date().toISOString())
    };
  });

  const range = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
  const rows = range.getValues();
  rows.forEach((row) => {
    const taskId = String(row[0]);
    const update = updatesById[taskId];
    if (!update) {
      return;
    }
    row[3] = update.stage;
    row[6] = update.sort_order;
    row[8] = update.updated_at;
  });
  range.setValues(rows);
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
