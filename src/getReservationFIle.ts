import { SERVICE_ACCOUNT_FILE, SPREADSHEET_ID } from "./main";
declare var SpreadsheetApp: any;

const sheets = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets();

for (const sheet of sheets) {
    console.log(sheet.getName());
}
