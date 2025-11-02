import * as fs from "fs";
import type { WorkBook } from "xlsx";
import { utils, writeFile } from "xlsx";

interface Person {
  role: string;
  name: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  email?: string;
  apolloId?: string;
}

interface Company {
  name: string;
  description?: string;
  shortDescription?: string;
  location?: string;
  industry?: string;
  founded?: string;
  totalFunding?: string;
  fundingStage?: string;
  isAi?: boolean;
  website?: string;
  people: Person[];
}

interface FlatRow {
  // Company fields
  name: string;
  "Date founded"?: string;
  Location?: string;
  "Total funding"?: string;
  "Funding stage"?: string;
  "Short description"?: string;
  Website?: string;
  isAi: string;
  // Person fields
  "Person name": string;
  Role: string;
  Email?: string;
  Number?: string;
  LinkedIn?: string;
}

const leads: Company[] = JSON.parse(
  fs.readFileSync("./portfolio-data-enriched-browser-joinef.json", "utf-8")
) as Company[];

// Prepare data for Excel - single flat table
const flatTable: FlatRow[] = [];

leads.forEach((company) => {
  // Create one row per person with all company details duplicated
  company.people.forEach((person) => {
    flatTable.push({
      // Company fields
      name: company.name,
      "Date founded": company.founded,
      Location: company.location,
      "Total funding": company.totalFunding,
      "Funding stage": company.fundingStage,
      "Short description": company.shortDescription ?? company.description,
      Website: company.website,
      isAi: company.isAi ? "Yes" : "No",
      // Person fields
      "Person name": person.name,
      Role: person.role,
      Email: person.email,
      Number: person.phoneNumber,
      LinkedIn: person.linkedinUrl,
    });
  });
});

// Create a new Excel workbook
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const workbook: WorkBook = utils.book_new();

// Create single flat table sheet
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const flatWS = utils.json_to_sheet(flatTable);

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
utils.book_append_sheet(workbook, flatWS, "Leads");

// Write to file
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
writeFile(workbook, "leads.xlsx");

console.log("✅ Excel file created: leads.xlsx");
