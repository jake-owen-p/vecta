import { writeFileSync } from "fs";
import { join } from "path";
import { connect } from "puppeteer-real-browser";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RealBrowserPage = NonNullable<Awaited<ReturnType<typeof connect>>["page"]>;

const LINKEDIN_SALES_NAVIGATOR_SEARCH_URL =
  "https://www.linkedin.com/sales/search/people?recentSearchId=5229394068&sessionId=yylqBHQ%2BQx2A4tXL%2BOr48Q%3D%3D";

interface ListingDetail {
  name: string | null;
  detailUrl: string;
  summary: string | null;
  featuredImage: string | null;
  fields: Record<string, string | null>;
  socialLinks: string[];
}

const BASE_DIRECTORY_URL = "https://www.eu-startups.com/directory";

interface PaginationEntry {
  page: number;
  url: string;
  listingsFound: number;
  uniqueListingsProcessed: number;
}

const LISTING_DETAIL_EXTRACTION_SCRIPT = `
(() => {
  const selectText = (selectors) => {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        const text = element.textContent.trim();
        if (text) {
          return text;
        }
      }
    }
    return null;
  };

  const fields = {};

  document.querySelectorAll(".listing-details .wpbdp-field-display").forEach((field) => {
    const labelElement = field.querySelector(".field-label");
    const valueElement = field.querySelector(".value");

    if (!labelElement || !valueElement) {
      return;
    }

    const rawLabel = labelElement.textContent || "";
    const label = rawLabel.replace(/:\s*$/, "").trim();
    if (!label) {
      return;
    }

    const textContent = valueElement.textContent ? valueElement.textContent.trim() : "";

    fields[label] = textContent || null;
  });

  const socialLinks = [];

  document.querySelectorAll(".social-fields .social-field a").forEach((anchor) => {
    if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) {
      return;
    }

    const socialField = anchor.closest(".social-field");
    let linkText = null;

    if (socialField) {
      const classAttr = socialField.getAttribute("class") || "";
      const platformClass = classAttr
        .split(/\s+/)
        .find((className) => className && className !== "social-field");
      if (platformClass) {
        linkText = platformClass;
      }
    }

    if (!linkText) {
      const titleAttr = anchor.getAttribute("title");
      if (titleAttr) {
        linkText = titleAttr.trim();
      }
    }

    if (!linkText) {
      const ariaLabel = anchor.getAttribute("aria-label");
      if (ariaLabel) {
        linkText = ariaLabel.trim();
      }
    }

    if (!linkText) {
      const textValue = anchor.textContent ? anchor.textContent.trim() : "";
      if (textValue) {
        linkText = textValue;
      }
    }

    socialLinks.push(linkText ? linkText + " | " + anchor.href : anchor.href);
  });

  const featuredImageElement = document.querySelector(
    ".listing-thumbnail img, .wpbdp-listing img, .listing-image img, .wpbdp-single .wp-post-image"
  );

  return {
    name: selectText([
      ".listing-title h1",
      ".listing-title h2",
      ".listing-title h3",
      "h1.entry-title",
      ".entry-title",
    ]),
    detailUrl: window.location.href,
    summary: selectText([
      ".listing-description",
      ".excerpt-content",
      ".listing-excerpt",
      ".wpbdp-listing-excerpt .excerpt-content",
    ]),
    featuredImage:
      featuredImageElement instanceof HTMLImageElement ? featuredImageElement.src : null,
    fields,
    socialLinks,
  };
})();
`;

const buildSearchUrl = (page: number) => {
  const params = new URLSearchParams();
  params.set("dosrch", "1");
  params.set("q", "");
  params.set("wpbdp_view", "search");
  params.set("listingfields[1]", "");
  params.set("listingfields[2]", "-1");
  params.set("listingfields[7]", "");
  params.set("listingfields[6]", "");
  params.set("listingfields[4]", "2025");

  return `${BASE_DIRECTORY_URL}/page/${page}/?${params.toString()}`;
};

async function collectLinkedInLeadUrls(page: RealBrowserPage): Promise<string[]> {
  console.log("Navigating to LinkedIn Sales Navigator search results…");
  await page.goto(LINKEDIN_SALES_NAVIGATOR_SEARCH_URL, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  console.log("Waiting 2 minutes on the results page to allow content to stabilise…");
  await wait(120_000);

  console.log("Scrolling through results like a human…");
  for (let step = 0; step < 6; step++) {
    await page.evaluate(() => {
      window.scrollBy({
        top: window.innerHeight * 0.6,
        behavior: "smooth",
      });
    });
    await wait(1200 + step * 150);
  }

  console.log("Jumping to the bottom of the page…");
  await page.evaluate(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  });
  await wait(3000);

  const leadUrls = await page.$$eval(
    'a[data-control-name="view_lead_panel_via_search_lead_name"]',
    (anchors) => {
      const results = new Set<string>();
      anchors.forEach((anchor) => {
        if (anchor instanceof HTMLAnchorElement && anchor.href) {
          results.add(anchor.href);
        }
      });
      return Array.from(results);
    },
  );

  if (leadUrls.length === 0) {
    console.log("No Sales Navigator lead URLs were found on the page.");
  } else {
    console.log(`Collected ${leadUrls.length} Sales Navigator lead URLs:`);
    leadUrls.forEach((href) => console.log(`  • ${href}`));
  }

  return leadUrls;
}

async function scrapeEuStartupsListings() {
  const { browser, page } = await connect({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    connectOption: {
      defaultViewport: null,
    },
  });

  if (!page) {
    throw new Error("Failed to acquire a page instance from puppeteer-real-browser");
  }

  await page.setViewport({ width: 1920, height: 1080 });

  const detailPage = await browser.newPage();
  await detailPage.setViewport({ width: 1920, height: 1080 });

  const processedListingUrls = new Set<string>();
  const paginationSummary: PaginationEntry[] = [];
  const listings: ListingDetail[] = [];

  const createdAt = new Date().toISOString();
  const outputPath = join(process.cwd(), "leadgen", "eu-startups-listings-2025.json");

  const saveResults = () => {
    const output = {
      generatedAt: createdAt,
      lastUpdatedAt: new Date().toISOString(),
      source: BASE_DIRECTORY_URL,
      filter: {
        foundedYear: 2025,
      },
      pagesVisited: paginationSummary,
      totalListings: listings.length,
      listings,
    };

    writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
  };

  try {
    console.log("Starting pagination through EU-Startups directory (year 2025)...");

    console.log("Navigating to LinkedIn Sales Navigator login…");
    await page.goto(
      "https://www.linkedin.com/login?session_redirect=%2Fsales&_f=navigator&fromSignIn=true/1000",
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    );

    console.log("Waiting 40 seconds for manual authentication…");
    await wait(40000);

    await collectLinkedInLeadUrls(page);

    for (let pageNumber = 1; ; pageNumber++) {
      const searchUrl = buildSearchUrl(pageNumber);
      console.log(`\n[Pagination] Loading page ${pageNumber}: ${searchUrl}`);

      try {
        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });
      } catch (navigationError) {
        console.error(`Failed to load page ${pageNumber}:`, navigationError);
        break;
      }

      await wait(2000);

      const noListingsFound = await page.evaluate(() => {
        const searchPage = document.querySelector("#wpbdp-search-page");
        if (!searchPage) {
          return false;
        }

        const noListingsMessage = Array.from(searchPage.querySelectorAll("p"))
          .map((element) => element.textContent?.toLowerCase().trim() ?? "")
          .find((text) => text.includes("no listings found"));

        return Boolean(noListingsMessage);
      });

      if (noListingsFound) {
        console.log(`No listings found on page ${pageNumber}. Stopping pagination.`);
        break;
      }

      const pageListingUrls = await page.$$eval(
        ".wpbdp-listing .listing-title a",
        (anchors) =>
          anchors
            .map((anchor) => (anchor instanceof HTMLAnchorElement ? anchor.href : null))
            .filter((href): href is string => Boolean(href))
      );

      if (pageListingUrls.length === 0) {
        console.warn(`No listing URLs found on page ${pageNumber}. Stopping pagination to avoid infinite loop.`);
        break;
      }

      const normalizedUrls = pageListingUrls.reduce<string[]>((acc, originalHref) => {
        const [beforeHash] = originalHref.split("#");
        const normalizedHref = beforeHash ?? originalHref;

        if (processedListingUrls.has(normalizedHref)) {
          return acc;
        }

        processedListingUrls.add(normalizedHref);
        acc.push(normalizedHref);
        return acc;
      }, []);

      console.log(
        `Found ${pageListingUrls.length} listings on page ${pageNumber} (new: ${normalizedUrls.length}, total unique: ${processedListingUrls.size}).`
      );

      let processedOnPage = 0;

      for (const detailUrl of normalizedUrls) {
        console.log(
          `\n[Detail] Page ${pageNumber}, listing ${processedOnPage + 1}/${normalizedUrls.length}: ${detailUrl}`
        );

        try {
          await detailPage.goto(detailUrl, { waitUntil: "networkidle2", timeout: 60000 });
        } catch (navigationError) {
          console.error(`Failed to load detail page: ${detailUrl}`, navigationError);
          continue;
        }

        await wait(2000);

        try {
          const detail = await detailPage.evaluate(
            (script) => (0, eval)(script) as ListingDetail,
            LISTING_DETAIL_EXTRACTION_SCRIPT
          );

          listings.push(detail);
          processedOnPage += 1;
        } catch (detailError) {
          console.error(`Failed to extract detail for ${detailUrl}`, detailError);
          continue;
        }

        await wait(1000);
      }

      paginationSummary.push({
        page: pageNumber,
        url: searchUrl,
        listingsFound: pageListingUrls.length,
        uniqueListingsProcessed: processedOnPage,
      });

      saveResults();

      await wait(1500);
    }

    await detailPage.close();

    if (listings.length === 0) {
      console.warn("No listings were processed. No output file generated.");
    } else {
      saveResults();
      console.log(`\nFinished scraping. Data saved to ${outputPath}`);
      console.log(`Total listings scraped: ${listings.length}`);
    }

    await browser.close();
  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
    process.exit(1);
  }
}

scrapeEuStartupsListings().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});


