import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { writeFileSync } from "fs";
import { join } from "path";

// Add stealth plugin
puppeteer.use(StealthPlugin());

// Helper function to wait using Promise-based setTimeout
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Type definitions
interface Person {
  role: string;
  name: string;
  linkedinUrl: string | null;
}

interface Company {
  name: string;
  description: string | null;
  location: string | null;
  industry: string | null;
  founded: string | null;
  people: Person[];
}

async function scrapePortfolio() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log("Navigating to portfolio page...");
    await page.goto(
      "https://www.joinef.com/portfolio/?filter-founded=2020,2021,2022,2023,2024,2025&filter-stage=pre-seed,seed,series-a,series-b",
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    );

    console.log("Page loaded. Starting to load more companies...");
    
    let loadMoreExists = true;
    let clickCount = 0;
    const maxClicks = 50; // Safety limit to prevent infinite loops

    while (loadMoreExists && clickCount < maxClicks) {
      // Scroll to bottom to ensure load more button is visible
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait a bit for any lazy loading
      await wait(1500);

      // Check if load more button exists using the exact selector from the HTML
      const loadMoreButton = await page.$(
        'a.paging__loadmore.btn--loadmore[href*="pagenum"]'
      );

      if (!loadMoreButton) {
        console.log("No more 'Load more' button found. Done!");
        loadMoreExists = false;
        break;
      }

      // Check if button is visible and has display: block
      const buttonInfo = await loadMoreButton.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          href: el.getAttribute("href"),
        };
      });

      if (
        buttonInfo.display === "none" ||
        buttonInfo.visibility === "hidden" ||
        buttonInfo.opacity === "0"
      ) {
        console.log("Load more button is not visible. Done!");
        loadMoreExists = false;
        break;
      }

      clickCount++;
      console.log(
        `Clicking 'Load more' button (attempt ${clickCount}, href: ${buttonInfo.href})...`
      );

      // Get the current number of companies before clicking
      const companiesBefore = await page.$$eval(
        "article, [class*='company'], .company-card",
        (elements) => elements.length
      );

      // Scroll to button before clicking
      await loadMoreButton.scrollIntoView();

      // Click the load more button
      // The page might navigate or load content via AJAX
      const navigationPromise = page
        .waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
        .catch(() => {
          // Navigation might not happen if it's AJAX loading
          return null;
        });

      await Promise.all([
        navigationPromise,
        loadMoreButton.click(),
      ]);

      // Wait for content to load (whether via navigation or AJAX)
      await wait(3000);

      // Check if new content was loaded
      const companiesAfter = await page.$$eval(
        "article, [class*='company'], .company-card",
        (elements) => elements.length
      );

      console.log(
        `Loaded page ${clickCount + 1} (companies: ${companiesBefore} → ${companiesAfter})`
      );

      // If no new companies were loaded, the button might be gone
      if (companiesAfter === companiesBefore) {
        console.log("No new companies loaded. Checking if button still exists...");
        await wait(1000);
        const stillExists = await page.$(
          'a.paging__loadmore.btn--loadmore[href*="pagenum"]'
        );
        if (!stillExists) {
          console.log("Button no longer exists. Done!");
          loadMoreExists = false;
          break;
        }
      }
    }

    if (clickCount >= maxClicks) {
      console.log(`Reached maximum click limit (${maxClicks}). Stopping.`);
    }

    // Final scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await wait(2000);

    console.log("Scraping complete!");
    console.log(`Total pages loaded: ${clickCount + 1}`);

    // Extract all company data
    console.log("Extracting company data...");
    const companies: Company[] = await page.evaluate(() => {
      const companyTiles = document.querySelectorAll(".tile--company");
      const companies: Company[] = [];

      companyTiles.forEach((tile) => {
        // Company name
        const nameElement = tile.querySelector(".tile__name span, .tile__name");
        const name = nameElement?.textContent?.trim() ?? "";

        // Description
        const descriptionElement = tile.querySelector(".tile__description");
        const description = descriptionElement?.textContent?.trim() ?? null;

        // Location
        const locationElement = tile.querySelector(".locationtag");
        const location = locationElement?.textContent?.trim() ?? null;

        // Industry
        const industryElement = tile.querySelector(".categorytag");
        const industry = industryElement?.textContent?.trim() ?? null;

        // Founded year
        let founded: string | null = null;
        const metaRows = tile.querySelectorAll(".meta__row");
        metaRows.forEach((row) => {
          const nameElements = row.querySelectorAll(".meta__row__name");
          if (nameElements.length >= 2) {
            const label = nameElements[0]?.textContent?.trim();
            const value = nameElements[1]?.textContent?.trim();
            if (label === "Founded" && value) {
              founded = value;
            }
          }
        });

        // People (founders, CEOs, CTOs, etc.)
        const people: Person[] = [];
        const peopleRows = tile.querySelectorAll(".meta__row");
        
        peopleRows.forEach((row) => {
          const roleElement = row.querySelector(".meta__row__role");
          const founderElement = row.querySelector(".meta__row__founder");
          
          // Only process rows that have both role and founder elements (not "Founded" rows)
          if (roleElement && founderElement) {
            const role = roleElement.textContent?.trim() ?? "";
            const nameLink = founderElement.querySelector("a.text-link");
            const name = nameLink?.textContent?.trim() ?? founderElement.textContent?.trim() ?? "";
            const linkedinUrl = nameLink?.getAttribute("href") ?? null;

            if (name && role) {
              people.push({
                role,
                name,
                linkedinUrl,
              });
            }
          }
        });

        if (name) {
          companies.push({
            name,
            description,
            location,
            industry,
            founded,
            people,
          });
        }
      });

      return companies;
    });

    console.log(`Found ${companies.length} companies`);

    // Save to JSON file
    const outputPath = join(process.cwd(), "leadgen", "portfolio-data.json");
    writeFileSync(outputPath, JSON.stringify(companies, null, 2), "utf-8");
    console.log(`Data saved to ${outputPath}`);

    // Print summary
    console.log("\n=== Summary ===");
    console.log(`Total companies: ${companies.length}`);
    const totalPeople = companies.reduce((sum, company) => sum + company.people.length, 0);
    console.log(`Total people: ${totalPeople}`);

    // Keep browser open for inspection (remove if you want it to close automatically)
    // await browser.close();
    console.log("Browser will remain open for inspection. Press Ctrl+C to close.");

  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
    process.exit(1);
  }
}

// Run the scraper
scrapePortfolio().catch(console.error);

