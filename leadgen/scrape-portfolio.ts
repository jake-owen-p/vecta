import { writeFileSync } from "fs";
import { join } from "path";
import { connect } from "puppeteer-real-browser";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RealBrowserPage = NonNullable<Awaited<ReturnType<typeof connect>>["page"]>;

const LINKEDIN_SALES_NAVIGATOR_BASE_URL = "https://www.linkedin.com/sales/search/people";
const LINKEDIN_SALES_NAVIGATOR_QUERY_PARAMS =
  "query=(spellCorrectionEnabled%3Atrue%2CrecentSearchParam%3A(id%3A5229394068%2CdoLogHistory%3Atrue)%2Cfilters%3AList((type%3AREGION%2Cvalues%3AList((id%3A105072130%2Ctext%3APoland%2CselectionType%3AINCLUDED)%2C(id%3A103420483%2Ctext%3ANorth%2520Macedonia%2CselectionType%3AINCLUDED)%2C(id%3A102264497%2Ctext%3AUkraine%2CselectionType%3AINCLUDED)%2C(id%3A106670623%2Ctext%3ARomania%2CselectionType%3AINCLUDED)%2C(id%3A104508036%2Ctext%3ACzechia%2CselectionType%3AINCLUDED)))%2C(type%3AYEARS_OF_EXPERIENCE%2Cvalues%3AList((id%3A3%2Ctext%3A3%2520to%25205%2520years%2CselectionType%3AINCLUDED)%2C(id%3A4%2Ctext%3A6%2520to%252010%2520years%2CselectionType%3AINCLUDED)))%2C(type%3ACURRENT_TITLE%2Cvalues%3AList((id%3A5314%2Ctext%3ASenior%2520Solutions%2520Engineer%2CselectionType%3AINCLUDED)%2C(id%3A1313%2Ctext%3ASolutions%2520Engineer%2CselectionType%3AINCLUDED)%2C(id%3A13793%2Ctext%3ASenior%2520Implementation%2520Engineer%2CselectionType%3AINCLUDED)%2C(id%3A3142%2Ctext%3AImplementation%2520Engineer%2CselectionType%3AINCLUDED))))%2Ckeywords%3Asolutions%2520engineer)&sessionId=yylqBHQ%2BQx2A4tXL%2BOr48Q%3D%3D";
const OUTPUT_CSV_PATH = join(process.cwd(), "leadgen", "linkedin-leads.csv");

const buildSearchUrl = (page: number) =>
  `${LINKEDIN_SALES_NAVIGATOR_BASE_URL}?page=${page}&${LINKEDIN_SALES_NAVIGATOR_QUERY_PARAMS}`;

async function simulateHumanScrollToBottom(page: RealBrowserPage) {
  console.log("Scrolling the search results container in steps…");

  while (true) {
    const preScroll = await page.evaluate(() => {
      const container = document.getElementById("search-results-container");
      if (!container) {
        return { status: "missing" } as const;
      }

      const maxScrollPosition = Math.max(container.scrollHeight - container.clientHeight, 0);
      const currentPosition = container.scrollTop;

      if (currentPosition >= maxScrollPosition - 5) {
        return { status: "done" } as const;
      }

      const step = Math.max(container.clientHeight * 0.8, 300);
      container.scrollBy(0, step);

      return {
        status: "scrolled",
        previousPosition: currentPosition,
      } as const;
    });

    if (preScroll.status === "missing") {
      console.warn('Unable to locate element with id="search-results-container".');
      break;
    }

    if (preScroll.status === "done") {
      console.log("Already at the bottom of the results container.");
      break;
    }

    await wait(2000);

    const postScroll = await page.evaluate(() => {
      const container = document.getElementById("search-results-container");
      if (!container) {
        return { status: "missing" } as const;
      }

      const currentPosition = container.scrollTop;
      const maxScrollPosition = Math.max(container.scrollHeight - container.clientHeight, 0);

      if (currentPosition >= maxScrollPosition - 5) {
        return { status: "done" } as const;
      }

      return {
        status: "progress",
        currentPosition,
      } as const;
    });

    if (postScroll.status === "missing") {
      console.warn('Unable to locate element with id="search-results-container" after scrolling.');
      break;
    }

    if (postScroll.status === "done") {
      console.log("Reached the bottom of the results container.");
      break;
    }

    if (postScroll.status === "progress" && postScroll.currentPosition <= preScroll.previousPosition) {
      console.log("No further progress detected while scrolling the results container. Stopping.");
      break;
    }
  }
}

async function collectLinkedInLeadUrlsForPage(
  page: RealBrowserPage,
  pageNumber: number,
  waitMs: number,
): Promise<string[]> {
  const searchUrl = buildSearchUrl(pageNumber);
  console.log(`Opening LinkedIn Sales Navigator search results (page ${pageNumber})…`);
  await page.goto(searchUrl, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  console.log(`Waiting ${Math.round(waitMs / 1000)} seconds for content to stabilise…`);
  await wait(waitMs);

  await simulateHumanScrollToBottom(page);

  const leadUrls = await page.$$eval(
    'a[data-control-name="view_lead_panel_via_search_lead_name"]',
    (anchors) => {
      const urls = new Set<string>();
      anchors.forEach((anchor) => {
        if (anchor instanceof HTMLAnchorElement && anchor.href) {
          urls.add(anchor.href);
        }
      });
      return Array.from(urls);
    },
  );

  if (leadUrls.length === 0) {
    console.warn(`No Sales Navigator lead URLs were detected on page ${pageNumber}.`);
  } else {
    console.log(`Captured ${leadUrls.length} Sales Navigator lead URLs on page ${pageNumber}:`);
    leadUrls.forEach((href) => console.log(`  • ${href}`));
  }

  return leadUrls;
}

async function main() {
  const { browser, page } = await connect({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    connectOption: {
      defaultViewport: null,
    },
  });

  if (!page) {
    throw new Error("Failed to obtain a page from puppeteer-real-browser.");
  }

  try {
    await page.setViewport({ width: 1440, height: 900 });

    const collectedUrls = new Set<string>();

    for (let pageNumber = 1; pageNumber <= 18; pageNumber++) {
      try {
        const waitMs = pageNumber === 1 ? 60_000 : 15_000;
        const leadUrls = await collectLinkedInLeadUrlsForPage(page, pageNumber, waitMs);
        leadUrls.forEach((url) => collectedUrls.add(url));
      } catch (error) {
        console.error(`Failed to process page ${pageNumber}:`, error);
      }
    }

    const uniqueLeadUrls = Array.from(collectedUrls);
    uniqueLeadUrls.sort();

    const csvContent = ["url", ...uniqueLeadUrls.map((url) => `"${url.replace(/"/g, '""')}"`)].join(
      "\n",
    );

    writeFileSync(OUTPUT_CSV_PATH, `${csvContent}\n`, "utf8");

    console.log("\n=== Lead URL Summary ===");
    console.log(`Total unique leads captured: ${uniqueLeadUrls.length}`);
    if (!uniqueLeadUrls.length) {
      console.log(
        "No leads were found. Ensure you are logged in and that the Sales Navigator results are visible.",
      );
    } else {
      console.log(`Lead URLs saved to: ${OUTPUT_CSV_PATH}`);
    }

    console.log("\nBrowser will remain open for inspection. Press Ctrl+C to exit when finished.");
  } catch (error) {
    console.error("Fatal error during LinkedIn lead collection:", error);
    await browser.close();
    process.exit(1);
  }
}

void main();
