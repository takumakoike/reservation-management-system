"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const sheets = SpreadsheetApp.openById(main_1.SPREADSHEET_ID).getSheets();
for (const sheet of sheets) {
    console.log(sheet.getName());
}
