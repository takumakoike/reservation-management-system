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
exports.getTargetSheets = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const fs = require("fs");
require("dotenv/config");
const main_1 = require("./main");
function getTargetSheets() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // サービスアカウント認証のセットアップ
        const credentials = JSON.parse(fs.readFileSync(main_1.SERVICE_ACCOUNT_FILE, "utf8"));
        const auth = new google_auth_library_1.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        // Google Sheets APIの初期化
        const sheets = googleapis_1.google.sheets({ version: "v4", auth });
        try {
            // スプレッドシートのデータを取得
            const res = yield sheets.spreadsheets.get({
                spreadsheetId: main_1.SPREADSHEET_ID,
            });
            let targetSheets = [];
            (_a = res.data.sheets) === null || _a === void 0 ? void 0 : _a.forEach((sheet) => {
                var _a;
                // 前月のシートのみ取得する
                const today = new Date();
                let year = today.getFullYear().toString().slice(2);
                let month = today.getMonth().toString();
                let targetMonth = year + "年" + month + "月";
                if (month === "0") {
                    targetMonth = "24年12月";
                }
                if (((_a = sheet.properties) === null || _a === void 0 ? void 0 : _a.title) && sheet.properties.title.toString().match(targetMonth) !== null) {
                    targetSheets.push(sheet.properties.title);
                }
            });
            // console.log(targetSheets);
            return targetSheets;
        }
        catch (err) {
            console.error("エラー:", err);
        }
    });
}
exports.getTargetSheets = getTargetSheets;
