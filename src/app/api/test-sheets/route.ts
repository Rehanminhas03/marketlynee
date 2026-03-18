import { NextResponse } from "next/server";
import { testGoogleSheetsConnection } from "@/lib/googleSheets";

/**
 * DEBUG ENDPOINT — Test Google Sheets connection
 * Visit: http://localhost:3000/api/test-sheets
 * Remove this file after confirming Google Sheets works
 */
export async function GET() {
  const result = await testGoogleSheetsConnection();

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
