import "dotenv/config";
import axios from "axios";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Types
interface Company {
  name: string;
  description: string | null;
  location: string | null;
  industry: string | null;
  founded: string | null;
  people: Array<{
    role: string;
    name: string;
    linkedinUrl: string | null;
  }>;
}

interface ApolloOrganization {
  id: string;
  name: string;
  website_url: string | null;
  blog_url: string | null;
  angellist_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  primary_phone: {
    number: string;
    source: string;
  } | null;
  languages: string[];
  alexa_ranking: number | null;
  phone: string | null;
  linkedin_uid: string | null;
  founded_year: number | null;
  publicly_traded_symbol: string | null;
  publicly_traded_exchange: string | null;
  logo_url: string | null;
  crunchbase_url: string | null;
  primary_domain: string | null;
  sanitized_phone: string | null;
  industry: string | null;
  keywords: string[];
  estimated_num_employees: number | null;
  industries: string[];
  secondary_industries: string[];
  snippets_loaded: boolean;
  industry_tag_id: string | null;
  retail_location_count: number | null;
  raw_address: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  owned_by_organization_id: string | null;
  suborganizations_count: number | null;
  num_suborganizations: number | null;
  headquarters_organization_id: string | null;
  is_ultimate_headquarters: boolean | null;
  account_id: string | null;
  account: {
    id: string;
    name: string;
  } | null;
  department: string | null;
  departments: string[];
  num_employees_ranges: string[];
  funding_events: Array<{
    id: string;
    funding_type: string;
    funding_date: string;
    funding_amount: number | null;
    currency: string | null;
    series: string | null;
  }>;
  technology_names: string[];
  current_technologies: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  account_phone_numbers: Array<{
    raw_number: string;
    sanitized_number: string;
    type: string;
    position: number;
  }>;
  account_phone_numbers_linked_to_people: Array<{
    raw_number: string;
    sanitized_number: string;
    type: string;
    position: number;
  }>;
  account_phone_number: string | null;
  account_phone_numbers_v2: Array<{
    raw_number: string;
    sanitized_number: string;
    type: string;
    position: number;
  }>;
  account_linked_phone_numbers: Array<{
    raw_number: string;
    sanitized_number: string;
    type: string;
    position: number;
  }>;
  success: boolean;
}

interface ApolloOrganizationSearchResponse {
  organizations: ApolloOrganization[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// Helper function to wait (rate limiting)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Normalize organization name for deduplication
function normalizeOrgName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

// Unlock contact information for an organization or person
async function unlockContactInfo(
  apiKey: string,
  objectId: string,
  objectType: "organization" | "person"
): Promise<{
  emails?: Array<{ email: string; email_status: string }>;
  phone_numbers?: Array<{ raw_number: string; sanitized_number: string }>;
} | null> {
  try {
    const requestBody = {
      api_key: apiKey,
      id: objectId,
      object_type: objectType,
    };

    const response = await axios.post(
      "https://api.apollo.io/v1/contacts/unlock",
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

    return response.data as {
      emails?: Array<{ email: string; email_status: string }>;
      phone_numbers?: Array<{ raw_number: string; sanitized_number: string }>;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Error unlocking contact info for ${objectType} ${objectId}:`,
        error.response?.status,
        error.response?.statusText,
        error.message
      );
    }
    return null;
  }
}

async function searchApolloOrganization(
  apiKey: string,
  organizationName: string
): Promise<ApolloOrganization | null> {
  try {
    const requestBody = {
      api_key: apiKey,
      organization_names: [organizationName],
      per_page: 1,
      page: 1,
      reveal_personal_emails: true, // Unlock personal emails if available
      reveal_phone_number: true, // Unlock phone numbers if available
    };

    const response = await axios.post<ApolloOrganizationSearchResponse>(
      "https://api.apollo.io/api/v1/organizations/search",
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

    // Print full API response for debugging
    console.log(`\n  API Response for "${organizationName}":`);
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`\n  --- End of API response ---\n`);

    if (response.data?.organizations && response.data.organizations.length > 0) {
      return response.data.organizations[0] ?? null;
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const errorMessage = error.message;
      const errorData = error.response?.data as unknown;

      // Log full error details for debugging
      if (status === 422) {
        console.error(
          `Error searching for organization ${organizationName}:`,
          status,
          statusText,
          "\nResponse data:",
          JSON.stringify(errorData, null, 2)
        );
      } else {
        console.error(
          `Error searching for organization ${organizationName}:`,
          status,
          statusText,
          errorMessage
        );
      }
    } else {
      console.error(`Error searching for organization ${organizationName}:`, error);
    }
    return null;
  }
}

async function deduplicateAndEnrichOrganizations(apiKey: string) {
  console.log("Reading portfolio data...");
  const portfolioPath = join(process.cwd(), "leadgen", "portfolio-data.json");
  const portfolioData = JSON.parse(
    readFileSync(portfolioPath, "utf-8")
  ) as Company[];

  console.log(`Found ${portfolioData.length} companies in portfolio data`);

  // Deduplicate organizations by name
  console.log("\nDeduplicating organizations...");
  const uniqueOrgNames = new Map<string, string>(); // normalized -> original

  for (const company of portfolioData) {
    const normalizedName = normalizeOrgName(company.name);
    if (!uniqueOrgNames.has(normalizedName)) {
      uniqueOrgNames.set(normalizedName, company.name);
    }
  }

  const uniqueNames = Array.from(uniqueOrgNames.values());
  console.log(`Found ${uniqueNames.length} unique organizations`);

  // Search Apollo for each organization
  console.log("\nSearching Apollo API for organization details...");
  const enrichedOrganizations: ApolloOrganization[] = [];
  let foundCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < uniqueNames.length; i++) {
    const orgName = uniqueNames[i] ?? "";
    const progress = `[${i + 1}/${uniqueNames.length}]`;
    console.log(`${progress} Searching for: ${orgName}...`);

    const apolloOrg = await searchApolloOrganization(apiKey, orgName);

    if (apolloOrg) {
      foundCount++;
      
      // Unlock contact information (emails and phone numbers)
      console.log(`  Unlocking contact information for ${apolloOrg.name}...`);
      const unlockedInfo = await unlockContactInfo(apiKey, apolloOrg.id, "organization");
      
      if (unlockedInfo) {
        console.log(`  ✓ Unlocked contact info:`);
        if (unlockedInfo.emails && unlockedInfo.emails.length > 0) {
          console.log(`    Emails:`, JSON.stringify(unlockedInfo.emails, null, 2));
          // Add unlocked emails to organization object
          (apolloOrg as unknown as Record<string, unknown>).unlocked_emails = unlockedInfo.emails;
        }
        if (unlockedInfo.phone_numbers && unlockedInfo.phone_numbers.length > 0) {
          console.log(`    Phone Numbers:`, JSON.stringify(unlockedInfo.phone_numbers, null, 2));
          // Add unlocked phone numbers to organization object
          (apolloOrg as unknown as Record<string, unknown>).unlocked_phone_numbers = unlockedInfo.phone_numbers;
        }
      } else {
        console.log(`    No additional contact info to unlock (or already unlocked)`);
      }
      
      enrichedOrganizations.push(apolloOrg);
      console.log(`  ✓ Found: ${apolloOrg.name} (ID: ${apolloOrg.id})`);
      console.log(`\n  Full organization details:`);
      console.log(JSON.stringify(apolloOrg, null, 2));
      console.log(`\n  --- End of details for ${apolloOrg.name} ---\n`);
      
      // Rate limiting between unlock and next search
      await wait(500);
    } else {
      notFoundCount++;
      console.log(`  ✗ Not found in Apollo`);
      
      // Rate limiting - Apollo API typically allows 120 requests per minute
      await wait(500); // 500ms delay = ~120 requests per minute
    }
  }

  // Save enriched data
  const outputPath = join(
    process.cwd(),
    "leadgen",
    "organizations-enriched.json"
  );
  writeFileSync(
    outputPath,
    JSON.stringify(enrichedOrganizations, null, 2),
    "utf-8"
  );

  console.log("\n=== Summary ===");
  console.log(`Total unique organizations: ${uniqueNames.length}`);
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

deduplicateAndEnrichOrganizations(apiKey).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

