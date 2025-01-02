// 外部モジュール
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import "dotenv/config";

// 自作ファイルからのインポート
import { getTargetSheets } from "./getSheetInfo";

// サービスアカウントの秘密鍵ファイルパス
export const SERVICE_ACCOUNT_FILE: string = "./spreadsheetcustomize-0977adcda7df.json";
// スプレッドシートIDと範囲
export const SPREADSHEET_ID = process.env.RESERVATION_FILE_ID;

async function getSpreadsheetData() {
    const targetSheets = await getTargetSheets();
    if (!targetSheets || targetSheets.length === 0) {
        throw new Error("No target sheets found");
    }

    // サービスアカウント認証のセットアップ
    const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf8"));
    const auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Google Sheets APIの初期化
    const sheets = google.sheets({ version: "v4", auth });

    try {
        for (const targetSheet of targetSheets) {
        // スプレッドシートのデータを取得
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: targetSheet,
        });

        // データを表示
        const rows = response.data.values;
        if (rows && rows.length > 0) {
            console.log("データ取得成功:");
            rows.forEach((row) => {
            console.log(row);
            });
        } else {
            console.log("データが見つかりませんでした。");
        }
        }
    } catch (err) {
        console.error("エラー:", err);
    }
}

getSpreadsheetData();
