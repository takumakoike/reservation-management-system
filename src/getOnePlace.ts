// 外部モジュール
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import "dotenv/config";

// 自作ファイルからのインポート
import { getTargetSheets } from "./getSheetInfo";
import { SERVICE_ACCOUNT_FILE, SPREADSHEET_ID } from "./mainFile";


async function getOneSpreadsheetData() {
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
        // スプレッドシートのデータを取得
        const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: targetSheets[1],
        });

        const rows = response.data.values;
        if(!rows || rows.length === 0){
            console.log("取得できるデータがありませんでした");
            return;
        }

        const dates: any = rows[3].slice(2);
        const staff: any = rows[5].slice(2);

        // 日付データ
        const dateData: {[date: string]: {[time: string]: string[]} }= {};
        // スタッフデータ
        const staffData: {[staff: string]: {[time: string]: string[]} }= {}
        
        for (let rowIndex = 6; rowIndex < rows.length; rowIndex++) {

            const time = rows[rowIndex][1]; // 1列目（時間）
            console.log(typeof(time))


                for (let colIndex = 2; colIndex < rows[rowIndex].length; colIndex++) {
                    const reservation = rows[rowIndex][colIndex];
                    if (!reservation) continue; // 空白セルをスキップ
        
                    const date = dates[colIndex - 2];
                    const person = staff[colIndex - 2];
        
                    // 日付ごとのデータを構築
                    if (!dateData[date]) dateData[date] = {};
                    if (!dateData[date][time]) dateData[date][time] = [];
                    dateData[date][time].push(reservation);
        
                    // 担当者ごとのデータを構築
                    if (!staffData[person]) staffData[person] = {};
                    if (!staffData[person][time]) staffData[person][time] = [];
                    staffData[person][time].push(reservation);
            }
        }

        console.log("日付ごとのデータ：", dateData)
        console.log("スタッフごとのデータ：", staffData)

    } catch (err) {
        console.error("エラー:", err);
    }
}

getOneSpreadsheetData();
