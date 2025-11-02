import * as fs from "fs";
import * as XLSX from "xlsx";

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

const leads: Company[] = JSON.parse(
  fs.readFileSync("./leads.json", "utf-8")
);

// Prepare data for Excel
const companiesSheet: any[] = [];
const peopleSheet: any[] = [];

leads.forEach((company, index) => {
  const companyId = `C${String(index + 1).padStart(3, "0")}`;

  // --- Companies Sheet Row ---
  companiesSheet.push({
    companyId,
    name: company.name,
    location: company.location,
    industry: company.industry,
    website: company.website,
    description: company.shortDescription || company.description,
    totalFunding: company.totalFunding,
    fundingStage: company.fundingStage,
    isAi: company.isAi ? "Yes" : "No",
    founded: company.founded,
  });

  // --- People Sheet Rows ---
  company.people.forEach((person) => {
    peopleSheet.push({
      companyId,
      companyName: company.name,
      name: person.name,
      role: person.role,
      email: person.email,
      phoneNumber: person.phoneNumber,
      linkedin: person.linkedinUrl,
      apolloId: person.apolloId,
    });
  });
});

// Create a new Excel workbook
const workbook = XLSX.utils.book_new();

// Add sheets
const companiesWS = XLSX.utils.json_to_sheet(companiesSheet);
const peopleWS = XLSX.utils.json_to_sheet(peopleSheet);

XLSX.utils.book_append_sheet(workbook, companiesWS, "Companies");
XLSX.utils.book_append_sheet(workbook, peopleWS, "People");

// Write to file
XLSX.writeFile(workbook, "leads.xlsx");

console.log("✅ Excel file created: leads.xlsx");
