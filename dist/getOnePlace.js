"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// 外部モジュール
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const fs = require("fs");
require("dotenv/config");
// 自作ファイルからのインポート
const getSheetInfo_1 = require("./getSheetInfo");
const mainFile_1 = require("./mainFile");
function getOneSpreadsheetData() {
    return __awaiter(this, void 0, void 0, function* () {
        const targetSheets = yield (0, getSheetInfo_1.getTargetSheets)();
        if (!targetSheets || targetSheets.length === 0) {
            throw new Error("No target sheets found");
        }
        // サービスアカウント認証のセットアップ
        const credentials = JSON.parse(fs.readFileSync(mainFile_1.SERVICE_ACCOUNT_FILE, "utf8"));
        const auth = new google_auth_library_1.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        // Google Sheets APIの初期化
        const sheets = googleapis_1.google.sheets({ version: "v4", auth });
        try {
            // スプレッドシートのデータを取得
            const response = yield sheets.spreadsheets.values.get({
                spreadsheetId: mainFile_1.SPREADSHEET_ID,
                range: targetSheets[1],
            });
            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                console.log("取得できるデータがありませんでした");
                return;
            }
            const dates = rows[3].slice(2);
            const staff = rows[5].slice(2);
            // 日付データ
            const dateData = {};
            // スタッフデータ
            const staffData = {};
            for (let rowIndex = 6; rowIndex < rows.length; rowIndex++) {
                const time = rows[rowIndex][1]; // 1列目（時間）
                console.log(typeof (time));
                for (let colIndex = 2; colIndex < rows[rowIndex].length; colIndex++) {
                    const reservation = rows[rowIndex][colIndex];
                    if (!reservation)
                        continue; // 空白セルをスキップ
                    const date = dates[colIndex - 2];
                    const person = staff[colIndex - 2];
                    // 日付ごとのデータを構築
                    if (!dateData[date])
                        dateData[date] = {};
                    if (!dateData[date][time])
                        dateData[date][time] = [];
                    dateData[date][time].push(reservation);
                    // 担当者ごとのデータを構築
                    if (!staffData[person])
                        staffData[person] = {};
                    if (!staffData[person][time])
                        staffData[person][time] = [];
                    staffData[person][time].push(reservation);
                }
            }
            console.log("日付ごとのデータ：", dateData);
            console.log("スタッフごとのデータ：", staffData);
        }
        catch (err) {
            console.error("エラー:", err);
        }
    });
}
getOneSpreadsheetData();
