#!/usr/bin/env python3
"""
Debug version to see what HTML is being received
"""

import asyncio
import logging
from crawl4ai import AsyncWebCrawler
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_page():
    """Debug what HTML we're actually receiving"""
    url = "https://www.healthpoint.co.nz/gps-accident-urgent-medical-care/north-auckland"
    
    async with AsyncWebCrawler(verbose=True) as crawler:
        logger.info(f"Fetching: {url}")
        
        result = await crawler.arun(url=url)
        if not result.success:
            logger.error(f"Failed to crawl {url}")
            return
            
        # Save raw HTML
        with open('debug_page.html', 'w', encoding='utf-8') as f:
            f.write(result.html)
        logger.info("Saved raw HTML to debug_page.html")
        
        # Parse and check structure
        soup = BeautifulSoup(result.html, 'html.parser')
        
        # Check for basic-list
        basic_list = soup.find('ul', class_='basic-list')
        logger.info(f"Found ul.basic-list: {basic_list is not None}")
        
        if basic_list:
            h4_count = len(basic_list.find_all('h4'))
            logger.info(f"Number of h4 elements in basic-list: {h4_count}")
            
            # Show first few h4 > a links
            h4_elements = basic_list.find_all('h4')[:5]
            for i, h4 in enumerate(h4_elements):
                link = h4.find('a')
                if link:
                    logger.info(f"Link {i+1}: {link.get('href')} - {link.get_text(strip=True)}")
        else:
            # Check what main content containers exist
            main_containers = soup.find_all(['ul', 'div'], class_=True)
            logger.info("Main containers with classes:")
            for container in main_containers[:10]:
                classes = ' '.join(container.get('class', []))
                logger.info(f"  <{container.name} class='{classes}'>")
            
        # Check for pagination
        pagination = soup.find('span', class_='pagination')
        logger.info(f"Found span.pagination: {pagination is not None}")
        
        if pagination:
            next_link = pagination.find('a', class_='next')
            logger.info(f"Found next link: {next_link is not None}")
            if next_link:
                logger.info(f"Next URL: {next_link.get('href')}")

if __name__ == "__main__":
    asyncio.run(debug_page())
