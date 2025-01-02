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
exports.SPREADSHEET_ID = exports.SERVICE_ACCOUNT_FILE = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const fs = require("fs");
require("dotenv/config");
const getSheetInfo_1 = require("./getSheetInfo");
// サービスアカウントの秘密鍵ファイルパス
exports.SERVICE_ACCOUNT_FILE = "./spreadsheetcustomize-0977adcda7df.json";
// スプレッドシートIDと範囲
exports.SPREADSHEET_ID = process.env.RESERVATION_FILE_ID;
function getSpreadsheetData() {
    return __awaiter(this, void 0, void 0, function* () {
        const targetSheets = yield (0, getSheetInfo_1.getTargetSheets)();
        if (!targetSheets || targetSheets.length === 0) {
            throw new Error('No target sheets found');
        }
        // サービスアカウント認証のセットアップ
        const credentials = JSON.parse(fs.readFileSync(exports.SERVICE_ACCOUNT_FILE, 'utf8'));
        const auth = new google_auth_library_1.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        // Google Sheets APIの初期化
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        try {
            console.log(targetSheets);
            // スプレッドシートのデータを取得
            const response = yield sheets.spreadsheets.values.get({
                spreadsheetId: exports.SPREADSHEET_ID,
                range: targetSheets[0]
            });
            // データを表示
            const rows = response.data.values;
            if (rows && rows.length > 0) {
                console.log('データ取得成功:');
                rows.forEach((row) => {
                    console.log(row);
                });
            }
            else {
                console.log('データが見つかりませんでした。');
            }
        }
        catch (err) {
            console.error('エラー:', err);
        }
    });
}
getSpreadsheetData();