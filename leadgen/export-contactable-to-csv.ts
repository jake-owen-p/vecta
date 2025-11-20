import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface Person {
  role: string | null;
  name: string | null;
  linkedinUrl: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  apolloId?: string | null;
  [key: string]: string | null | undefined;
}

interface Company {
  name: string;
  description: string | null;
  location: string | null;
  industry: string | null;
  founded: string | null;
  people: Person[];
}

const INPUT_FILENAMES = [
  "eu-startups-portfolio-data-2023-enriched-numbers.json",
  "eu-startups-portfolio-data-2024-enriched-numbers.json",
];
const OUTPUT_FILENAME = "eu-startups-portfolio-data-2023-2024-contactable.csv";

const WORKING_DIR = join(process.cwd(), "leadgen");
const OUTPUT_PATH = join(WORKING_DIR, OUTPUT_FILENAME);

function loadPortfolio(filename: string): Company[] {
  const path = join(WORKING_DIR, filename);
  const raw = readFileSync(path, "utf-8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`Unexpected JSON structure in ${filename}; expected an array.`);
  }

  return parsed as Company[];
}

function hasContactInfo(person: Person): boolean {
  const email = person.email?.trim();
  const phone = person.phoneNumber?.toString().trim();
  return Boolean(email?.length || phone?.length);
}

function buildPersonHeaderKeys(rows: Person[]): string[] {
  const preferredOrder = ["role", "name", "linkedinUrl", "email", "phoneNumber"];
  const keys = new Set<string>();

  for (const person of rows) {
    for (const key of Object.keys(person)) {
      if (key === "apolloId") {
        continue;
      }
      keys.add(key);
    }
  }

  const ordered: string[] = [];
  for (const key of preferredOrder) {
    if (keys.has(key)) {
      ordered.push(key);
      keys.delete(key);
    }
  }

  const remaining = Array.from(keys).sort();
  ordered.push(...remaining);
  return ordered;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : JSON.stringify(value);

  if (stringValue.includes('"') || stringValue.includes(",") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function main() {
  console.log("Reading data from input files…");
  const portfolio = INPUT_FILENAMES.flatMap((filename) => {
    console.log(`  - ${filename}`);
    return loadPortfolio(filename);
  });

  const qualifyingRows: Array<{ company: Company; person: Person }> = [];

  for (const company of portfolio) {
    const people = Array.isArray(company.people) ? company.people : [];
    for (const person of people) {
      if (hasContactInfo(person)) {
        qualifyingRows.push({ company, person });
      }
    }
  }

  if (qualifyingRows.length === 0) {
    console.log("No contacts with email or phone found. Empty CSV will be created.");
  } else {
    console.log(`Found ${qualifyingRows.length} contacts with at least one contact detail.`);
  }

  const personHeaderKeys = buildPersonHeaderKeys(
    qualifyingRows.map(({ person }) => person)
  );

  const header = [
    "company_name",
    "company_founded",
    "company_location",
    ...personHeaderKeys.map((key) => `person_${key}`)
  ];

  const csvLines = [header.join(",")];

  for (const { company, person } of qualifyingRows) {
    const columns: string[] = [
      escapeCsvValue(company.name),
      escapeCsvValue(company.founded),
      escapeCsvValue(company.location)
    ];

    for (const key of personHeaderKeys) {
      if (key === "apolloId") {
        columns.push("");
        continue;
      }
      columns.push(escapeCsvValue(person[key]));
    }

    csvLines.push(columns.join(","));
  }

  writeFileSync(OUTPUT_PATH, csvLines.join("\n"), "utf-8");
  console.log(`Wrote ${csvLines.length - 1} rows to ${OUTPUT_PATH}`);
}

main();

