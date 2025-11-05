import "dotenv/config";
import { connect } from "puppeteer-real-browser";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

type RealBrowserPage = Awaited<ReturnType<typeof connect>>["page"];

// Helper function to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ApolloSearchResultRow {
  rowIndex: number;
  name: string;
  title: string;
  organization: string;
  href: string;
}

function isApolloSearchResultRow(value: unknown): value is ApolloSearchResultRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  const { rowIndex, name, title, organization, href } = candidate;

  const rowIndexIsNumber = typeof rowIndex === "number" && Number.isFinite(rowIndex);
  const nameIsString = typeof name === "string";
  const titleIsString = typeof title === "string";
  const organizationIsString = typeof organization === "string";
  const hrefIsValid = typeof href === "string";

  return rowIndexIsNumber && nameIsString && titleIsString && organizationIsString && hrefIsValid;
}

const canonicalizeRoleValue = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  return normalized || null;
};

function inferRole(title: string | null | undefined): string | null {
  if (!title) {
    return null;
  }

  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return null;
  }

  const words = cleaned.split(" ");
  const wordSet = new Set(words);
  const hasWord = (word: string) => wordSet.has(word);
  const containsPhrase = (phrase: string) => cleaned.includes(phrase);

  if (
    hasWord("cto") ||
    containsPhrase("chief technology officer") ||
    containsPhrase("chief technical officer") ||
    (hasWord("chief") && hasWord("tech") && hasWord("officer"))
  ) {
    return "CTO";
  }

  if (
    containsPhrase("head of engineering") ||
    containsPhrase("head engineering") ||
    (hasWord("head") && hasWord("engineering"))
  ) {
    return "Head of Engineering";
  }

  if (
    (containsPhrase("vice president") && hasWord("engineering")) ||
    containsPhrase("vp of engineering") ||
    containsPhrase("svp of engineering") ||
    containsPhrase("vp engineering") ||
    containsPhrase("svp engineering") ||
    (hasWord("vp") && hasWord("engineering")) ||
    (hasWord("svp") && hasWord("engineering"))
  ) {
    return "VP of Engineering";
  }

  if (
    containsPhrase("talent acquisition") ||
    containsPhrase("talent aquisition") ||
    (hasWord("talent") && hasWord("acquisition")) ||
    cleaned.startsWith("ta ") ||
    cleaned.endsWith(" ta") ||
    hasWord("ta")
  ) {
    return "Talent Acquisition";
  }

  if (
    containsPhrase("co founder") ||
    containsPhrase("co-founder") ||
    hasWord("cofounder") ||
    (hasWord("co") && hasWord("founder"))
  ) {
    return "Cofounder";
  }

  if (hasWord("founder")) {
    return "Founder";
  }

  if (hasWord("ceo") || containsPhrase("chief executive officer")) {
    return "CEO";
  }

  return null;
}

const PHONE_REVEAL_TEXTS = [
  "request phone number",
  "reveal phone number",
  "unlock phone number",
  "access phone",
  "access mobile",
  "unlock mobile",
  "reveal mobile",
];

const PHONE_UNAVAILABLE_TEXTS = [
  "phone not available",
  "no phone number",
  "phone unavailable",
];

const EMAIL_REVEAL_TEXTS = [
  "access email",
  "request email",
  "reveal email",
  "unlock email",
  "show email",
  "get email",
];

const EMAIL_UNAVAILABLE_TEXTS = [
  "email not available",
  "no email",
  "email unavailable",
  "email not provided",
];

const PHONE_EXTRACT_PATTERN = /\+?\d[\d\s()./+|\-]{6,}\d/g;
const EMAIL_EXTRACT_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractPhoneNumberFromText(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }

  const sanitizedText = text.replace(/[|]/g, " ");
  PHONE_EXTRACT_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = PHONE_EXTRACT_PATTERN.exec(sanitizedText)) !== null) {
    const candidate = match[0];
    if (!candidate) {
      continue;
    }

    const numeric = candidate.replace(/[^\d+]/g, "");
    const digitsOnly = numeric.replace(/\D/g, "");

    if (digitsOnly.length >= 7) {
      if (numeric.startsWith("+")) {
        return `+${digitsOnly}`;
      }
      return digitsOnly;
    }
  }

  const fallbackDigits = sanitizedText.replace(/\D/g, "");
  if (fallbackDigits.length >= 7) {
    return fallbackDigits;
  }

  return null;
}

function extractEmailFromText(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }

  EMAIL_EXTRACT_PATTERN.lastIndex = 0;
  const match = EMAIL_EXTRACT_PATTERN.exec(text);
  if (!match) {
    return null;
  }

  const email = match[0];
  if (/\*+@/.test(email)) {
    return null;
  }

  return email;
}

async function getVisiblePhoneNumber(
  page: RealBrowserPage
): Promise<{ raw: string | null }> {
  return page.evaluate((revealTexts) => {
    const selectors = [
      '[data-testid*="phone"]',
      '[class*="phone"]',
      '[data-test*="phone"]',
    ];
    const elements: Element[] = [];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => elements.push(el));
    }

    for (const el of elements) {
      const textContent = el.textContent?.trim();
      if (!textContent) {
        continue;
      }

      const normalized = textContent.replace(/\s+/g, " ").trim();
      const lower = normalized.toLowerCase();

      if (revealTexts.some((phrase) => lower.includes(phrase))) {
        continue;
      }

      if (/\d/.test(normalized)) {
        return { raw: normalized };
      }
    }

    return { raw: null };
  }, PHONE_REVEAL_TEXTS);
}

async function clickPhoneRevealButton(page: RealBrowserPage): Promise<boolean> {
  return page.evaluate((revealTexts) => {
    const candidateSelectors = [
      "a",
      "button",
      '[role="button"]',
      '[data-tour-id^="phone-cell-"]',
      '[data-tour-id^="mobile-cell-"]',
      '[data-testid*="phone"] button',
      '[data-testid*="mobile"] button',
    ];
    const candidates = new Set<Element>();

    for (const selector of candidateSelectors) {
      document.querySelectorAll(selector).forEach((el) => candidates.add(el));
    }

    for (const el of candidates) {
      const text = el.textContent?.trim().toLowerCase() ?? "";
      if (!text) {
        continue;
      }

      if (revealTexts.some((phrase) => text.includes(phrase))) {
        const clickable = el as HTMLElement;
        clickable.scrollIntoView({ block: "center", inline: "center" });
        clickable.click();
        return true;
      }
    }

    return false;
  }, PHONE_REVEAL_TEXTS);
}

async function isPhoneMarkedUnavailable(page: RealBrowserPage): Promise<boolean> {
  return page.evaluate((unavailableTexts) => {
    const selectors = ['[data-testid*="phone"]', '[class*="phone"]'];
    const elements: Element[] = [];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => elements.push(el));
    }

    if (document.body) {
      elements.push(document.body);
    }

    for (const el of elements) {
      const text = el.textContent?.toLowerCase() ?? "";
      if (!text) {
        continue;
      }

      if (unavailableTexts.some((phrase) => text.includes(phrase))) {
        return true;
      }
    }

    return false;
  }, PHONE_UNAVAILABLE_TEXTS);
}

async function getEmailInfo(
  page: RealBrowserPage
): Promise<{ email: string | null; masked: boolean; raw: string | null }> {
  return page.evaluate(() => {
    const result: { email: string | null; masked: boolean; raw: string | null } = {
      email: null,
      masked: false,
      raw: null,
    };

    const selectors = [
      '[data-testid*="email"]',
      '[class*="email"]',
      'a[href^="mailto:"]',
    ];

    const elements = new Set<Element>();
    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => elements.add(el));
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    for (const el of elements) {
      if (result.email) {
        break;
      }

      const tagName = el.tagName?.toLowerCase();
      if (tagName === "a") {
        const href = el.getAttribute("href");
        if (href?.startsWith("mailto:")) {
          const emailCandidate = href.replace(/^mailto:/i, "").split("?")[0]?.trim();
          if (emailCandidate) {
            result.raw ??= emailCandidate;
          }
          if (emailCandidate && !/\*+@/.test(emailCandidate)) {
            const emailMatch = emailRegex.exec(emailCandidate);
            if (emailMatch?.[0]) {
              result.email = emailMatch[0];
              result.masked = false;
              break;
            }
          }
          if (emailCandidate && /\*+@/.test(emailCandidate)) {
            result.masked = true;
          }
        }
      }

      const element = el as HTMLElement;
      const textContent = element.innerText ?? element.textContent ?? "";
      if (!textContent) {
        continue;
      }

      const normalized = textContent.replace(/\s+/g, " ").trim();
      if (!normalized) {
        continue;
      }

      result.raw ??= normalized;

      if (/\*+@/.test(normalized)) {
        result.masked = true;
        continue;
      }

      const emailMatch = emailRegex.exec(normalized);
      if (emailMatch?.[0]) {
        result.email = emailMatch[0];
        result.masked = false;
        break;
      }
    }

    return result;
  });
}

async function clickEmailRevealButton(page: RealBrowserPage): Promise<boolean> {
  return page.evaluate((revealTexts) => {
    const candidateSelectors = [
      "a",
      "button",
      '[role="button"]',
      '[data-tour-id^="email-cell-"]',
      '[data-testid*="email"] button',
    ];
    const candidates = new Set<Element>();

    for (const selector of candidateSelectors) {
      document.querySelectorAll(selector).forEach((el) => candidates.add(el));
    }

    for (const el of candidates) {
      const text = el.textContent?.trim().toLowerCase() ?? "";
      if (!text) {
        continue;
      }

      if (revealTexts.some((phrase) => text.includes(phrase))) {
        const clickable = el as HTMLElement;
        clickable.scrollIntoView({ block: "center", inline: "center" });
        clickable.click();
        return true;
      }
    }

    const emailButton = document.querySelector('[data-tour-id^="email-cell-"]');

    if (emailButton instanceof HTMLElement) {
      emailButton.scrollIntoView({ block: "center", inline: "center" });
      emailButton.click();
      return true;
    }

    return false;
  }, EMAIL_REVEAL_TEXTS);
}

async function isEmailMarkedUnavailable(page: RealBrowserPage): Promise<boolean> {
  return page.evaluate((unavailableTexts) => {
    const selectors = ['[data-testid*="email"]', '[class*="email"]'];
    const elements: Element[] = [];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => elements.push(el));
    }

    if (document.body) {
      elements.push(document.body);
    }

    for (const el of elements) {
      const text = el.textContent?.toLowerCase() ?? "";
      if (!text) {
        continue;
      }

      if (unavailableTexts.some((phrase) => text.includes(phrase))) {
        return true;
      }
    }

    return false;
  }, EMAIL_UNAVAILABLE_TEXTS);
}

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

const normalizeCompanyName = (value: string) => value.trim().toLowerCase();
const normalizePersonKey = (person: Person) => person.name.trim().toLowerCase();

function upsertEnrichedCompany(target: Company[], company: Company): Company {
  const normalizedName = normalizeCompanyName(company.name);
  let existing = target.find((item) => normalizeCompanyName(item.name) === normalizedName);

  if (existing) {
    existing.description = company.description ?? existing.description ?? null;
    existing.location = company.location ?? existing.location ?? null;
    existing.industry = company.industry ?? existing.industry ?? null;
    existing.founded = company.founded ?? existing.founded ?? null;
    return existing;
  }

  existing = {
    ...company,
    people: company.people.map((person) => ({ ...person })),
  };

  target.push(existing);
  return existing;
}

function upsertEnrichedPerson(enrichedCompany: Company, person: Person): Person {
  const normalizedKey = normalizePersonKey(person);
  let existing = enrichedCompany.people.find(
    (candidate) => normalizePersonKey(candidate) === normalizedKey
  );

  if (existing) {
    existing.role = person.role;
    existing.linkedinUrl = person.linkedinUrl;
    return existing;
  }

  existing = { ...person };
  enrichedCompany.people.push(existing);
  return existing;
}

async function enrichPersonWithBrowser(
  page: RealBrowserPage,
  person: Person,
  companyName: string
): Promise<{
  phoneNumber: string | null;
  email: string | null;
  apolloId: string | null;
  matchedRole: boolean;
}> {
  try {
    // Build search query: "firstName lastName companyName"
    const searchQuery = `${person.name} ${companyName}`;
    const encodedQuery = encodeURIComponent(searchQuery);

    // Build Apollo.io search URL
    const searchUrl = `https://app.apollo.io/#/people?page=1&qKeywords=${encodedQuery}&sortAscending=false&sortByField=recommendations_score`;

    console.log(`    Navigating to: ${searchUrl}`);

    // Navigate to search page
    await page.goto(searchUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for table to load - look for the scrollable table container
    console.log("    Waiting for table to load...");
    await page.waitForSelector('[data-id="scrollable-table-container"]', {
      timeout: 30000,
    });

    // Wait a bit more for rows to render
    await wait(2000);

    let apolloId: string | null = null;

    const expectedRoleKey = canonicalizeRoleValue(person.role);
    if (!expectedRoleKey) {
      console.log(
        `    ⚠️  Unable to normalize expected role "${person.role}". Skipping contact.`
      );
      return {
        phoneNumber: null,
        email: null,
        apolloId: null,
        matchedRole: false,
      };
    }

    const searchResultsRaw = await page.evaluate(() => {
      const rowSelector = 'div[role="row"][aria-rowindex]';
      const rows = Array.from(document.querySelectorAll<HTMLElement>(rowSelector));

      return rows
        .map((row) => {
          const ariaRowIndex = row.getAttribute("aria-rowindex");
          const rowIndex = ariaRowIndex ? Number.parseInt(ariaRowIndex, 10) : Number.NaN;
          const nameAnchor = row.querySelector<HTMLAnchorElement>(
            '[data-testid="contact-name-cell"] a, a[href*="/contacts/"]'
          );
          const titleElement =
            row.querySelector('[data-testid="contact-title-cell"]') ??
            row.querySelector('div[role="gridcell"][aria-colindex="2"]');

          const organizationElement =
            row.querySelector('[data-testid="contact-organization-cell"]') ??
            row.querySelector('div[role="gridcell"][aria-colindex="3"]');

          const title = titleElement?.textContent?.replace(/\s+/g, " ").trim() ?? "";
          const name = nameAnchor?.textContent?.replace(/\s+/g, " ").trim() ?? "";
          const organization =
            organizationElement?.textContent?.replace(/\s+/g, " ").trim() ?? "";
          const href = nameAnchor?.getAttribute("href") ?? null;

          return {
            rowIndex,
            title,
            name,
            organization,
            href,
          };
        });
    });

    const searchResults: ApolloSearchResultRow[] = Array.isArray(searchResultsRaw)
      ? searchResultsRaw.reduce<ApolloSearchResultRow[]>((acc, row) => {
          if (!isApolloSearchResultRow(row)) {
            return acc;
          }

          const hrefValue = row.href.trim();

          if (!hrefValue) {
            return acc;
          }

          acc.push({
            rowIndex: row.rowIndex,
            title: row.title.trim(),
            name: row.name.trim(),
            organization: row.organization.trim(),
            href: hrefValue,
          });

          return acc;
        }, [])
      : [];

    if (searchResults.length === 0) {
      console.log("    ⚠️  No search results returned for this query");
      return {
        phoneNumber: null,
        email: null,
        apolloId: null,
        matchedRole: false,
      };
    }

    const matchingRow = searchResults.find((row) => {
      const inferredRole = inferRole(row.title);
      if (!inferredRole) {
        return false;
      }

      const inferredRoleKey = canonicalizeRoleValue(inferredRole);
      return inferredRoleKey !== null && inferredRoleKey === expectedRoleKey;
    });

    if (!matchingRow) {
      console.log(
        `    ⚠️  No search results matched the expected role "${person.role}". Skipping contact.`
      );
      return {
        phoneNumber: null,
        email: null,
        apolloId: null,
        matchedRole: false,
      };
    }

    const linkSelector = `div[role="row"][aria-rowindex="${matchingRow.rowIndex}"] [data-testid="contact-name-cell"] a, div[role="row"][aria-rowindex="${matchingRow.rowIndex}"] a[href*="/contacts/"]`;
    const matchingLinkHandle = await page.$(linkSelector);

    if (!matchingLinkHandle) {
      console.log(
        "    ⚠️  Failed to locate the matching contact link element. Skipping contact."
      );
      return {
        phoneNumber: null,
        email: null,
        apolloId: null,
        matchedRole: false,
      };
    }

    const linkText = matchingRow.name.trim();
    const linkHref = matchingRow.href.trim();

    if (!linkHref) {
      console.log("    ⚠️  Matching contact link is missing an href. Skipping contact.");
      return {
        phoneNumber: null,
        email: null,
        apolloId: null,
        matchedRole: false,
      };
    }

    const apolloIdMatch = /\/contacts\/([^?]+)/.exec(linkHref);
    if (apolloIdMatch?.[1]) {
      apolloId = apolloIdMatch[1];
    }

    const displayName = linkText.length > 0 ? linkText : "Unknown contact";
    console.log(`    Found matching result: ${displayName}`);
    console.log(`    Title: ${matchingRow.title}`);
    console.log(`    Link: ${linkHref}`);

    console.log("    Clicking on matching result...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {
        // Navigation might not happen if it's SPA navigation
        return null;
      }),
      matchingLinkHandle.click(),
    ]);

    // Wait for page to load
    await wait(3000);

    const successLabel = linkText.length > 0 ? linkText : "selected contact";
    console.log(`    ✓ Successfully clicked on ${successLabel}`);

    // Try to extract contact info from the detail page if available
    // Note: Apollo might require login or have protected data, so we'll just log what we can see
    let phoneLookup = await getVisiblePhoneNumber(page);
    console.log("PHONE LOOKUP", phoneLookup)
    let phoneNumber = extractPhoneNumberFromText(phoneLookup.raw);
    console.log("PHONE NUMBER", phoneNumber)
    let email: string | null = null;

    try {
      if (phoneNumber) {
        console.log(`    Phone already visible: ${phoneNumber}`);
      } else {
        const clickedRevealButton = await clickPhoneRevealButton(page);

        if (clickedRevealButton) {
          console.log("    Found phone reveal button. Attempting to unlock...");
          await wait(4000);
          phoneLookup = await getVisiblePhoneNumber(page);
          phoneNumber = extractPhoneNumberFromText(phoneLookup.raw);

          if (phoneNumber) {
            console.log(`    ✓ Phone number unlocked: ${phoneNumber}`);
          } else if (await isPhoneMarkedUnavailable(page)) {
            console.log("    Phone not available after reveal attempt.");
          } else {
            console.log("    Phone number still locked or not visible after reveal attempt.");
          }
        } else {
          if (await isPhoneMarkedUnavailable(page)) {
            console.log("    Phone not available on Apollo.");
          } else {
            console.log(
              "    No phone reveal button found; phone may require manual unlock or is located elsewhere on the page."
            );
          }
        }
      }

      let emailInfo = await getEmailInfo(page);
      email = extractEmailFromText(emailInfo.email ?? emailInfo.raw);

      console.log("PHONE", phoneLookup)
      console.log("EMAIL", emailInfo)

      if (email) {
        console.log(`    Email already visible: ${email}`);
      } else {
        if (emailInfo.masked) {
          console.log("    Email present but masked; attempting to unlock...");
        }

        const clickedEmailRevealButton = await clickEmailRevealButton(page);

        if (clickedEmailRevealButton) {
          console.log("    Found email reveal button. Attempting to unlock...");
          await wait(4000);
          emailInfo = await getEmailInfo(page);
          email = extractEmailFromText(emailInfo.email ?? emailInfo.raw);

          if (email) {
            console.log(`    ✓ Email unlocked: ${email}`);
          } else if (emailInfo.masked) {
            console.log("    Email remains masked after reveal attempt.");
          } else if (await isEmailMarkedUnavailable(page)) {
            console.log("    Email not available after reveal attempt.");
          } else {
            console.log("    Email still locked or not visible after reveal attempt.");
          }
        } else if (emailInfo.masked) {
          console.log("    Email masked but no reveal button was found.");
        } else if (await isEmailMarkedUnavailable(page)) {
          console.log("    Email not available on Apollo.");
        } else {
          console.log(
            "    No email reveal button found; email may require manual unlock or is located elsewhere on the page."
          );
        }
      }
    } catch (error) {
      console.log("ERROR", error)
      // Contact info might not be visible without login or unlocking
      console.log("    Note: Contact info extraction skipped (may require login/unlock)");
    }

    return {
      phoneNumber,
      email,
      apolloId,
      matchedRole: true,
    };
  } catch (error) {
    console.error(`    ✗ Error enriching ${person.name}:`, error);
    return {
      phoneNumber: null,
      email: null,
      apolloId: null,
      matchedRole: false,
    };
  }
}

async function enrichPortfolioDataWithBrowser() {
  console.log("Reading portfolio data...");
  const portfolioPath = join(process.cwd(), "leadgen", "eu-startups-portfolio-data-2025.json");
  const portfolioData = JSON.parse(
    readFileSync(portfolioPath, "utf-8")
  ) as Company[];

  console.log(`Found ${portfolioData.length} companies`);

  const totalPeople = portfolioData.reduce(
    (sum, company) => sum + company.people.length,
    0
  );
  console.log(`Total people to enrich: ${totalPeople}`);

  const outputPath = join(process.cwd(), "leadgen", "eu-startups-portfolio-data-2025-enriched.json");

  let enrichedPortfolioData: Company[] = [];

  if (existsSync(outputPath)) {
    try {
      const existingRaw = readFileSync(outputPath, "utf-8");
      const parsed = JSON.parse(existingRaw) as Company[];
      enrichedPortfolioData = parsed.map((company) => ({
        ...company,
        people: Array.isArray(company.people)
          ? company.people.map((person) => ({ ...person }))
          : [],
      }));
      console.log(
        `Loaded existing enriched data with ${enrichedPortfolioData.length} companies. Continuing with upserts...`
      );
    } catch (error) {
      console.warn(
        "Failed to load existing enriched data. A fresh file will be created for this run.",
        error
      );
    }
  }

  if (!enrichedPortfolioData.length) {
    enrichedPortfolioData = portfolioData.map((company) => ({
      ...company,
      people: company.people.map((person) => ({ ...person })),
    }));
  }

  const { browser, page } = await connect({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    turnstile: true,
    connectOption: {
      defaultViewport: null,
    },
  });

  try {
    if (!page) {
      throw new Error("Failed to acquire a page instance from puppeteer-real-browser");
    }

    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to Apollo.io to allow login
    console.log("Navigating to Apollo.io...");
    await page.goto("https://app.apollo.io/#/people", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait 100 seconds for manual login
    console.log("Waiting 40 seconds for you to log in to Apollo.io...");
    await wait(40000);

    let processedCount = 0;
    let foundCount = 0;
    let notFoundCount = 0;
    let removedCount = 0;

    for (const company of portfolioData) {
      const enrichedCompany = upsertEnrichedCompany(enrichedPortfolioData, company);
      console.log(`\nProcessing company: ${company.name}`);

      for (const person of company.people) {
        const enrichedPerson = upsertEnrichedPerson(enrichedCompany, person);
        processedCount++;
        console.log(
          `\n  [${processedCount}/${totalPeople}] Enriching ${person.name} (${person.role}) at ${company.name}...`
        );

        const apolloData = await enrichPersonWithBrowser(page, person, company.name);

        if (!apolloData.matchedRole) {
          const removalIndex = enrichedCompany.people.indexOf(enrichedPerson);
          if (removalIndex !== -1) {
            enrichedCompany.people.splice(removalIndex, 1);
            removedCount++;
            console.log(
              "    ✂ Removed from enriched data because Apollo title did not match the expected role."
            );
          } else {
            console.warn(
              "    ⚠️ Skipped removal because enriched person entry could not be located."
            );
          }

          try {
            writeFileSync(outputPath, JSON.stringify(enrichedPortfolioData, null, 2), "utf-8");
            console.log("    Progress saved to output file.");
          } catch (writeError) {
            console.error("    ✗ Failed to write progress to output file:", writeError);
          }

          await wait(2000);
          continue;
        }

        if (apolloData.phoneNumber || apolloData.email || apolloData.apolloId) {
          foundCount++;
          console.log(`    ✓ Found in Apollo`);
          console.log(`      Apollo ID: ${apolloData.apolloId ?? "N/A"}`);
          console.log(`      Email: ${apolloData.email ?? "N/A"}`);
          console.log(`      Phone: ${apolloData.phoneNumber ?? "N/A"}`);
        } else {
          notFoundCount++;
          console.log(`    ✗ Not found in Apollo`);
        }

        enrichedPerson.phoneNumber = apolloData.phoneNumber ?? null;
        enrichedPerson.email = apolloData.email ?? null;
        enrichedPerson.apolloId = apolloData.apolloId ?? null;

        try {
          writeFileSync(outputPath, JSON.stringify(enrichedPortfolioData, null, 2), "utf-8");
          console.log("    Progress saved to output file.");
        } catch (writeError) {
          console.error("    ✗ Failed to write progress to output file:", writeError);
        }

        // Rate limiting - wait between requests to avoid being blocked
        await wait(2000); // 2 second delay between people
      }
    }

    // Save enriched data
    writeFileSync(outputPath, JSON.stringify(enrichedPortfolioData, null, 2), "utf-8");
    console.log(`\n=== Summary ===`);
    console.log(`Total people processed: ${processedCount}`);
    console.log(`Found in Apollo: ${foundCount}`);
    console.log(`Not found: ${notFoundCount}`);
    console.log(`Removed due to role mismatch: ${removedCount}`);
    console.log(`Enriched data saved to: ${outputPath}`);

    // Keep browser open for inspection
    console.log("\nBrowser will remain open for inspection. Press Ctrl+C to close.");
  } catch (error) {
    console.error("Fatal error:", error);
    await browser.close();
    process.exit(1);
  }
}

// Main execution
enrichPortfolioDataWithBrowser().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

