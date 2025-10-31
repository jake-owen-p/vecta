import "dotenv/config";
import axios from "axios";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Types
interface Person {
  role: string;
  name: string;
  linkedinUrl: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  apolloId?: string | null;
}

interface Company {
  name: string;
  description: string | null;
  location: string | null;
  industry: string | null;
  founded: string | null;
  people: Person[];
}

interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email: string | null;
  phone_numbers: Array<{ raw_number: string; sanitized_number: string }>;
  organization: {
    name: string;
  };
  [key: string]: unknown; // Allow additional fields
}


interface ApolloSearchResponse {
  people: ApolloPerson[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// Helper function to wait (rate limiting)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Get webhook URL - use environment variable or default to localhost
function getWebhookUrl(): string {
  return `https://vecta.co/api/apollo-webhook`;
}

// Unlock contact information for a person - use enrich/match endpoint with webhook
// Note: Phone numbers will be sent asynchronously via webhook, not in the direct response
async function unlockContactInfo(
  apiKey: string,
  personId: string,
  email?: string | null
): Promise<void> {
  try {
    const webhookUrl = getWebhookUrl();
    
    // Try using the people/match endpoint with reveal_phone_number and webhook_url
    const requestBody: Record<string, unknown> = {
      api_key: apiKey,
      reveal_phone_number: true,
      webhook_url: webhookUrl,
    };

    // Use email if available, otherwise use person ID
    if (email && email !== "email_not_unlocked@domain.com") {
      requestBody.email = email;
    } else {
      requestBody.person_id = personId;
    }

    console.log(`    Using webhook URL: ${webhookUrl}`);

    const res = await axios.post<ApolloPerson>(
      "https://api.apollo.io/v1/people/match",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "x-api-key": apiKey,
        },
        timeout: 30000,
      }
    );

    console.log(res.data);

    // Note: Phone number will be sent via webhook asynchronously
    // The webhook endpoint will log it when received
    console.log(`    Phone reveal requested - Apollo will send phone number to webhook`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as unknown;
      console.error(
        `Error unlocking contact info for person ${personId}:`,
        error.response?.status,
        error.response?.statusText,
        error.message,
        "\nResponse:",
        JSON.stringify(errorData, null, 2)
      );
    }
  }
}

async function searchApolloPerson(
  apiKey: string,
  name: string,
  companyName: string,
  role: string
): Promise<{
  phoneNumber: string | null;
  email: string | null;
  apolloId: string | null;
  fullPerson?: ApolloPerson;
}> {
  try {
    // Split name into first and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Apollo API request payload
    // Using the format that Apollo API expects
    const requestBody = {
      api_key: apiKey,
      q_keywords: `${firstName} ${lastName} ${companyName}`,
      person_titles: [role],
      organization_names: [companyName],
      per_page: 1,
      page: 1,
      reveal_personal_emails: true, // Unlock personal emails if available
      reveal_phone_number: true, // Unlock phone numbers if available
    };

    const response = await axios.post<ApolloSearchResponse>(
      "https://api.apollo.io/v1/mixed_people/search",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "x-api-key": apiKey,
        },
        timeout: 30000,
      }
    );

    if (response.data?.people && response.data.people.length > 0) {
      const person = response.data.people[0];
      
      if (!person) {
        return {
          phoneNumber: null,
          email: null,
          apolloId: null,
        };
      }
      
      // Get phone number (prefer sanitized)
      const firstPhoneNumber = person.phone_numbers?.[0];
      const phoneNumber =
        firstPhoneNumber
          ? firstPhoneNumber.sanitized_number ?? firstPhoneNumber.raw_number ?? null
          : null;

      // Request phone number unlock via webhook only if we have a phone number
      // Phone numbers come asynchronously via webhook, not in direct response
      const finalEmail = person.email ?? null;
      const finalPhoneNumber = phoneNumber;
      
      // Request phone unlock if we have a phone number (to get verified/unlocked version)
      if (finalPhoneNumber) {
        console.log(`    Phone number found: ${finalPhoneNumber}`);
        console.log(`    Requesting phone unlock for ${person.name} (will be sent via webhook)...`);
        await unlockContactInfo(apiKey, person.id, finalEmail);
      } else {
        console.log(`    No phone number found - skipping unlock request`);
      }

      // Log summary
      console.log(`\n    Summary:`);
      console.log(`      Apollo ID: ${person.id}`);
      console.log(`      Email: ${finalEmail ?? "N/A"}`);
      console.log(`      Phone: ${finalPhoneNumber ?? "N/A (requested via webhook)"}`);
      console.log(`\n    --- End of details for ${person.name} ---\n`);

      return {
        phoneNumber: finalPhoneNumber,
        email: finalEmail,
        apolloId: person.id ?? null,
        fullPerson: person,
      };
    }

    return {
      phoneNumber: null,
      email: null,
      apolloId: null,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const errorMessage = error.message;
      const errorData = error.response?.data as unknown;
      
      // Log full error details for debugging
      if (status === 422) {
        console.error(
          `Error searching for ${name} at ${companyName}:`,
          status,
          statusText,
          "\nResponse data:",
          JSON.stringify(errorData, null, 2)
        );
      } else {
        console.error(
          `Error searching for ${name} at ${companyName}:`,
          status,
          statusText,
          errorMessage
        );
      }
    } else {
      console.error(`Error searching for ${name} at ${companyName}:`, error);
    }
    return {
      phoneNumber: null,
      email: null,
      apolloId: null,
    };
  }
}

async function enrichPortfolioData(apiKey: string) {
  console.log("Reading portfolio data...");
  const portfolioPath = join(process.cwd(), "leadgen", "portfolio-data.json");
  const portfolioData = JSON.parse(
    readFileSync(portfolioPath, "utf-8")
  ) as Company[];

  console.log(`Found ${portfolioData.length} companies`);
  
  const totalPeople = portfolioData.reduce(
    (sum, company) => sum + company.people.length,
    0
  );
  console.log(`Total people to enrich: ${totalPeople}`);

  const enrichedData: Company[] = [];
  let processedCount = 0;
  let foundCount = 0;
  let notFoundCount = 0;

  for (const company of portfolioData) {
    console.log(`\nProcessing company: ${company.name}`);
    const enrichedPeople: Array<Person & {
      fullPerson?: ApolloPerson;
    }> = [];

    for (const person of company.people) {
      processedCount++;
      console.log(
        `  [${processedCount}/${totalPeople}] Searching for ${person.name} (${person.role}) at ${company.name}...`
      );

      const apolloData = await searchApolloPerson(
        apiKey,
        person.name,
        company.name,
        person.role
      );

      if (apolloData.phoneNumber || apolloData.email || apolloData.apolloId) {
        foundCount++;
      } else {
        notFoundCount++;
        console.log(`    ✗ Not found in Apollo`);
      }

      // Add unlocked info to person data if available
      const enrichedPerson = {
        ...person,
        phoneNumber: apolloData.phoneNumber,
        email: apolloData.email,
        apolloId: apolloData.apolloId,
        ...(apolloData.fullPerson && { fullPerson: apolloData.fullPerson }),
      };

      enrichedPeople.push(enrichedPerson);

      // Rate limiting - Apollo API typically allows 120 requests per minute
      // Adding a small delay to be safe (includes unlock call)
      await wait(1000); // 1000ms delay to account for search + unlock calls
    }

    enrichedData.push({
      ...company,
      people: enrichedPeople,
    });
  }

  // Save enriched data
  const outputPath = join(process.cwd(), "leadgen", "portfolio-data-enriched.json");
  writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2), "utf-8");
  console.log(`\n=== Summary ===`);
  console.log(`Total people processed: ${processedCount}`);
  console.log(`Found in Apollo: ${foundCount}`);
  console.log(`Not found: ${notFoundCount}`);
  console.log(`Enriched data saved to: ${outputPath}`);
}

// Main execution
const apiKey = process.env.APOLLO_API_KEY;

if (!apiKey) {
  console.error(
    "Error: APOLLO_API_KEY environment variable is not set."
  );
  console.error(
    "Please set it in your .env file or export it before running the script."
  );
  process.exit(1);
}

enrichPortfolioData(apiKey).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

