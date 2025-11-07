import asyncio
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
import urllib.request

from crawl4ai import (
    AsyncWebCrawler,
    CrawlerRunConfig,
    CacheMode,
    DefaultMarkdownGenerator,
    LXMLWebScrapingStrategy,
)

INDEX_URL = "https://healthify.nz/health-a-z/a"
OUTPUT_DIR = Path("data")
CONCURRENCY = 5
USER_AGENT = "NexWaveSolutions-HealthifyCrawler/1.0"
MAX_PAGES = None  # set to an int to cap pages (e.g., 200)

# Simple, dependency-free HTML fetch for the index page
def fetch_index_html(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="ignore")

# Extract condition links from the A index page; keep only /health-a-z/a/... pages
def extract_condition_links(index_html: str, base_url: str) -> list[str]:
    hrefs = re.findall(r'href=["\'](.*?)["\']', index_html, flags=re.IGNORECASE)
    urls = set()
    for href in hrefs:
        if not href or href.startswith("#") or href.startswith("mailto:"):
            continue
        absolute = urljoin(base_url, href)
        # Filter strictly to A-section condition pages
        if re.match(r"^https?://(www\.)?healthify\.nz/health-a-z/a/[^?#]+/?$", absolute, flags=re.IGNORECASE):
            # exclude index page itself (exact A page)
            if absolute.rstrip("/").lower() != INDEX_URL.rstrip("/").lower():
                urls.add(absolute.rstrip("/") + "/")
    return sorted(urls)

def safe_filename(url: str) -> str:
    p = urlparse(url)
    parts = [seg for seg in p.path.split("/") if seg]
    # Expected: ['health-a-z', 'a', '<slug>']
    letter = parts[1] if len(parts) >= 2 else "a"
    slug = parts[2] if len(parts) >= 3 else (parts[-1] if parts else "index")
    base = f"health-a-z-{letter}-{slug}"
    if len(base) > 150:
        base = base[:150]
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]
    return f"{base}-{h}.json"

def infer_letter_and_slug(url: str) -> tuple[str, str]:
    p = urlparse(url)
    parts = [seg for seg in p.path.split("/") if seg]
    letter = parts[1] if len(parts) >= 2 else "a"
    slug = parts[2] if len(parts) >= 3 else (parts[-1] if parts else "index")
    return letter, slug

def clean_markdown(markdown: str, page_url: str) -> str:
    """Remove site chrome noise like breadcrumbs, QR/Print lines, and page-self QR image."""
    lines = markdown.splitlines()
    cleaned: list[str] = []

    # Drop leading breadcrumb list (eg: "1. [Home] ...")
    import re as _re
    breadcrumb_pattern = _re.compile(r"^\s*\d+\.\s*\[.*?\]\(https?://healthify\.nz/.*?\)\s*$", _re.I)
    idx = 0
    while idx < len(lines) and breadcrumb_pattern.match(lines[idx] or ""):
        idx += 1
    # Skip following blank lines
    while idx < len(lines) and (lines[idx] or "").strip() == "":
        idx += 1

    # Process remaining lines
    page_url_img_pattern = _re.compile(r"^!\[[^\]]*\]\(" + _re.escape(page_url.rstrip("/")) + r"/?\)\s*$", _re.I)
    drop_exact = {"qr code", "print", "open all close all"}
    for i in range(idx, len(lines)):
        raw = lines[i] or ""
        s = raw.strip().lower()
        if s in drop_exact:
            continue
        if page_url_img_pattern.match(raw):
            continue
        cleaned.append(lines[i])

    return "\n".join(cleaned).strip() + "\n"

async def crawl_one(crawler: AsyncWebCrawler, url: str) -> dict | None:
    try:
        result = await crawler.arun(
            url=url,
            config=CrawlerRunConfig(
                cache_mode=CacheMode.BYPASS,
                # Generate markdown using default generator; library returns a MarkdownGenerationResult
                markdown_generator=DefaultMarkdownGenerator(),
                scraping_strategy=LXMLWebScrapingStrategy(),
                css_selector="#main, main, article",
                excluded_selector=(
                    'header, nav, footer, aside, '
                    'nav[aria-label="breadcrumb"], ol.breadcrumbs, .breadcrumb, [class*="breadcrumb"], '
                    '.cookie, .ads, .newsletter, '
                    '.share, .social, .site-header, .site-footer, '
                    '[class*="qr"], [id*="qr"], .qr, .qr-code, .qrCode, .qr-code-block, '
                    '[class*="print"], .print, .print-link, a[href*="print"], '
                    '.open-all, .close-all, [class*="toggle"], [id*="toggle"]'
                ),
                exclude_social_media_links=True,
                exclude_social_media_domains=[
                    "facebook.com", "linkedin.com", "instagram.com", "x.com", "twitter.com"
                ],
                user_agent=USER_AGENT,
                verbose=False,
            ),
        )
        md_obj = getattr(result, "markdown", None)
        markdown = (
            getattr(md_obj, "raw_markdown", None)
            if md_obj is not None
            else None
        ) or getattr(result, "cleaned_html", "") or getattr(result, "html", "")
        if not markdown.strip():
            return None
        # Post-process to remove residual chrome (breadcrumbs/QR/Print)
        markdown = clean_markdown(markdown, url)
        letter, slug = infer_letter_and_slug(url)
        return {
            "url": url,
            "title": slug.replace("-", " ").title(),
            "markdown": markdown,
            "metadata": {
                "source": "healthify",
                "crawledAt": datetime.utcnow().isoformat() + "Z",
                "letter": letter.lower(),
                "slug": slug.lower(),
            },
        }
    except Exception:
        return None

async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Fetching A-index page…")
    html = fetch_index_html(INDEX_URL)
    urls = extract_condition_links(html, INDEX_URL)
    if MAX_PAGES:
        urls = urls[:MAX_PAGES]
    print(f"Discovered {len(urls)} condition pages under A")

    success = 0
    errors = 0
    async with AsyncWebCrawler() as crawler:
        sem = asyncio.Semaphore(CONCURRENCY)

        async def bound(u: str) -> int:
            async with sem:
                doc = await crawl_one(crawler, u)
                if not doc:
                    return 0
                out_path = OUTPUT_DIR / safe_filename(u)
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(doc, f, ensure_ascii=False, indent=2)
                return 1

        tasks = [asyncio.create_task(bound(u)) for u in urls]
        for i, t in enumerate(asyncio.as_completed(tasks), 1):
            try:
                success += await t
            except Exception:
                errors += 1
            if i % 20 == 0:
                print(f"Progress: {i}/{len(urls)} processed; {success} saved")

    print(f"Done. Saved {success} documents to ./data; {len(urls) - success} skipped/failed")

if __name__ == "__main__":
    asyncio.run(main())

