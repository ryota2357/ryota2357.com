import { DOMParser } from "jsr:@b-fuze/deno-dom@0.1.56";

const colors = {
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  blue: "\u001b[34m",
  cyan: "\u001b[36m",
  reset: "\u001b[0m",
  dim: "\u001b[2m",
} as const;

const log = {
  info: (msg: string) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}${msg}${colors.reset}`),
  warn: (msg: string) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}${msg}${colors.reset}`),
  dim: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
  plain: (msg: string) => console.log(msg),
};

type LinkCheckResult = {
  url: string;
  status: number | "error";
  error?: string;
  isExternal: boolean;
};

type CrawlResult = {
  checked: Map<string, LinkCheckResult>;
  brokenLinks: Map<string, Set<string>>; // broken URL -> set of pages that contain it
};

async function promptPort(): Promise<number> {
  Deno.stdout.writeSync(
    new TextEncoder().encode(
      `${colors.cyan}Enter the development server port: ${colors.reset}`,
    ),
  );
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  if (n === null) {
    log.error("Failed to read input");
    Deno.exit(1);
  }
  const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
  const port = parseInt(input, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    log.error(`Invalid port number: ${input}`);
    Deno.exit(1);
  }
  return port;
}

function isExternalUrl(url: string, baseHost: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.host !== baseHost;
  } catch {
    return false;
  }
}

function normalizeUrl(url: string, baseUrl: string): string | null {
  try {
    const resolved = new URL(url, baseUrl);
    if (!resolved.protocol.startsWith("http")) {
      return null;
    }
    resolved.hash = "";
    return resolved.href;
  } catch {
    return null;
  }
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  if (!doc) {
    return links;
  }
  for (const anchor of doc.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (href) {
      const normalized = normalizeUrl(href, baseUrl);
      if (normalized) {
        links.push(normalized);
      }
    }
  }
  return links;
}

async function checkUrl(
  url: string,
  isExternal: boolean,
): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    isExternal ? 10000 : 5000,
  );
  try {
    const response = await fetch(url, {
      method: isExternal ? "HEAD" : "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "LinkChecker/1.0 (ryota2357.com)",
      },
    });
    clearTimeout(timeoutId);
    return {
      url,
      status: response.status,
      isExternal,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      url,
      status: "error",
      error: errorMessage,
      isExternal,
    };
  }
}

async function fetchPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "LinkChecker/1.0 (ryota2357.com)",
      },
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  }
}

async function crawlSite(baseUrl: string): Promise<CrawlResult> {
  const baseHost = new URL(baseUrl).host;
  const checked = new Map<string, LinkCheckResult>();
  const brokenLinks = new Map<string, Set<string>>();
  const queue: { url: string; referrer: string }[] = [
    {
      url: baseUrl,
      referrer: "(start)",
    },
  ];

  // Track external links to check them in batches
  const externalLinksToCheck: { url: string; referrer: string }[] = [];

  log.info(`\nStarting crawl from: ${baseUrl}\n`);

  // Crawl internal pages
  while (true) {
    const queueTop = queue.shift();
    if (!queueTop) break;
    const { url, referrer } = queueTop;
    if (checked.has(url)) continue;

    log.dim(`Crawling: ${url}`);

    const html = await fetchPage(url);
    if (html === null) {
      const result = await checkUrl(url, false);
      checked.set(url, result);
      if (result.status !== 200) {
        const referrers = brokenLinks.get(url) || new Set<string>();
        referrers.add(referrer);
        brokenLinks.set(url, referrers);
      }
      continue;
    }
    checked.set(url, { url, status: 200, isExternal: false });

    for (const link of extractLinks(html, url)) {
      if (checked.has(link)) continue;
      if (isExternalUrl(link, baseHost)) {
        externalLinksToCheck.push({ url: link, referrer: url });
      } else {
        queue.push({ url: link, referrer: url });
      }
    }
  }

  log.plain("");
  log.info(`Checking ${externalLinksToCheck.length} external links...`);

  const uniqueExternalLinks = new Map<string, Set<string>>();
  for (const { url, referrer } of externalLinksToCheck) {
    const referrers = uniqueExternalLinks.get(url) || new Set<string>();
    referrers.add(referrer);
    uniqueExternalLinks.set(url, referrers);
  }

  const CONCURRENCY = 5;
  const externalEntries = Array.from(uniqueExternalLinks.entries());
  let externalCount = 0;
  for (let i = 0; i < externalEntries.length; i += CONCURRENCY) {
    const batch = externalEntries.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ([url, referrers]) => {
        const result = await checkUrl(url, true);
        externalCount += 1;
        log.dim(
          `[${externalCount}/${uniqueExternalLinks.size}]${colors.reset} ${colors.dim}${url}`,
        );
        return { url, referrers, result };
      }),
    );
    for (const { url, referrers, result } of results) {
      checked.set(url, result);
      if (
        result.status === "error" ||
        (typeof result.status === "number" && result.status >= 400)
      ) {
        brokenLinks.set(url, referrers);
      }
    }
  }

  return { checked, brokenLinks };
}

function printReport(result: CrawlResult): void {
  const { checked, brokenLinks } = result;

  const internalCount = Array.from(checked.values()).filter(
    (r) => !r.isExternal,
  ).length;
  const externalCount = Array.from(checked.values()).filter(
    (r) => r.isExternal,
  ).length;

  log.info("\nLink Check Report");
  log.plain(
    `${colors.cyan}Total links checked:${colors.reset} ${checked.size}`,
  );
  log.plain(`  - Internal: ${internalCount}`);
  log.plain(`  - External: ${externalCount}`);
  log.plain("");

  if (brokenLinks.size === 0) {
    log.success("✓ All links are valid!\n");
    return;
  }

  log.error(`✗ Found ${brokenLinks.size} broken link(s):\n`);

  for (const [url, referrers] of brokenLinks) {
    const result = checked.get(url);
    const statusDisplay =
      result?.status === "error"
        ? `ERROR: ${result.error}`
        : `Status: ${result?.status}`;

    log.error(`  ✗ ${url}`);
    log.dim(`    ${statusDisplay}`);
    log.dim(`    Found on:`);
    for (const referrer of referrers) {
      log.dim(`      - ${referrer}`);
    }
    log.plain("");
  }
}

async function main() {
  const port = await promptPort();
  const baseUrl = `http://localhost:${port}`;

  log.dim(`\nChecking if server is running at ${baseUrl}...`);
  try {
    const response = await fetch(baseUrl, { method: "HEAD" });
    if (!response.ok) {
      log.error(
        `Server returned ${response.status}. Is the development server running?`,
      );
      Deno.exit(1);
    }
  } catch {
    log.error(
      `Cannot connect to ${baseUrl}. Please start the development server first.`,
    );
    Deno.exit(1);
  }
  log.success("Server is running!");

  const result = await crawlSite(baseUrl);
  printReport(result);

  if (result.brokenLinks.size > 0) {
    Deno.exit(1);
  }
}

main();
