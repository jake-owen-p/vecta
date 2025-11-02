import "dotenv/config";

import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { perplexity } from "@ai-sdk/perplexity";
import { z } from "zod";

const { PERPLEXITY_API_KEY, OPENAI_API_KEY } = process.env;

if (!PERPLEXITY_API_KEY) {
  console.error("PERPLEXITY_API_KEY environment variable is required.");
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY environment variable is required.");
  process.exit(1);
}

process.env.PERPLEXITY_API_KEY = PERPLEXITY_API_KEY;
process.env.OPENAI_API_KEY = OPENAI_API_KEY;

const CompanyPayloadSchema = z.object({
  name: z.string(),
  foundedYear: z.string().nullable(),
  locationCity: z.string().nullable(),
  totalFunding: z.string().nullable(),
  latestFundingStage: z.string().nullable(),
  description: z.string().nullable(),
  website: z.string().nullable(),
});

type CompanyPayload = z.infer<typeof CompanyPayloadSchema>;

async function researchCompany(companyName: string): Promise<{
  rawResearch: string;
  structured: CompanyPayload;
}> {
  console.log(`🔎 Researching ${companyName} with Perplexity…`);

  const { text: rawResearch } = await generateText({
    // @ts-ignore - LanguageModelV2 is compatible at runtime with LanguageModelV1
    model: perplexity("sonar-pro"),
    temperature: 0.2,
    maxRetries: 2,
    system:
      "You are a meticulous startup research analyst. Return detailed, factual findings with clear sourcing.",
    prompt: `Research the startup "${companyName}". Provide the following details if available: company name, founding year, current headquarters city, total funding raised, latest funding round stage, a short product/mission description, official website URL, and cite the sources you used. Present the response as labeled bullet points. If data is unknown, explicitly mark it as unknown.`,
  });

  const { object: structured } = await generateObject({
    // @ts-ignore - LanguageModelV2 is compatible at runtime with LanguageModelV1
    model: openai("gpt-5"),
    schema: CompanyPayloadSchema,
    system:
      "You convert unstructured startup research into a clean JSON payload with consistent fields.",
    prompt:
      `Using the research below, extract the requested fields.\n\nCompany requested: ${companyName}\n\nResearch:\n${rawResearch}\n\nRules:\n- Preserve the original company name if the research confirms it, otherwise use the requested company name.\n- Return the founded year as a four-digit string (e.g., "2018").\n- Use only the current city (no country/state) for the locationCity field.\n- totalFunding should include the currency (e.g., "$250M" or "USD 250 million").\n- latestFundingStage should match common venture funding labels (e.g., "Series B", "Seed", "IPO").\n- Use a concise product/mission statement (<= 30 words) for description.\n- Provide a fully-qualified URL for website.\n- If any detail is missing or conflicting, return null for that field.`,
  });

  return { rawResearch, structured };
}

async function main() {
  const companyNames = process.argv.slice(2).map((name) => name.trim()).filter(Boolean);

  if (companyNames.length === 0) {
    console.error("Usage: pnpm tsx leadgen/perplexity-enrich.ts \"Company Name\" [\"Another Company\"]");
    process.exit(1);
  }

  const results: CompanyPayload[] = [];

  for (const companyName of companyNames) {
    try {
      const { rawResearch, structured } = await researchCompany(companyName);

      if (process.env.SHOW_RESEARCH === "1") {
        console.log("\n--- Raw Perplexity Research ---\n");
        console.log(rawResearch);
        console.log("\n--- End Research ---\n");
      }

      results.push(structured);
      console.log(`✅ Structured payload ready for ${structured.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to enrich ${companyName}: ${message}`);
    }
  }

  if (results.length === 0) {
    process.exit(1);
  }

  const output = results.length === 1 ? results[0] : results;
  console.log("\n--- JSON Payload ---\n");
  console.log(JSON.stringify(output, null, 2));
}

void main();

