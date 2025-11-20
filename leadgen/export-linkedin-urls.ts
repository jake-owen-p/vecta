import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface Person {
  linkedinUrl?: string | null;
}

interface Company {
  people?: Person[];
}

const MAX_PEOPLE_PER_COMPANY = 4;

const INPUT_FILENAMES = [
  "eu-startups-portfolio-data-2023.json",
  "eu-startups-portfolio-data-2024.json",
];

const OUTPUT_FILENAME = "eu-startups-portfolio-linkedin-urls.csv";

const WORKING_DIR = join(process.cwd(), "leadgen");
const OUTPUT_PATH = join(WORKING_DIR, OUTPUT_FILENAME);

function loadCompanies(filename: string): Company[] {
  const path = join(WORKING_DIR, filename);
  const raw = readFileSync(path, "utf-8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`Unexpected JSON structure in ${filename}; expected an array.`);
  }

  return parsed as Company[];
}

function escapeCsvValue(value: string): string {
  if (!value) {
    return "";
  }

  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function main() {
  console.log("Collecting LinkedIn URLs from input files…");

  const uniqueUrls = new Set<string>();

  for (const filename of INPUT_FILENAMES) {
    console.log(`  - ${filename}`);
    const companies = loadCompanies(filename);

    for (const company of companies) {
      const people = Array.isArray(company.people) ? company.people : [];

      if (people.length > MAX_PEOPLE_PER_COMPANY) {
        continue;
      }

      for (const person of people) {
        const url = person.linkedinUrl?.trim();
        if (url) {
          uniqueUrls.add(url);
        }
      }
    }
  }

  const urls = Array.from(uniqueUrls);
  urls.sort((a, b) => a.localeCompare(b));

  const csvLines = ["url", ...urls.map(escapeCsvValue)];

  writeFileSync(OUTPUT_PATH, csvLines.join("\n"), "utf-8");
  console.log(`Wrote ${urls.length} unique URLs to ${OUTPUT_PATH}`);
}

main();

