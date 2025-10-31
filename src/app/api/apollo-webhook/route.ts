import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Handle GET requests - Apollo may verify webhook endpoint with GET
export async function GET() {
  console.log("Apollo webhook GET request (verification)");
  return NextResponse.json({ 
    success: true,
    message: "Webhook endpoint is active",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    
    // Log the entire webhook payload for debugging
    console.log("Apollo webhook received:");
    console.log(JSON.stringify(body, null, 2));

    // Extract phone number from various possible formats
    let phoneNumber: string | null = null;
    
    if (body && typeof body === "object") {
      const payload = body as Record<string, unknown>;
      
      // Try different possible paths for phone number
      if (payload.phone_number && typeof payload.phone_number === "string") {
        phoneNumber = payload.phone_number;
      } else if (payload.phone && typeof payload.phone === "string") {
        phoneNumber = payload.phone;
      } else if (payload.data && typeof payload.data === "object") {
        const data = payload.data as Record<string, unknown>;
        if (data.phone_number && typeof data.phone_number === "string") {
          phoneNumber = data.phone_number;
        } else if (data.phone && typeof data.phone === "string") {
          phoneNumber = data.phone;
        } else if (data.phone_numbers && Array.isArray(data.phone_numbers)) {
          const phones = data.phone_numbers as Array<{ sanitized_number?: string; raw_number?: string }>;
          if (phones.length > 0) {
            phoneNumber = phones[0]?.sanitized_number ?? phones[0]?.raw_number ?? null;
          }
        }
      } else if (payload.person && typeof payload.person === "object") {
        const person = payload.person as Record<string, unknown>;
        if (person.phone_number && typeof person.phone_number === "string") {
          phoneNumber = person.phone_number;
        } else if (person.phone && typeof person.phone === "string") {
          phoneNumber = person.phone;
        } else if (person.phone_numbers && Array.isArray(person.phone_numbers)) {
          const phones = person.phone_numbers as Array<{ sanitized_number?: string; raw_number?: string }>;
          if (phones.length > 0) {
            phoneNumber = phones[0]?.sanitized_number ?? phones[0]?.raw_number ?? null;
          }
        }
      }
    }

    if (phoneNumber) {
      console.log(`\n📞 Phone number revealed: ${phoneNumber}\n`);
    } else {
      console.log("\n⚠️  No phone number found in webhook payload\n");
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: "Webhook received",
      phoneNumber,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process webhook";
    console.error("Error processing Apollo webhook:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

