import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import "dotenv/config";

import { SERVICE_ACCOUNT_FILE, SPREADSHEET_ID } from "./mainFile";

export async function getTargetSheets(): Promise<string[]> {
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
        const res = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        });

        let targetSheets: string[] = [];

        res.data.sheets?.forEach((sheet) => {
        const today: Date = new Date();
        let year: string = today.getFullYear().toString().slice(2);
        let month: string = today.getMonth().toString();
        let targetMonth: string = year + "年" + month + "月";
        if (month === "0") {
            targetMonth = "24年12月";
        }
        if (
            sheet.properties?.title &&
            sheet.properties.title.toString().match(targetMonth) !== null
        ) {
            targetSheets.push(sheet.properties.title);
        }
        });

        return targetSheets;
    } catch (err) {
        console.error("エラー:", err);
        return [];
    }
}
