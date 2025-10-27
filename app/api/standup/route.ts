import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CHAT_WEBHOOK = process.env.GOOGLE_CHAT_WEBHOOK_URL;
const APPS_SCRIPT_API = process.env.APPS_SCRIPT_WEB_APP_URL;

/**
 * Send formatted card to Google Chat webhook
 */
async function sendToGoogleChat(data: {
  name: string;
  yesterday: string;
  today: string;
  blockers: string;
}) {
  if (!GOOGLE_CHAT_WEBHOOK) {
    console.error("❌ Google Chat webhook URL not configured");
    return { success: false, error: "Webhook not configured" };
  }

  // Generate thread key for today (all messages today go to same thread)
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const threadKey = `standup-${today}`;

  const message = {
    cardsV2: [
      {
        cardId: "standup-card",
        card: {
          header: {
            title: "📊 Daily Stand-up Update",
            subtitle: `${data.name}`,
            imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/event_available/default/24px.svg",
            imageType: "CIRCLE",
          },
          sections: [
            {
              widgets: [
                {
                  decoratedText: {
                    topLabel: "✅ Yesterday's Progress",
                    text: data.yesterday,
                    wrapText: true,
                  },
                },
              ],
            },
            {
              widgets: [
                {
                  decoratedText: {
                    topLabel: "🎯 Today's Plan",
                    text: data.today,
                    wrapText: true,
                  },
                },
              ],
            },
            {
              widgets: [
                {
                  decoratedText: {
                    topLabel: "🚧 Blockers",
                    text: data.blockers || "None",
                    wrapText: true,
                  },
                },
              ],
            },
          ],
        },
      },
    ],
    // Thread configuration - groups all today's standups together
    thread: {
      threadKey: threadKey,
    },
  };

  try {
    const response = await fetch(GOOGLE_CHAT_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Google Chat error:", response.status, errorText);
      throw new Error(`Google Chat API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error sending to Google Chat:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Save to Google Sheet via Apps Script
 */
async function saveToGoogleSheet(data: {
  name: string;
  email: string;
  yesterday: string;
  today: string;
  blockers: string;
}) {
  if (!APPS_SCRIPT_API) {
    console.error("❌ Apps Script API URL not configured");
    return { success: false, error: "Apps Script not configured" };
  }

  try {
    const response = await fetch(APPS_SCRIPT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      redirect: "follow", // Important for Apps Script redirects
    });

    const responseText = await response.text();

    // Try to parse JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Invalid JSON from Apps Script:", responseText.substring(0, 100));
      return {
        success: false,
        error: `Invalid JSON response from Apps Script`
      };
    }

    if (!result.success) {
      console.error("❌ Apps Script error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error saving to Google Sheet:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get last entry from Google Sheet via Apps Script
 */
async function getLastEntry(email: string) {
  if (!APPS_SCRIPT_API) {
    return null;
  }

  try {
    const url = `${APPS_SCRIPT_API}?email=${encodeURIComponent(email)}`;

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    const responseText = await response.text();
    const result = JSON.parse(responseText);

    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching last entry:", error);
    return null;
  }
}

/**
 * POST endpoint - Submit standup
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, yesterday, today, blockers } = body;

    // Validate required fields
    if (!yesterday || !today) {
      return NextResponse.json(
          { message: "Yesterday and Today fields are required" },
          { status: 400 }
      );
    }

    // Execute both operations in parallel
    const [chatResult, sheetResult] = await Promise.allSettled([
      sendToGoogleChat({
        name: name || "Unknown",
        yesterday,
        today,
        blockers
      }),
      saveToGoogleSheet({
        name: name || "Unknown",
        email: email || "",
        yesterday,
        today,
        blockers,
      }),
    ]);

    // Check if both succeeded
    const chatSuccess = chatResult.status === "fulfilled" && chatResult.value.success;
    const sheetSuccess = sheetResult.status === "fulfilled" && sheetResult.value.success;

    // Get error messages if any
    const chatError = chatResult.status === "fulfilled" ? chatResult.value.error : String(chatResult.reason);
    const sheetError = sheetResult.status === "fulfilled" ? sheetResult.value.error : String(sheetResult.reason);

    if (!chatSuccess && !sheetSuccess) {
      console.error("❌ Both operations failed - Chat:", chatError, "Sheet:", sheetError);
      return NextResponse.json(
          {
            message: "Failed to send to both Google Chat and Sheet",
            errors: { chat: chatError, sheet: sheetError }
          },
          { status: 500 }
      );
    }

    // Log partial failures
    if (!chatSuccess) {
      console.error("⚠️ Chat failed but Sheet succeeded");
    }
    if (!sheetSuccess) {
      console.error("⚠️ Sheet failed but Chat succeeded");
    }

    // Return detailed response
    return NextResponse.json({
      message: chatSuccess && sheetSuccess ? "Stand-up submitted successfully!" : "Stand-up partially submitted",
      chat: { success: chatSuccess, error: chatError },
      sheet: { success: sheetSuccess, error: sheetError },
    });

  } catch (error) {
    console.error("❌ Unexpected error processing stand-up:", error);
    return NextResponse.json(
        {
          message: "Internal Server Error",
          error: String(error)
        },
        { status: 500 }
    );
  }
}

/**
 * GET endpoint - Retrieve last entry
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
          { message: "Email parameter required" },
          { status: 400 }
      );
    }

    const lastEntry = await getLastEntry(email);

    if (!lastEntry) {
      return NextResponse.json(
          { message: "No previous entries found", data: null },
          { status: 200 }
      );
    }

    return NextResponse.json({
      message: "Last entry retrieved",
      data: lastEntry
    });
  } catch (error) {
    console.error("❌ Error retrieving last entry:", error);
    return NextResponse.json(
        {
          message: "Internal Server Error",
          error: String(error)
        },
        { status: 500 }
    );
  }
}