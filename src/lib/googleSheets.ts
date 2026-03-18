import { google } from "googleapis";

const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mls: string;
  licenseNumber: string;
  city: string;
  state: string;
  primaryArea: string;
  primaryRadius: string;
  secondaryArea: string;
  secondaryRadius: string;
  accountManager: string;
  selectedPlan: string;
  billingAddress: string;
  shippingAddress: string;
}

/**
 * Append a row to the Google Sheet with onboarding data
 * Returns { success: boolean, error?: string } for better diagnostics
 */
export async function appendToGoogleSheet(
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  // Check which credentials are missing
  const missing: string[] = [];
  if (!GOOGLE_SHEETS_CLIENT_EMAIL) missing.push("GOOGLE_SHEETS_CLIENT_EMAIL");
  if (!GOOGLE_SHEETS_PRIVATE_KEY) missing.push("GOOGLE_SHEETS_PRIVATE_KEY");
  if (!GOOGLE_SHEETS_SPREADSHEET_ID) missing.push("GOOGLE_SHEETS_SPREADSHEET_ID");

  if (missing.length > 0) {
    const msg = `Google Sheets not configured. Missing: ${missing.join(", ")}`;
    console.warn(msg);
    return { success: false, error: msg };
  }

  try {
    // Create auth client
    const auth = new google.auth.JWT({
      email: GOOGLE_SHEETS_CLIENT_EMAIL,
      key: GOOGLE_SHEETS_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Format timestamp
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Prepare row data (must match header order in spreadsheet)
    const rowData = [
      timestamp,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.mls,
      data.licenseNumber,
      data.city,
      data.state,
      data.primaryArea,
      data.primaryRadius,
      data.secondaryArea,
      data.secondaryRadius,
      data.accountManager || "N/A",
      data.selectedPlan,
      data.billingAddress,
      data.shippingAddress,
    ];

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Sheet1!A:Q", // Columns A through Q
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    });

    console.log("Successfully appended to Google Sheet");
    return { success: true };
  } catch (error: unknown) {
    let errorMsg = "Unknown error";
    if (error instanceof Error) {
      errorMsg = error.message;
      // Log Google API specific error details
      const apiError = error as { code?: number; errors?: unknown[] };
      if (apiError.code) {
        console.error("Google Sheets API Error Code:", apiError.code);
        errorMsg = `[${apiError.code}] ${errorMsg}`;
      }
      if (apiError.errors) {
        console.error(
          "Google Sheets API Error Details:",
          JSON.stringify(apiError.errors)
        );
      }
    }
    console.error("Error appending to Google Sheet:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Test Google Sheets connection — validates credentials & sheet access
 */
export async function testGoogleSheetsConnection(): Promise<{
  success: boolean;
  details: Record<string, unknown>;
}> {
  const missing: string[] = [];
  if (!GOOGLE_SHEETS_CLIENT_EMAIL) missing.push("GOOGLE_SHEETS_CLIENT_EMAIL");
  if (!GOOGLE_SHEETS_PRIVATE_KEY) missing.push("GOOGLE_SHEETS_PRIVATE_KEY");
  if (!GOOGLE_SHEETS_SPREADSHEET_ID) missing.push("GOOGLE_SHEETS_SPREADSHEET_ID");

  if (missing.length > 0) {
    return {
      success: false,
      details: {
        error: "Missing environment variables",
        missing,
      },
    };
  }

  try {
    const auth = new google.auth.JWT({
      email: GOOGLE_SHEETS_CLIENT_EMAIL,
      key: GOOGLE_SHEETS_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Test authentication
    await auth.authorize();

    const sheets = google.sheets({ version: "v4", auth });

    // Test spreadsheet access — get metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    const sheetNames =
      spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

    return {
      success: true,
      details: {
        spreadsheetTitle: spreadsheet.data.properties?.title,
        sheetNames,
        serviceAccount: GOOGLE_SHEETS_CLIENT_EMAIL,
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        hasSheet1: sheetNames.includes("Sheet1"),
      },
    };
  } catch (error: unknown) {
    let errorMsg = "Unknown error";
    let errorCode: number | undefined;
    if (error instanceof Error) {
      errorMsg = error.message;
      const apiError = error as { code?: number };
      errorCode = apiError.code;
    }
    return {
      success: false,
      details: {
        error: errorMsg,
        code: errorCode,
        serviceAccount: GOOGLE_SHEETS_CLIENT_EMAIL,
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      },
    };
  }
}
