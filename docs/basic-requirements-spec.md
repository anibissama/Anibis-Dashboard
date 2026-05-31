# ToDoList Dashboard 規劃書

## 1. 文件資訊

- 產品名稱：ToDoList Dashboard
- 目前版本：0.4.1
- 專案來源：`anibissama/Anibis-Dashboard`
- 文件日期：2026-05-31
- 狀態：已完成 MVP，持續迭代中

## 2. 專案背景

原始 `Anibis-Dashboard` 是一個靜態單頁 dashboard，用於展示任務欄位與狀態資訊。這次專案已將它升級為可部署到 GitHub Pages 的 ToDoList Dashboard，並加入遠端資料儲存、任務新增、編輯、刪除、拖曳排序與響應式版面。

目前 dashboard 保持靜態前端架構，部署在 GitHub Pages；任務資料透過 Apps Script API 讀寫遠端資料表。前端仍保留 `tasks.json` 作為 fallback，避免遠端資料讀取失敗時畫面空白。

## 3. 目標

- 建立可在 GitHub Pages 使用的任務管理 dashboard。
- 支援五個工作流階段：Idea、Discussion、Waiting、Executing、Completed。
- 支援任務新增、編輯、刪除、拖曳移動與排序保存。
- 支援桌機、平板、手機不同版面呈現。
- 保留狀態資訊，但避免讓使用者誤解資料同步時間。

## 4. 使用者與需求

| 使用者類型 | 說明 | 主要需求 |
| --- | --- | --- |
| 主要使用者 | 個人專案管理者 | 快速檢視與整理任務 |
| 協作者 | 查看進度的人 | 理解哪些任務待討論、執行中或已完成 |
| 維護者 | 管理部署與資料的人 | 更新前端、Apps Script 與遠端資料 |

## 5. 已完成範圍

- GitHub Pages 靜態部署。
- Apps Script API 作為遠端資料讀寫層。
- 遠端資料表儲存任務資料。
- `tasks.json` fallback 資料。
- 從舊版 GitHub dashboard 複製既有任務，包含已完成任務。
- 新增任務 modal。
- 編輯任務 modal。
- 刪除任務確認流程。
- 拖曳 task card 到不同欄位。
- 拖曳後保存 `stage` 與 `sort_order`。
- 上方橫幅顯示系統狀態。
- footer 顯示版本與狀態檔更新時間。
- 移除使用者可見的特定儲存服務字樣，改用中性文案。
- 桌機、平板、手機 responsive 版面。

## 6. 暫不包含

- 使用者登入與權限分級。
- 多人即時同步。
- 任務留言、附件、子任務、提醒與日曆整合。
- 進階報表或圖表。
- 編輯歷史紀錄。
- 防止知道 API URL 的人寫入資料的 token 機制。

## 7. 系統架構

```text
GitHub Pages
  - index.html
  - status.json
  - tasks.json fallback
        |
        | fetch / POST
        v
Apps Script Web App
  - GET tasks
  - create_task
  - edit_task
  - delete_task
  - update_tasks
        |
        v
Remote task table
```

## 8. 資料欄位

| 欄位 | 類型 | 必填 | 說明 |
| --- | --- | --- | --- |
| task_id | String | 是 | 任務唯一識別碼 |
| title | String | 是 | 任務標題 |
| description | String | 否 | 任務描述 |
| stage | String | 是 | `idea`、`discussion`、`waiting`、`executing`、`completed` |
| priority | String | 是 | `low`、`medium`、`high` |
| category | String | 否 | 分類或來源 |
| sort_order | Number | 是 | 同欄位中的排序 |
| created_at | DateTime | 是 | 建立時間 |
| updated_at | DateTime | 是 | 更新時間 |

## 9. 功能需求

| ID | 需求 | 狀態 |
| --- | --- | --- |
| FR-001 | 顯示五個工作流欄位 | 已完成 |
| FR-002 | 從遠端資料來源載入 task | 已完成 |
| FR-003 | 遠端失敗時使用 `tasks.json` fallback | 已完成 |
| FR-004 | 新增 task | 已完成 |
| FR-005 | 編輯 task | 已完成 |
| FR-006 | 刪除 task | 已完成 |
| FR-007 | 拖曳 task 到不同欄位 | 已完成 |
| FR-008 | 拖曳後保存 stage/order | 已完成 |
| FR-009 | 顯示系統狀態橫幅 | 已完成 |
| FR-010 | footer 顯示版本與狀態檔更新時間 | 已完成 |
| FR-011 | 桌機/平板/手機 responsive 呈現 | 已完成 |

## 10. 畫面規格

### Header

- 顯示產品名稱與簡短說明。
- 右側只有 `Add Task` 按鈕。
- 不顯示版本與狀態更新時間。

### Status Banner

- 橫幅顯示系統狀態、token、GitHub 狀態、任務數量、儲存狀態與裝置類型。
- 使用中性文案，不顯示特定儲存服務名稱。

### Board

- Desktop：五欄橫向排列，不足時水平捲動。
- Tablet：自動多欄排列。
- Mobile：單欄排列，避免文字溢出。

### Task Card

- 顯示 title、description、priority、category、updated date。
- 支援 `Edit` 與 `Delete` 按鈕。
- 文字可換行，避免超出卡片邊界。

### Add/Edit Modal

- `Add Task` 開啟 modal。
- 編輯任務時同一個 modal 會載入既有資料。
- 欄位：title、description、stage、priority、category。
- 新增或編輯成功後關閉 modal。

## 11. API 規格

### GET

讀取所有任務。

```json
{
  "ok": true,
  "tasks": []
}
```

### POST `create_task`

新增任務。

```json
{
  "action": "create_task",
  "task": {}
}
```

### POST `edit_task`

更新任務內容。

```json
{
  "action": "edit_task",
  "task": {}
}
```

### POST `delete_task`

刪除任務。

```json
{
  "action": "delete_task",
  "task_id": "task-id"
}
```

### POST `update_tasks`

批次更新拖曳後的階段與排序。

```json
{
  "action": "update_tasks",
  "tasks": [
    {
      "task_id": "task-id",
      "stage": "idea",
      "sort_order": 0,
      "updated_at": "2026-05-31T00:00:00.000Z"
    }
  ]
}
```

## 12. 驗證規則

| 欄位或動作 | 規則 |
| --- | --- |
| title | 必填，最多 120 字 |
| description | 最多 500 字 |
| stage | 必須是允許的工作流階段 |
| priority | 必須是 `low`、`medium`、`high` |
| delete | 前端必須先顯示確認 |
| drag | 只能放入合法欄位 |

## 13. 狀態與錯誤處理

| 狀態 | 行為 |
| --- | --- |
| 遠端讀取成功 | 顯示遠端資料 |
| 遠端讀取失敗 | 顯示錯誤提示並使用 fallback |
| 新增成功 | 重新載入資料並關閉 modal |
| 編輯成功 | 重新載入資料並關閉 modal |
| 刪除成功 | 重新載入資料 |
| 拖曳保存失敗 | 回復到前一個狀態 |
| 空欄位 | 顯示 empty state 並允許拖曳放入 |

## 14. 驗收紀錄

- Apps Script `GET` 已驗證可讀取任務。
- `create_task` 已驗證可新增任務。
- `edit_task` 已驗證可更新任務。
- `delete_task` 已驗證可刪除任務。
- 舊版 GitHub dashboard 11 筆任務已複製到遠端資料來源。
- 舊版任務中已完成任務 3 筆已保留。
- GitHub Pages `main` 已推送多次版本更新。
- 前端 JS 語法檢查通過。
- `status.json` JSON 解析通過。
- 本機 HTTP 首頁與 `status.json` 回傳 `200`。

## 15. 部署與維護

- 前端部署：GitHub Pages。
- 前端 repo：`anibissama/Anibis-Dashboard`。
- Apps Script 變更後必須重新部署 Web App 新版本，單純儲存不會更新 `/exec` 端點。
- `status.json` 的 `last_sync` 已改以 footer 的 `Status updated` 呈現，代表狀態檔更新時間，不代表任務資料同步時間。
- 實際資料表 ID 不應提交到公開 repo。

## 16. 風險與後續建議

| 風險 | 影響 | 建議 |
| --- | --- | --- |
| API URL 可被知道連結的人呼叫 | 可能被非預期使用者新增或刪除資料 | 下一版加入簡單 token |
| Apps Script 未重新部署 | 前端功能與 API 功能不一致 | 更新 `Code.gs` 後一定要 deploy new version |
| 遠端服務暫時不可用 | 任務無法即時讀寫 | 保留 fallback 與錯誤提示 |
| 刪除沒有復原機制 | 誤刪後只能從資料表或歷史找回 | 下一版可加入 soft delete |

## 17. 目前版本摘要

- `0.1.0`：建立 ToDoList Dashboard MVP 規格。
- `0.2.0`：加入遠端資料讀寫架構與 Apps Script。
- `0.3.0`：調整 responsive layout、狀態橫幅與新增 modal。
- `0.4.0`：加入 task 編輯與刪除。
- `0.4.1`：整理 footer metadata，移除頁面可見的特定儲存服務字樣。
