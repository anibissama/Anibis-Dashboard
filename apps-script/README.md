# Apps Script Setup

This dashboard can run on GitHub Pages while storing task data in Google Sheet through Apps Script.

The current API supports:

- `GET`: read tasks
- `POST create_task`: create a task
- `POST edit_task`: edit a task
- `POST delete_task`: delete a task
- `POST update_tasks`: update stage/order after drag and drop

## 1. Create the Sheet

1. Open Google Drive with the account you want to use.
2. Create a Google Sheet named `ToDoList Dashboard Data`.
3. Rename the first sheet tab to `Tasks`.
4. Add this header row:

```text
task_id,title,description,stage,priority,category,sort_order,created_at,updated_at
```

You can paste the sample rows from `tasks.json` if you want initial data.

## 2. Add Apps Script

1. In the Sheet, open `Extensions > Apps Script`.
2. Replace the default script with `apps-script/Code.gs`.
3. Save the project.
4. Run `doGet` once and approve permissions when prompted.

If you created the Apps Script project from `script.google.com/home` instead of from the Sheet, set `SPREADSHEET_ID` at the top of `Code.gs`.

Example:

```js
const SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID";
```

The Sheet ID is the long value in the Sheet URL:

```text
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

## 3. Deploy the Web App

1. Click `Deploy > New deployment`.
2. Select `Web app`.
3. Set `Execute as` to `Me`.
4. Set access to `Anyone with the link`.
5. Deploy and copy the Web App URL ending in `/exec`.

When `Code.gs` changes, update the script, then use `Deploy > Manage deployments > Edit > New version > Deploy`. Saving the script is not enough for the Web App URL to use the new code.

## 4. Connect the Dashboard

1. Open `index.html`.
2. Replace:

```js
const TASK_API_URL = "";
```

with:

```js
const TASK_API_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";
```

3. Commit and push the dashboard to GitHub Pages.

## Notes

- Keep API writes in Apps Script. Do not place Google secrets in `index.html`.
- The first version allows anyone with the Web App URL to write tasks.
- If you redeploy Apps Script after editing, use the latest Web App deployment URL.
