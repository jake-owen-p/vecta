import "dotenv/config";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateObject } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
import { z } from "zod";

const { PERPLEXITY_API_KEY } = process.env;

if (!PERPLEXITY_API_KEY) {
  console.error("PERPLEXITY_API_KEY environment variable is required.");
  process.exit(1);
}

process.env.PERPLEXITY_API_KEY = PERPLEXITY_API_KEY;

const CompanySnapshotSchema = z.object({
  startupName: z.string(),
  location: z.string(),
  totalFunding: z.string().nullable(),
  fundingStage: z.string().nullable(),
  shortDescription: z.string().nullable(),
  isAi: z.boolean().nullable(),
  website: z.string().url().nullable(),
});

type CompanySnapshot = z.infer<typeof CompanySnapshotSchema>;

type PortfolioCompany = {
  name?: string;
  location?: string;
  totalFunding?: string | null;
  fundingStage?: string | null;
  shortDescription?: string | null;
  isAi?: boolean | null;
  website?: string | null;
  [key: string]: unknown;
};

type CLIOptions = {
  inputPath: string;
  outputPath: string;
  dryRun: boolean;
  start: number;
  limit?: number;
  sleepMs: number;
  force: boolean;
};

async function lookupCompanySnapshot(
  startupName: string,
  location: string,
): Promise<CompanySnapshot> {
  const { object } = await generateObject({
    // @ts-expect-error - LanguageModelV2 is compatible at runtime with LanguageModelV1
    model: perplexity("sonar-pro"),
    schema: CompanySnapshotSchema,
    temperature: 0.2,
    maxRetries: 3,
    system:
      "You are a diligent venture research analyst. Use web search and reputable sources to return concise, factual funding insights in valid JSON only.",
    prompt: `Research the startup using the details below and extract the requested business snapshot.\n\nStartup name: ${startupName}\nPrimary location: ${location}\n\nOutput requirements:\n- Provide the totalFunding with currency symbols or codes (e.g., "$125M", "USD 40 million").\n- fundingStage should match venture funding labels such as "Seed", "Series B", "IPO", "Undisclosed".\n- shortDescription must be a single sentence of no more than 25 words summarizing the product or mission.\n- isAi must be a boolean (true/false) indicating if the company's website or marketing materials mention AI, artificial intelligence, agentic systems, agents, or AI-powered features. Return true only if AI/agentic capabilities are explicitly mentioned as part of their core offering.\n- website must be the official company domain and a fully qualified URL starting with http or https.\n- If any detail cannot be confirmed from reliable sources, return null for that field.\n- Always echo back the startupName and location that best match the confirmed entity.\n- Output JSON only.`,
  });

  return object;
}


function parseCLIOptions(argv: string[]): { options: CLIOptions; positional: string[] } {
  const positional: string[] = [];
  const options: CLIOptions = {
    inputPath: path.resolve(process.cwd(), "leadgen/portfolio-data-enriched-browser-joinef.json"),
    outputPath: path.resolve(process.cwd(), "leadgen/portfolio-data-enriched-browser-joinef.json"),
    dryRun: false,
    start: 0,
    limit: undefined,
    sleepMs: 500,
    force: false,
  };

  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const [flag, rawValue] = arg.includes("=") ? arg.split("=", 2) : [arg, undefined];
    switch (flag) {
      case "--input":
        if (!rawValue) {
          throw new Error("--input flag requires a value");
        }
        options.inputPath = path.resolve(rawValue);
        break;
      case "--output":
        if (!rawValue) {
          throw new Error("--output flag requires a value");
        }
        options.outputPath = path.resolve(rawValue);
        break;
      case "--start":
        if (!rawValue) {
          throw new Error("--start flag requires a value");
        }
        options.start = Number.parseInt(rawValue, 10);
        if (Number.isNaN(options.start) || options.start < 0) {
          throw new Error("--start must be a non-negative integer");
        }
        break;
      case "--limit":
        if (!rawValue) {
          throw new Error("--limit flag requires a value");
        }
        options.limit = Number.parseInt(rawValue, 10);
        if (Number.isNaN(options.limit) || options.limit <= 0) {
          throw new Error("--limit must be a positive integer");
        }
        break;
      case "--sleep":
        if (!rawValue) {
          throw new Error("--sleep flag requires a value");
        }
        options.sleepMs = Number.parseInt(rawValue, 10);
        if (Number.isNaN(options.sleepMs) || options.sleepMs < 0) {
          throw new Error("--sleep must be a non-negative integer representing milliseconds");
        }
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--force":
        options.force = true;
        break;
      default:
        throw new Error(`Unknown flag: ${flag}`);
    }
  }

  return { options, positional };
}

async function enrichPortfolioFile(options: CLIOptions): Promise<void> {
  console.log(`📂 Loading portfolio file: ${options.inputPath}`);
  let raw = await readFile(options.inputPath, "utf8");
  let portfolio = JSON.parse(raw) as PortfolioCompany[];

  const startIndex = Math.min(options.start, portfolio.length);
  const endIndex = options.limit
    ? Math.min(startIndex + options.limit, portfolio.length)
    : portfolio.length;

  let updatedCount = 0;
  for (let index = startIndex; index < endIndex; index += 1) {
    // Re-read the file on each iteration to get the latest state
    if (index > startIndex) {
      raw = await readFile(options.inputPath, "utf8");
      portfolio = JSON.parse(raw) as PortfolioCompany[];
    }

    const company = portfolio[index];

    if (!company) {
      console.warn(`⚠️  [${index}] Entry missing at this index, skipping.`);
      continue;
    }

    const name = typeof company.name === "string" ? company.name.trim() : "";
    const location = typeof company.location === "string" ? company.location.trim() : "";

    if (!name) {
      console.warn(`⚠️  [${index}] Missing company name, skipping.`);
      continue;
    }

    if (!location) {
      console.warn(`⚠️  [${index}] Missing location for ${name}, skipping.`);
      continue;
    }

    if (
      !options.force &&
      (company.totalFunding ||
        company.fundingStage ||
        company.shortDescription ||
        company.isAi !== undefined ||
        company.website)
    ) {
      console.log(`↩️  [${index}] ${name} already enriched, skipping (use --force to refresh).`);
      continue;
    }

    try {
      console.log(`🔎  [${index}] Researching ${name} (${location})…`);
      const snapshot = await lookupCompanySnapshot(name, location);
      company.totalFunding = snapshot.totalFunding;
      company.fundingStage = snapshot.fundingStage;
      company.shortDescription = snapshot.shortDescription;
      company.isAi = snapshot.isAi;
      company.website = snapshot.website;
      updatedCount += 1;
      console.log(
        `✅  [${index}] ${name} → funding=${snapshot.totalFunding ?? "unknown"}, stage=${snapshot.fundingStage ?? "unknown"}, isAi=${snapshot.isAi ?? "unknown"}`,
      );

      // Write to file immediately after each successful update
      if (!options.dryRun) {
        const jsonContent = JSON.stringify(portfolio, null, 2);
        await writeFile(options.outputPath, `${jsonContent}\n`, "utf8");
        console.log(`💾 Updated ${options.outputPath}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌  [${index}] Failed to enrich ${name}: ${message}`);
    }

    if (options.sleepMs > 0 && index < endIndex - 1) {
      await new Promise((resolve) => setTimeout(resolve, options.sleepMs));
    }
  }

  console.log(`\n📊 Summary: Processed ${endIndex - startIndex} companies, updated ${updatedCount}`);

  if (updatedCount === 0) {
    console.log("ℹ️  No new enrichments were applied.");
  } else if (options.dryRun) {
    console.log(`📝 Dry run enabled. Would have updated ${updatedCount} compan${updatedCount === 1 ? "y" : "ies"}.`);
  } else {
    console.log(`🎉 Completed enrichment for ${updatedCount} compan${updatedCount === 1 ? "y" : "ies"}.`);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  let parsed: { options: CLIOptions; positional: string[] };

  try {
    parsed = parseCLIOptions(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to parse arguments: ${message}`);
    process.exit(1);
    return;
  }

  const { options, positional } = parsed;

  if (positional.length >= 2) {
    const [startupNameArg, locationArg] = positional.map((value) => value.trim());

    if (!startupNameArg || !locationArg) {
      console.error(
        "Usage: pnpm tsx leadgen/perplexity-company-summary.ts \"Startup Name\" \"City, Country\"",
      );
      process.exit(1);
      return;
    }

    try {
      const snapshot = await lookupCompanySnapshot(startupNameArg, locationArg);
      console.log(JSON.stringify(snapshot, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to retrieve company snapshot: ${message}`);
      process.exit(1);
    }
    return;
  }

  try {
    await enrichPortfolioFile(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Enrichment run failed: ${message}`);
    process.exit(1);
  }
}

void main();

