import "dotenv/config";
import axios from "axios";

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const WEBHOOK_URL = "https://vecta.co/api/apollo-webhook";

if (!APOLLO_API_KEY) {
  console.error("APOLLO_API_KEY environment variable is required.");
  process.exit(1);
}

async function revealBenFreemanPhone() {
  try {
    console.log("🔍 Searching via LinkedIn URL for Ben Freeman…");

    const searchResponse = await axios.post(
      "https://api.apollo.io/v1/people/match",
      {
        api_key: APOLLO_API_KEY,
        linkedin_url: "https://www.linkedin.com/in/ben-freeman-a8542166/",
        reveal_personal_emails: true,
        reveal_phone_number: false // just match first
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": APOLLO_API_KEY,
        },
        timeout: 30000,
      }
    );

    console.log("Match Response:", JSON.stringify(searchResponse.data, null, 2));
    
    console.log("Search Response:", JSON.stringify(searchResponse.data, null, 2));
    const personId = searchResponse.data?.person?.id;
    if (!personId) {
      console.error("❌ Could not find Apollo person via LinkedIn URL.");
      return;
    }
    console.log("✅ Found Apollo Person ID:", personId);

    console.log("📞 Now requesting phone reveal tied to this person ID…");
    const revealResponse = await axios.post(
      "https://api.apollo.io/v1/people/enrich",
      {
        person_id: personId,
        reveal_phone_number: true,
        webhook_url: WEBHOOK_URL
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": APOLLO_API_KEY,
        },
        timeout: 30000,
      }
    );

    console.log("Enrich/Reveal Response:", JSON.stringify(revealResponse.data, null, 2));
    console.log("✅ Phone reveal requested. Check webhook and UI.");

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Apollo API error:", error.response?.status, error.response?.statusText);
      console.error(
        "Response body:", 
        JSON.stringify(error.response?.data ?? error.message, null, 2)
      );
    } else {
      console.error("Unexpected error:", error);
    }
    process.exit(1);
  }
}

void revealBenFreemanPhone();
