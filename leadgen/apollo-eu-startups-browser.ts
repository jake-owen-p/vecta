import "dotenv/config";
import { connect } from "puppeteer-real-browser";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

type RealBrowserPage = Awaited<ReturnType<typeof connect>>["page"];

interface EuStartupListing {
  name: string | null;
  detailUrl: string;
  summary: string | null;
  featuredImage: string | null;
  fields: Record<string, string | null>;
  socialLinks: string[];
}

interface EuStartupDataset {
  generatedAt: string;
  lastUpdatedAt: string;
  source: string;
  filter: Record<string, unknown>;
  pagesVisited: Array<Record<string, unknown>>;
  totalListings: number;
  listings: EuStartupListing[];
}

interface BaseContact {
  name: string;
  title: string;
  organization: string | null;
  location: string | null;
  linkedinUrl: string | null;
  apolloContactUrl: string | null;
  apolloId: string | null;
}

interface MatchedContact extends BaseContact {
  role: string;
}

interface PortfolioPerson {
  role: string;
  name: string;
  linkedinUrl: string | null;
}

interface PortfolioCompany {
  name: string;
  description: string | null;
  location: string | null;
  industry: string | null;
  founded: string | null;
  people: PortfolioPerson[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const OUTPUT_FILENAME = "eu-startups-portfolio-data-2023.json";

function inferRole(title: string): string | null {
  const normalizedTitle = title.toLowerCase();
  const includes = (value: string) => normalizedTitle.includes(value);

  if (includes("cto") || includes("chief technology officer") || includes("chief technical officer")) {
    return "CTO";
  }

  if (includes("head of engineering") || includes("head engineering") || (includes("head") && includes("engineering"))) {
    return "Head of Engineering";
  }

  if (
    (includes("vice president") && includes("engineering")) ||
    includes("vp of engineering") ||
    includes("svp of engineering") ||
    includes("vp engineering") ||
    includes("svp engineering")
  ) {
    return "VP of Engineering";
  }

  if (
    includes("talent acquisition") ||
    includes("talent aquisition") ||
    (includes("talent") && includes("acquisition")) ||
    includes(" ta ") ||
    normalizedTitle.startsWith("ta ") ||
    normalizedTitle.endsWith(" ta")
  ) {
    return "Talent Acquisition";
  }

  if (includes("co-founder") || includes("cofounder") || includes("co founder")) {
    return "Cofounder";
  }

  if (includes("founder")) {
    return "Founder";
  }

  if (includes("ceo") || includes("chief executive officer")) {
    return "CEO";
  }

  return null;
}

function getFieldValue(listing: EuStartupListing, keys: string[]): string | null {
  for (const key of keys) {
    const value = listing.fields?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function buildPortfolioEntry(
  listing: EuStartupListing,
  people: MatchedContact[]
): PortfolioCompany {
  const description = listing.summary?.trim() ||
    getFieldValue(listing, ["Description", "About", "Overview"]);

  const location =
    getFieldValue(listing, ["Based in", "Location", "Headquarters", "Headquarters Location"]) ||
    getFieldValue(listing, ["Country", "Country/Region"]) ||
    null;

  const industry = getFieldValue(listing, ["Industry", "Sector", "Category", "Categories"]);

  const founded = getFieldValue(listing, ["Founded", "Founded Year", "Year Founded"]);

  const seen = new Set<string>();
  const uniquePeople: PortfolioPerson[] = [];

  for (const person of people) {
    const trimmedName = person.name.trim();
    if (!trimmedName) {
      continue;
    }

    const key = `${person.role.toLowerCase()}::${trimmedName.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniquePeople.push({
      role: person.role,
      name: trimmedName,
      linkedinUrl: person.linkedinUrl ?? null,
    });
  }

  return {
    name: listing.name?.trim() ?? "",
    description: description ?? null,
    location,
    industry: industry ?? null,
    founded: founded ?? null,
    people: uniquePeople,
  };
}

function normalizeCompanyName(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(ltd|limited|inc|co|company|gmbh|s\.?a\.?|sarl|bv|ab|oy|ag|ug|sas|sl)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDomain(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch (error) {
    return value.replace(/^www\./, "").toLowerCase();
  }
}

function extractWebsite(listing: EuStartupListing): string | null {
  const websiteField = listing.fields?.["Website"] ?? listing.fields?.["website"] ?? null;
  if (!websiteField) {
    return null;
  }

  return websiteField.trim() || null;
}

function readEuStartupsData(): EuStartupListing[] {
  const inputPath = join(process.cwd(), "leadgen", "eu-startups-listings-2023.json");
  const raw = readFileSync(inputPath, "utf-8");

  const parsed = JSON.parse(raw) as EuStartupDataset;
  if (!Array.isArray(parsed.listings)) {
    throw new Error("Invalid EU-Startups dataset: listings array is missing");
  }

  return parsed.listings;
}

function readExistingPortfolio(outputPath: string): PortfolioCompany[] {
  if (!existsSync(outputPath)) {
    return [];
  }

  try {
    const raw = readFileSync(outputPath, "utf-8");
    const parsed = JSON.parse(raw) as PortfolioCompany[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to parse existing results. Starting fresh.", error);
    return [];
  }
}

function upsertPortfolioEntry(
  collection: PortfolioCompany[],
  entry: PortfolioCompany
): PortfolioCompany {
  const normalizedName = normalizeCompanyName(entry.name);
  const existing = collection.find(
    (item) => normalizeCompanyName(item.name) === normalizedName
  );

  if (existing) {
    existing.description = entry.description ?? existing.description ?? null;
    existing.location = entry.location ?? existing.location ?? null;
    existing.industry = entry.industry ?? existing.industry ?? null;
    existing.founded = entry.founded ?? existing.founded ?? null;
    existing.people = entry.people;
    return existing;
  }

  collection.push(entry);
  return entry;
}

async function collectMatchingContacts(
  page: RealBrowserPage,
  companyName: string,
  searchUrl: string,
  normalizedCompany: string,
  normalizedDomain: string | null
): Promise<MatchedContact[]> {
  console.log(`    Navigating to: ${searchUrl}`);

  await page.goto(searchUrl, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  const tableSelector = '[data-id="scrollable-table-container"]';
  const emptyStateSelector = '[data-interaction-boundary="People Finder - Empty State"]';

  console.log("    Waiting for table or empty state...");

  const waitForTable = page.waitForSelector(tableSelector, { timeout: 30000 });
  waitForTable.catch(() => null);

  const waitForEmpty = page.waitForSelector(emptyStateSelector, { timeout: 30000 });
  waitForEmpty.catch(() => null);

  let viewState: "table" | "empty";

  try {
    viewState = await Promise.race([
      waitForTable.then(() => "table" as const),
      waitForEmpty.then(() => "empty" as const),
    ]);
  } catch (error) {
    console.log("    Timed out waiting for Apollo results. Skipping.");
    return [];
  }

  if (viewState === "empty") {
    console.log("    Apollo returned an empty state for this company. Skipping.");
    return [];
  }

  await page.waitForSelector(
    'div[role="row"][aria-rowindex] [data-testid="contact-name-cell"]',
    {
      timeout: 30000,
    }
  );

  await wait(2000);

  const rawContacts = await page.evaluate<BaseContact[]>(
    (companyNormalized: string, targetDomain: string | null) => {
      const normalizeText = (value: string | null | undefined) => {
        if (!value) {
          return "";
        }

        return value
          .toLowerCase()
          .replace(/&/g, " and ")
          .replace(/[^a-z0-9]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      };

      const normalizeDomainInner = (value: string | null | undefined) => {
        if (!value) {
          return "";
        }

        try {
          const url = new URL(value.startsWith("http") ? value : `https://${value}`);
          return url.hostname.replace(/^www\./, "").toLowerCase();
        } catch (error) {
          return value.replace(/^www\./, "").toLowerCase();
        }
      };

      const getTitleText = (row: Element) => {
        const titleElement =
          row.querySelector('[data-testid="contact-title-cell"]') ??
          row.querySelector('div[role="gridcell"][aria-colindex="2"]');
        return titleElement?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      };

      const getOrganizationText = (row: Element) => {
        const organizationElement =
          row.querySelector('[data-testid="contact-organization-cell"]') ??
          row.querySelector('div[role="gridcell"][aria-colindex="3"]');
        return organizationElement?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      };

      const getLocationText = (row: Element) => {
        const locationElement =
          row.querySelector('[data-testid="contact-location-cell"]') ??
          row.querySelector('div[role="gridcell"][aria-colindex="9"]');
        return locationElement?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      };

      const results: BaseContact[] = [];
      const rowElements = Array.from(
        document.querySelectorAll('div[role="row"][aria-rowindex]')
      );

      for (const row of rowElements) {
        const ariaRowIndex = row.getAttribute("aria-rowindex");
        if (!ariaRowIndex || Number.isNaN(Number(ariaRowIndex))) {
          continue;
        }

        const nameAnchor = row.querySelector(
          '[data-testid="contact-name-cell"] a, a[href*="/contacts/"]'
        ) as HTMLAnchorElement | null;

        const title = getTitleText(row);
        const name = nameAnchor?.textContent?.replace(/\s+/g, " ").trim() ?? "";

        if (!name || !title) {
          continue;
        }

        const organizationText = getOrganizationText(row);
        const normalizedOrganization = normalizeText(organizationText);

        if (companyNormalized) {
          const isMatch =
            normalizedOrganization.includes(companyNormalized) ||
            companyNormalized.includes(normalizedOrganization);

          if (!isMatch) {
            continue;
          }
        }

        if (targetDomain) {
          const domainAttribute = (row as HTMLElement).getAttribute("data-domain");
          const normalizedRowDomain = normalizeDomainInner(domainAttribute);

          if (
            normalizedRowDomain &&
            normalizedRowDomain !== targetDomain &&
            !normalizedRowDomain.endsWith(`.${targetDomain}`) &&
            !targetDomain.endsWith(`.${normalizedRowDomain}`)
          ) {
            continue;
          }
        }

        const linkedinAnchor = row.querySelector('a[href*="linkedin.com"]') as
          | HTMLAnchorElement
          | null;

        const locationText = getLocationText(row);
        const apolloContactUrl = nameAnchor?.getAttribute("href") ?? null;
        const apolloIdMatch = apolloContactUrl
          ? /\/contacts\/([^/?]+)/.exec(apolloContactUrl)
          : null;

        results.push({
          name,
          title,
          organization: organizationText || null,
          location: locationText || null,
          linkedinUrl: linkedinAnchor?.href ?? null,
          apolloContactUrl,
          apolloId: apolloIdMatch?.[1] ?? null,
        });
      }

      return results;
    },
    normalizedCompany,
    normalizedDomain
  );

  console.log(
    `    Retrieved ${Array.isArray(rawContacts) ? rawContacts.length : 0} contacts before filtering`
  );

  if (Array.isArray(rawContacts) && rawContacts.length > 0) {
    const sample = rawContacts
      .slice(0, 5)
      .map((contact) => `${contact.title} @ ${contact.organization}`)
      .join(" | ");
    console.log(`    Sample titles: ${sample}`);
  }

  const matches = rawContacts
    .map((contact) => {
      const role = inferRole(contact.title);
      if (!role) {
        return null;
      }
      return { ...contact, role } as MatchedContact;
    })
    .filter((contact): contact is MatchedContact => contact !== null);

  console.log(`    Found ${matches.length} matching contacts for ${companyName}`);

  return matches;
}

async function enrichEuStartupsWithApollo() {
  const listings = readEuStartupsData();
  console.log(`Found ${listings.length} EU-Startups listings`);

  const { browser, page } = await connect({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    turnstile: true,
    connectOption: {
      defaultViewport: null,
    },
  });

  if (!page) {
    throw new Error("Failed to acquire a page instance from puppeteer-real-browser");
  }

  const outputPath = join(process.cwd(), "leadgen", OUTPUT_FILENAME);
  const existingEntries = readExistingPortfolio(outputPath);
  const results = [...existingEntries];

  const processedCompanies = new Set(
    results.map((entry) => normalizeCompanyName(entry.name))
  );

  try {
    await page.setViewport({ width: 1920, height: 1080 });

    await page.evaluateOnNewDocument(`
      (function () {
        var globalObj = typeof window !== "undefined" ? window : globalThis;
        if (typeof globalObj.__name !== "function") {
          Object.defineProperty(globalObj, "__name", {
            value: function (target, value) {
              try {
                Object.defineProperty(target, "name", { value: value, configurable: true });
              } catch (err) {
                // ignore inability to update name
              }
              return target;
            },
            configurable: true,
            writable: true,
          });
        }
      })();
    `);

    console.log("Navigating to Apollo.io...");
    await page.goto("https://app.apollo.io/#/people", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Waiting 40 seconds for you to log in to Apollo.io...");
    await wait(40000);

    let processedCount = 0;
    let companiesWithMatches = 0;

    for (const listing of listings) {
      const companyName = listing.name?.trim();
      if (!companyName) {
        console.warn("Skipping listing without a company name", listing.detailUrl);
        continue;
      }

      const normalizedName = normalizeCompanyName(companyName);
      if (processedCompanies.has(normalizedName)) {
        console.log(`Skipping already processed company: ${companyName}`);
        continue;
      }

      processedCompanies.add(normalizedName);
      processedCount += 1;
      console.log(`\n[${processedCount}/${listings.length}] Processing ${companyName}`);

      const website = extractWebsite(listing);
      const normalizedDomain = website ? normalizeDomain(website) : null;
      const searchQuery = encodeURIComponent(companyName);
      const searchUrl = `https://app.apollo.io/#/people?page=1&qKeywords=${searchQuery}&sortAscending=false&sortByField=recommendations_score`;

      let matches: MatchedContact[] = [];

      try {
        matches = await collectMatchingContacts(
          page,
          companyName,
          searchUrl,
          normalizedName,
          normalizedDomain
        );
      } catch (error) {
        console.error(`    ✗ Error searching for ${companyName}`, error);
        continue;
      }

      if (matches.length === 0) {
        console.log("    No qualifying contacts found for this company.");
        continue;
      }

      const entry = buildPortfolioEntry(listing, matches);
      if (entry.people.length === 0) {
        console.log("    No qualifying contacts remained after normalization.");
        continue;
      }

      companiesWithMatches += 1;
      upsertPortfolioEntry(results, entry);

      results.sort((a, b) => a.name.localeCompare(b.name));

      try {
        writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
        console.log("    Portfolio entry saved.");
      } catch (writeError) {
        console.error("    ✗ Failed to write portfolio data:", writeError);
      }

      await wait(2500);
    }

    try {
      writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
    } catch (writeError) {
      console.error("Failed to write final portfolio data:", writeError);
    }

    console.log("\n=== Summary ===");
    console.log(`Total companies processed this run: ${processedCount}`);
    console.log(`Companies with qualifying contacts: ${companiesWithMatches}`);
    console.log(`Portfolio entries saved to: ${outputPath}`);

    console.log("\nBrowser will remain open for inspection. Press Ctrl+C to exit.");
  } catch (error) {
    console.error("Fatal error during enrichment:", error);
    await browser.close();
    process.exit(1);
  }
}

enrichEuStartupsWithApollo().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


