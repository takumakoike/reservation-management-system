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

    const data: any = response.data.values;
    if (!data || data.length === 0) {
        console.log("取得できるデータがありませんでした");
        return;
    }

    // ヘッダー情報の取得
    const headerRowDate = 3; // 4行目 (0始まりで3)
    const headerRowStaff = 5; // 6行目 (0始まりで5)
    const startRow = 6; // データ開始行 (7行目)
    const startCol = 2; // データ開始列 (C列 = 0始まりで2)

    const resulutsByDate: any[] = [];
    for (let col = startCol; col < data[3].length; col++) {
        const date = data[headerRowDate][col];
        const staff = data[headerRowStaff][col];

        for (let row = startRow; row < data.length; row++) {
            const timeInfo = data[row][1];

            if (timeInfo.includes("15分") || timeInfo.includes("ワンコイン") || timeInfo.includes("初無") || timeInfo.includes("980円") || timeInfo.includes("30分") || timeInfo.includes("45分") || timeInfo.includes("R") || timeInfo.includes("売上") || timeInfo.includes("現金入力後") || timeInfo === "") {
                continue;
            }

            const reservation = data[row][col];
            if (!reservation || reservation === "") {
            continue;
            }
            const reservationInformation: Object = { timeInfo , staff , reservation };

            resulutsByDate.push([date, reservationInformation]);
        }
    }

    console.log(resulutsByDate);
    return;

    const timeColumn = 1; // B列 (時間列)
    const dateHeaders = data[headerRowDate];
    const staffHeaders = data[headerRowStaff];

    // 日付別と担当者別のデータ格納用
    const dateResults: { [key: string]: any[] } = {};
    const staffResults: { [key: string]: any[] } = {};

    // データ処理
    for (let row = startRow; row < data.length; row++) {
      const timeValue = data[row][timeColumn]; // B列の値
      console.log(timeValue);
      // 「15分」や「ワンコイン」を含む行をスキップ
      if (
        typeof timeValue === "string" &&
        (timeValue.includes("15分") || timeValue.includes("ワンコイン"))
      ) {
        continue;
      }

      for (let col = startCol; col < data[row].length; col++) {
        const date = dateHeaders[col];
        const staff = staffHeaders[col];
        const reservation = data[row][col];

        // 空白セルをスキップ
        if (!reservation || reservation === "") {
          continue;
        }

        // 日時情報を構築
        const time = data[row][timeColumn]; // B列の時間データ
        const dateTimeInfo = { date, time, staff, reservation };

        // 日付別データに追加
        if (!dateResults[date]) {
          dateResults[date] = [];
        }
        dateResults[date].push(dateTimeInfo);

        // 担当者別データに追加
        if (!staffResults[staff]) {
          staffResults[staff] = [];
        }
        staffResults[staff].push(dateTimeInfo);
      }
    }

    // 結果の確認
    // console.log("日付別データ:");
    console.log(JSON.stringify(dateResults, null, 2));
  } catch (err) {
    console.error("エラー:", err);
  }
}

getOneSpreadsheetData();
