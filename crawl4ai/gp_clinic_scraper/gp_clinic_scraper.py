#!/usr/bin/env python3
"""
GP Clinic Scraper for Healthpoint.co.nz
Extracts clinic details and exports to CSV format
"""

import asyncio
import csv
import os
import re
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional
import logging

# Install requirements: pip install crawl4ai beautifulsoup4 aiohttp
from crawl4ai import AsyncWebCrawler
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GPClinicScraper:
    def __init__(self):
        self.base_url = "https://www.healthpoint.co.nz"
        self.start_url = "https://www.healthpoint.co.nz/gps-accident-urgent-medical-care/gp/"
        self.clinic_data = []
        
    async def scrape_all_clinics(self, debug_mode: bool = False) -> List[Dict]:
        """Main method to scrape all GP clinics"""
        # Enhanced crawler configuration based on web research
        crawler_config = {
            'headless': not debug_mode,  # Non-headless for debugging
            'verbose': True
        }
        
        async with AsyncWebCrawler(**crawler_config) as crawler:
            logger.info("Starting GP clinic scraping process")
            logger.info(f"Debug mode: {'ON' if debug_mode else 'OFF'}")
            
            # Get all clinic URLs from paginated listing
            clinic_urls = await self._get_all_clinic_urls(crawler, debug_mode)
            logger.info(f"Found {len(clinic_urls)} clinic URLs")
            
            # Extract details from each clinic
            for i, url in enumerate(clinic_urls, 1):
                logger.info(f"Processing clinic {i}/{len(clinic_urls)}: {url}")
                clinic_data = await self._extract_clinic_details(crawler, url, debug_mode)
                if clinic_data:
                    self.clinic_data.append(clinic_data)
                    
                # Rate limiting - be respectful
                await asyncio.sleep(1)
                
        return self.clinic_data
    
    async def _get_all_clinic_urls(self, crawler, debug_mode: bool = False) -> List[str]:
        """Extract all clinic URLs from paginated listing"""
        clinic_urls = []
        current_url = self.start_url
        page_num = 1
        
        while current_url:
            logger.info(f"Scraping listing page {page_num}: {current_url}")
            
            try:
                # Enhanced crawl configuration for dynamic content
                crawl_config = {
                    'wait_until': 'networkidle',  # Wait for all network requests
                    'timeout': 30000,  # 30 second timeout
                    'extra_wait': 3,  # Extra 3 seconds after networkidle (increased)
                    'js_code': """
                        // Clear any cached content and scroll to ensure all content is loaded
                        if (typeof window !== 'undefined') {
                            window.scrollTo(0, 0);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            window.scrollTo(0, document.body.scrollHeight);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    """
                }
                
                # For page 2+, add extra debugging
                if page_num > 1:
                    logger.info(f"🔍 Page {page_num} - Enhanced debugging enabled")
                    crawl_config['extra_wait'] = 5  # Even longer wait for subsequent pages
                
                result = await crawler.arun(url=current_url, **crawl_config)
                
                # Enhanced debugging
                if not result.success:
                    logger.error(f"Failed to crawl {current_url}")
                    logger.error(f"Status: {result.status_code}")
                    logger.error(f"Error: {result.error_message}")
                    break
                
                # Save HTML for debugging
                if debug_mode:
                    with open(f'debug_page_{page_num}.html', 'w', encoding='utf-8') as f:
                        f.write(result.html)
                    logger.info(f"Saved debug HTML: debug_page_{page_num}.html")
                    
                soup = BeautifulSoup(result.html, 'html.parser')
                
                # Extract clinic URLs from current page
                page_urls = self._extract_clinic_urls_from_page(soup, debug_mode)
                clinic_urls.extend(page_urls)
                logger.info(f"Found {len(page_urls)} clinics on page {page_num}")
                
                # Find next page URL
                current_url = self._find_next_page_url(soup, debug_mode)
                page_num += 1
                
                # Add delay between pages to avoid rate limiting and session issues
                if current_url:
                    logger.info(f"⏳ Waiting 3 seconds before next page...")
                    await asyncio.sleep(3)
                
                # Limit pages in debug mode (disabled for production)
                if debug_mode and page_num > 5:
                    logger.info("Debug mode: Limiting to 5 pages")
                    break
                
            except Exception as e:
                logger.error(f"Error processing page {current_url}: {e}")
                break
                
        return clinic_urls
    
    def _extract_clinic_urls_from_page(self, soup: BeautifulSoup, debug_mode: bool = False) -> List[str]:
        """Extract clinic URLs from listing page"""
        clinic_urls = []
        
        # Look for GP Practices section and subscriber divs
        # The h3 contains nested <small> element, so we search by text content
        gp_practices_h3 = soup.find('h3', text=re.compile(r'GP Practices'))
        if not gp_practices_h3:
            # Alternative approach: find h3 containing "GP Practices" text
            h3_elements = soup.find_all('h3')
            for h3 in h3_elements:
                if 'GP Practices' in h3.get_text():
                    gp_practices_h3 = h3
                    break
        
        if not gp_practices_h3:
            logger.warning("GP Practices heading not found")
            
            if debug_mode:
                # Debug: Check what h3 headings exist
                h3_elements = soup.find_all('h3')
                logger.info("Available h3 headings:")
                for h3 in h3_elements[:10]:
                    logger.info(f"  <h3>{h3.get_text(strip=True)}</h3>")
                    
            return clinic_urls
        
        # Find all clinic containers: <div class="subscriber">
        subscriber_divs = soup.find_all('div', class_='subscriber')
        logger.info(f"Found {len(subscriber_divs)} subscriber divs")
        
        for div in subscriber_divs:
            # Look for <h4><a href="/gps-accident-urgent-medical-care/gp/...">
            h4 = div.find('h4')
            if h4:
                link = h4.find('a')
                if link:
                    href = link.get('href')
                    if href and '/gps-accident-urgent-medical-care/gp/' in href:
                        full_url = urljoin(self.base_url, href)
                        if full_url not in clinic_urls:
                            clinic_urls.append(full_url)
                            if debug_mode:
                                clinic_name = link.get_text(strip=True)
                                logger.info(f"Added clinic: {clinic_name} -> {full_url}")
                    
        return clinic_urls
    
    def _find_next_page_url(self, soup: BeautifulSoup, debug_mode: bool = False) -> Optional[str]:
        """Find next page URL from pagination"""
        # Look for <span class="pagination"> and <a class="next">
        pagination = soup.find('span', class_='pagination')
        if pagination:
            next_link = pagination.find('a', class_='next')
            if next_link and next_link.get('href'):
                # Fix: Use start_url for query parameters to preserve region context
                if next_link['href'].startswith('?'):
                    next_url = self.start_url + next_link['href']
                else:
                    next_url = urljoin(self.base_url, next_link['href'])
                if debug_mode:
                    logger.info(f"Found next page URL: {next_url}")
                return next_url
        
        if debug_mode:
            logger.info("No pagination or next page found")
            # Look for any pagination-related elements
            pagination_elements = soup.find_all(string=re.compile(r'next|page', re.IGNORECASE))
            if pagination_elements:
                logger.info(f"Found pagination text elements: {pagination_elements[:3]}")
                
        return None
    
    async def _extract_clinic_details(self, crawler, url: str, debug_mode: bool = False) -> Optional[Dict]:
        """Extract detailed information from individual clinic page"""
        try:
            # Enhanced config for clinic detail pages
            crawl_config = {
                'wait_until': 'networkidle',
                'timeout': 30000,  # Increased timeout
                'extra_wait': 3,   # Increased wait time
                'js_code': """
                    // Scroll to ensure all content is loaded
                    window.scrollTo(0, document.body.scrollHeight);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                """
            }
            
            result = await crawler.arun(url=url, **crawl_config)
            if not result.success:
                logger.error(f"Failed to crawl clinic page: {url}")
                logger.error(f"Status: {result.status_code}, Error: {result.error_message}")
                return None
                
            soup = BeautifulSoup(result.html, 'html.parser')
            
            # Extract clinic data
            clinic_data = {
                'name': self._extract_clinic_name(soup, debug_mode),
                'address': self._extract_address(soup, debug_mode),
                'phone': self._extract_phone(soup, debug_mode),
                'email': self._extract_email(soup, debug_mode),
                'doctors': self._extract_doctors(soup, debug_mode),
                'url': url
            }
            
            if debug_mode:
                logger.info(f"Extracted data for {clinic_data['name']}")
                logger.info(f"  Address: {clinic_data['address']}")
                logger.info(f"  Phone: {clinic_data['phone']}")
                logger.info(f"  Email: {clinic_data['email']}")
                logger.info(f"  Doctors: {clinic_data['doctors']}")
            
            return clinic_data
            
        except Exception as e:
            logger.error(f"Error extracting clinic details from {url}: {e}")
            return None
    
    def _extract_clinic_name(self, soup: BeautifulSoup, debug_mode: bool = False) -> str:
        """Extract clinic name from h1 tag (find first non-empty one)"""
        h1_tags = soup.find_all('h1')
        
        # Find the first non-empty h1 tag
        for h1 in h1_tags:
            name = h1.get_text(strip=True)
            if name:  # If not empty
                if debug_mode:
                    logger.info(f"Found clinic name: {name}")
                return name
        
        # Fallback: try title tag
        title = soup.find('title')
        if title:
            title_text = title.get_text(strip=True)
            # Extract name from "Windsor Medical Centre • Healthpoint"
            if '•' in title_text:
                name = title_text.split('•')[0].strip()
                if debug_mode:
                    logger.info(f"Found clinic name from title: {name}")
                return name
        
        return "Unknown"
    
    def _extract_address(self, soup: BeautifulSoup, debug_mode: bool = False) -> str:
        """Extract clinic address from contact details"""
        # Look for <h4 class="label-text">Street Address</h4>
        street_addr_h4 = soup.find('h4', class_='label-text', string='Street Address')
        if street_addr_h4:
            addr_div = street_addr_h4.find_next_sibling('div', itemprop='address')
            if addr_div:
                # Extract address with proper spacing between components
                address_parts = []
                for elem in addr_div.find_all(text=True):
                    text = elem.strip()
                    if text:
                        address_parts.append(text)
                
                # Join with spaces and clean up
                address = ' '.join(address_parts).replace('\n', ' ')
                # Remove multiple spaces
                address = ' '.join(address.split())
                
                if debug_mode:
                    logger.info(f"Found address via Street Address h4: {address}")
                return address
        
        # Fallback: look for address patterns
        address_pattern = re.compile(r'\d+.*(?:Drive|Street|Road|Avenue|Lane|Way|Place|Crescent)')
        address_elements = soup.find_all(string=address_pattern)
        if address_elements:
            address = address_elements[0].strip()
            if debug_mode:
                logger.info(f"Found address via pattern matching: {address}")
            return address
        
        if debug_mode:
            logger.info("No address found with current selectors")
            
        return "Address not found"
    
    def _extract_phone(self, soup: BeautifulSoup, debug_mode: bool = False) -> str:
        """Extract phone number"""
        # Look for <h4 class="label-text">Phone</h4>
        phone_h4 = soup.find('h4', class_='label-text', string='Phone')
        if phone_h4:
            # Look for <p itemprop="telephone">
            phone_p = phone_h4.find_next_sibling().find('p', itemprop='telephone')
            if phone_p:
                phone = phone_p.get_text(strip=True)
                if debug_mode:
                    logger.info(f"Found phone via label-text: {phone}")
                return phone
        
        # Fallback: search for phone patterns
        phone_pattern = re.compile(r'\(?\d{2,3}\)?\s?\d{3}\s?\d{4}')
        phone_match = soup.find(string=phone_pattern)
        if phone_match:
            phone = phone_match.strip()
            if debug_mode:
                logger.info(f"Found phone via pattern matching: {phone}")
            return phone
        
        if debug_mode:
            logger.info("No phone found with current selectors")
            
        return "Phone not found"
    
    def _extract_email(self, soup: BeautifulSoup, debug_mode: bool = False) -> str:
        """Extract email address"""
        # Look for <h4 class="label-text">Email</h4>
        email_h4 = soup.find('h4', class_='label-text', string='Email')
        if email_h4:
            # Look for mailto link in the parent li element
            email_li = email_h4.parent
            email_link = email_li.find('a', href=re.compile(r'^mailto:'))
            if email_link:
                email = email_link['href'].replace('mailto:', '')
                if debug_mode:
                    logger.info(f"Found email via mailto link: {email}")
                return email
        
        # Fallback: search for email patterns
        email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
        email_match = soup.find(string=email_pattern)
        if email_match:
            email = email_match.strip()
            if debug_mode:
                logger.info(f"Found email via pattern matching: {email}")
            return email
        
        if debug_mode:
            logger.info("No email found with current selectors")
            
        return "Email not found"
    
    def _extract_doctors(self, soup: BeautifulSoup, debug_mode: bool = False) -> str:
        """Extract list of doctors"""
        doctors = []
        
        # Look for <h3 class="section-header">Doctors</h3>
        doctors_section = soup.find('h3', class_='section-header', string='Doctors')
        if doctors_section:
            # Find <ul class="people">
            content_div = doctors_section.find_next_sibling('div', class_='content')
            if content_div:
                people_list = content_div.find('ul', class_='people')
                if people_list:
                    # Find all <h4><a>Dr Name</a></h4>
                    doctor_links = people_list.find_all('h4')
                    for h4 in doctor_links:
                        link = h4.find('a')
                        if link:
                            doctor_name = link.get_text(strip=True)
                            if doctor_name.startswith('Dr '):
                                doctors.append(doctor_name)
                    
                    if debug_mode and doctors:
                        logger.info(f"Found doctors via section-header: {doctors}")
        
        # Fallback: look for "Dr [Name]" patterns anywhere
        if not doctors:
            doctor_pattern = re.compile(r'Dr\s+[A-Za-z\s\(\)]+')
            doctor_matches = soup.find_all(string=doctor_pattern)
            doctors = [match.strip() for match in doctor_matches if 'Dr ' in match]
            
            if debug_mode and doctors:
                logger.info(f"Found doctors via pattern matching: {doctors[:5]}")  # Limit output
        
        # Remove duplicates and clean up
        doctors = list(dict.fromkeys(doctors))  # Preserve order while removing duplicates
        
        if debug_mode:
            logger.info(f"Final doctors list: {len(doctors)} doctors")
            
        return '; '.join(doctors) if doctors else "Doctors not listed"
    
    def export_to_csv(self, filename: str = "gp_clinics.csv"):
        """Export clinic data to CSV in the same directory as the script"""
        if not self.clinic_data:
            logger.error("No clinic data to export")
            return
        
        # Get the directory where the script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_dir, filename)
            
        fieldnames = ['name', 'address', 'phone', 'email', 'doctors', 'url']
        
        try:
            with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.clinic_data)
                
            logger.info(f"Successfully exported {len(self.clinic_data)} clinics to {csv_path}")
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
        
        return csv_path

async def main(debug_mode: bool = False):
    """Main execution function with enhanced debugging"""
    scraper = GPClinicScraper()
    
    try:
        logger.info("=" * 50)
        logger.info("GP CLINIC SCRAPER - ENHANCED DEBUG VERSION")
        logger.info("=" * 50)
        
        # Scrape all clinics with debug mode
        clinic_data = await scraper.scrape_all_clinics(debug_mode=debug_mode)
        
        # Export to CSV in script directory
        csv_path = scraper.export_to_csv("gp_clinics.csv")
        
        # Print summary
        print(f"\n=== Scraping Complete ===")
        print(f"Total clinics extracted: {len(clinic_data)}")
        print(f"CSV file saved to: {csv_path}")
        
        # Show sample data
        if clinic_data:
            print(f"\nSample clinic data:")
            for key, value in clinic_data[0].items():
                print(f"  {key}: {value}")
        else:
            print("\n❌ No clinic data extracted!")
            print("Check the debug files and logs above for issues.")
                
    except Exception as e:
        logger.error(f"Script execution failed: {e}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
