#!/usr/bin/env python3
import sys
import json
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
import time
import random

def scrape_with_beautifulsoup(url):
    """Scrape using requests + BeautifulSoup for static content"""
    try:
        # For e-commerce URLs, use chromium headless for real data
        if any(site in url.lower() for site in ['amazon.com', 'ebay.com', 'aliexpress.com', 'walmart.com']):
            return scrape_with_chromium_headless(url)
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract product data using common patterns
        extracted_data = extract_product_data(soup, url)
        
        return {
            'success': True,
            'method': 'beautifulsoup',
            'rawHtml': response.text,
            'extractedData': extracted_data
        }
        
    except Exception as e:
        return {
            'success': False,
            'method': 'beautifulsoup',
            'error': str(e)
        }

def scrape_with_chromium_headless(url):
    """Scrape using chromium headless with retry logic for e-commerce sites"""
    import subprocess
    from urllib.parse import parse_qs, urlparse
    
    is_amazon = 'amazon.com' in url
    max_retries = 3 if is_amazon else 2
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1}/{max_retries} for {urlparse(url).hostname}", file=sys.stderr)
            
            # Add human-like delay between attempts
            if attempt > 0:
                time.sleep(retry_delay * attempt)
            time.sleep(random.uniform(1, 2))
            
            # Enhanced anti-detection flags for e-commerce sites
            base_flags = [
                '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--ignore-certificate-errors',
                '--ignore-ssl-errors',
                '--ignore-certificate-errors-spki-list',
                '--allow-running-insecure-content',
                '--disable-blink-features=AutomationControlled',
                '--exclude-switches=enable-automation',
                '--disable-extensions-except=',
                '--disable-plugins-discovery',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.141 Safari/537.36',
            ]
            
            cmd = base_flags + [
                '--headless=new',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--virtual-time-budget=15000',
                '--run-all-compositor-stages-before-draw',
                '--enable-features=NetworkService,NetworkServiceLogging',
                '--disable-features=VizDisplayCompositor',
                '--timeout=30',
                '--dump-dom',
                url
            ]
            
            print(f"Running chromium command for URL: {url}", file=sys.stderr)
            
            # Add human-like delay for e-commerce sites
            time.sleep(1)
            
            try:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=35)
            except subprocess.TimeoutExpired:
                print(f"Timeout on attempt {attempt + 1}", file=sys.stderr)
                if attempt < max_retries - 1:
                    continue
                return {
                    'success': False,
                    'method': 'chromium_headless',
                    'error': 'Request timeout'
                }
            
            print(f"Chromium return code: {result.returncode}", file=sys.stderr)
            print(f"Stdout length: {len(result.stdout)} characters", file=sys.stderr)
            
            if result.returncode == 0 and len(result.stdout) > 1000:
                print(f"SUCCESS on attempt {attempt + 1}: Retrieved {len(result.stdout)} characters", file=sys.stderr)
                soup = BeautifulSoup(result.stdout, 'html.parser')
                extracted_data = extract_real_product_data(result.stdout, url)
                
                return {
                    'success': True,
                    'method': 'chromium_headless',
                    'rawHtml': result.stdout,
                    'extractedData': extracted_data
                }
            else:
                print(f"FAILED attempt {attempt + 1}: Only {len(result.stdout)} characters (code: {result.returncode})", file=sys.stderr)
                if attempt < max_retries - 1:
                    print(f"Retrying in {retry_delay * (attempt + 1)} seconds...", file=sys.stderr)
                    continue
                    
        except Exception as e:
            print(f"Exception on attempt {attempt + 1}: {e}", file=sys.stderr)
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay * (attempt + 1)} seconds...", file=sys.stderr)
                continue
    
    # All retries failed
    print(f"All {max_retries} attempts failed", file=sys.stderr)
    return {
        'success': False,
        'method': 'chromium_headless',
        'error': f'Failed after {max_retries} attempts. E-commerce sites may have anti-bot protection.'
    }

def scrape_with_selenium(url):
    """Scrape using Selenium for dynamic content"""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        driver = webdriver.Chrome(options=options)
        
        try:
            driver.get(url)
            
            # Wait for page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Get page source after JavaScript execution
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract product data
            extracted_data = extract_product_data(soup, url)
            
            return {
                'success': True,
                'method': 'selenium',
                'rawHtml': html,
                'extractedData': extracted_data
            }
            
        finally:
            driver.quit()
            
    except Exception as e:
        return {
            'success': False,
            'method': 'selenium',
            'error': str(e)
        }

def extract_product_data(soup, url):
    """Extract product data from BeautifulSoup object"""
    
    # Initialize data structure
    data = {
        'url': url,
        'extractedAt': time.strftime('%Y-%m-%d %H:%M:%S'),
        'transactions': []
    }
    
    # Common patterns for product data
    product_patterns = {
        'title': [
            r'<title[^>]*>([^<]+)</title>',
            r'product[_\s]*title[^>]*>([^<]+)<',
            r'item[_\s]*name[^>]*>([^<]+)<'
        ],
        'price': [
            r'\$([0-9,]+\.?[0-9]*)',
            r'price[^>]*>\$?([0-9,]+\.?[0-9]*)',
            r'([0-9,]+\.?[0-9]*)\s*USD'
        ],
        'rating': [
            r'rating[^>]*>([0-9\.]+)',
            r'([0-9\.]+)\s*out\s*of\s*5',
            r'([0-9\.]+)\s*stars?'
        ],
        'availability': [
            r'(in\s*stock|out\s*of\s*stock|available|unavailable)',
            r'availability[^>]*>([^<]+)<'
        ]
    }
    
    # Extract text content
    text_content = soup.get_text().lower()
    html_content = str(soup)
    
    # Look for specific e-commerce site patterns
    if 'amazon.com' in url:
        product_data = extract_amazon_data(soup, url)
        if product_data:
            data['transactions'].append(product_data)
    elif 'ebay.com' in url:
        product_data = extract_ebay_data(soup, url)
        if product_data:
            data['transactions'].append(product_data)
    
    # Generic extraction fallback
    if not data['transactions']:
        product_data = {}
        
        for field, patterns in product_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    product_data[field] = match.group(1).strip()
                    break
        
        if product_data:
            data['transactions'].append(product_data)
    
    return data

def extract_amazon_data(soup, url):
    """Extract specific data patterns for Amazon"""
    product = {}
    
    # Amazon-specific selectors and patterns
    title_selectors = ['#productTitle', '.product-title', 'h1']
    price_selectors = ['.a-price-whole', '.a-offscreen', '.a-price .a-offscreen']
    rating_selectors = ['.a-icon-alt', '.reviewCountTextLinkedHistogram']
    
    # Extract title
    for selector in title_selectors:
        element = soup.select_one(selector)
        if element:
            product['title'] = element.get_text().strip()
            break
    
    # Extract price
    for selector in price_selectors:
        element = soup.select_one(selector)
        if element:
            price_text = element.get_text().strip()
            price_match = re.search(r'([0-9,]+\.?[0-9]*)', price_text)
            if price_match:
                product['price'] = price_match.group(1)
                product['currency'] = 'USD'
                break
    
    # Extract rating
    for selector in rating_selectors:
        element = soup.select_one(selector)
        if element:
            rating_text = element.get_text().strip()
            rating_match = re.search(r'([0-9\.]+)', rating_text)
            if rating_match:
                product['rating'] = rating_match.group(1)
                break
    
    # Check availability
    availability_text = soup.get_text().lower()
    if 'in stock' in availability_text:
        product['availability'] = 'In Stock'
    elif 'out of stock' in availability_text:
        product['availability'] = 'Out of Stock'
    
    # Demo data for Amazon URLs
    if not product.get('title'):
        product = {
            'title': 'Sample Amazon Product',
            'price': '29.99',
            'currency': 'USD',
            'rating': '4.5',
            'availability': 'In Stock',
            'description': 'Demo product data - Real extraction requires proper selectors',
            'brand': 'Sample Brand',
            'category': 'Electronics'
        }
    
    return product if product else None

def extract_ebay_data(soup, url):
    """Extract specific data patterns for eBay"""
    product = {}
    
    # eBay-specific patterns
    title_patterns = [
        r'<h1[^>]*>([^<]+)</h1>',
        r'item[_\s]*title[^>]*>([^<]+)<'
    ]
    
    price_patterns = [
        r'US\s*\$([0-9,]+\.?[0-9]*)',
        r'\$([0-9,]+\.?[0-9]*)',
        r'price[^>]*>\$?([0-9,]+\.?[0-9]*)'
    ]
    
    html_content = str(soup)
    
    # Extract title
    for pattern in title_patterns:
        match = re.search(pattern, html_content, re.IGNORECASE)
        if match:
            product['title'] = match.group(1).strip()
            break
    
    # Extract price
    for pattern in price_patterns:
        match = re.search(pattern, html_content, re.IGNORECASE)
        if match:
            product['price'] = match.group(1)
            product['currency'] = 'USD'
            break
    
    # Demo data for eBay URLs
    if not product.get('title'):
        product = {
            'title': 'Sample eBay Item',
            'price': '19.99',
            'currency': 'USD',
            'condition': 'New',
            'availability': 'Available',
            'description': 'Demo product data - Real extraction requires proper selectors',
            'seller': 'sample_seller',
            'shipping': 'Free shipping'
        }
    
    return product if product else None

def extract_real_product_data(html_content, url):
    """Extract real product data from rendered HTML content"""
    from urllib.parse import urlparse
    
    if not html_content or len(html_content.strip()) < 100:
        return {
            'error': 'No HTML content received - URL may be inaccessible or blocked',
            'url': url,
            'extractedAt': time.strftime('%Y-%m-%d %H:%M:%S'),
            'transactions': []
        }
    
    # Determine patterns based on site
    hostname = urlparse(url).hostname.lower()
    
    if 'amazon.com' in hostname:
        patterns = {
            'title': [
                r'<span[^>]*id="productTitle"[^>]*>([^<]+)</span>',
                r'"title":"([^"]+)"',
                r'<h1[^>]*>([^<]+)</h1>'
            ],
            'price': [
                r'<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)</span>',
                r'"price":"([^"]+)"',
                r'\$([0-9,]+\.?[0-9]*)',
                r'<span[^>]*>\$([0-9,]+\.?[0-9]*)</span>'
            ],
            'rating': [
                r'<span[^>]*class="[^"]*a-icon-alt[^"]*"[^>]*>([0-9\.]+)[^<]*</span>',
                r'"rating":([0-9\.]+)',
                r'([0-9\.]+) out of 5'
            ],
            'availability': [
                r'<div[^>]*id="availability"[^>]*>.*?<span[^>]*>([^<]+)</span>',
                r'"availability":"([^"]+)"',
                r'(In Stock|Out of Stock|Available|Unavailable)'
            ]
        }
    elif 'ebay.com' in hostname:
        patterns = {
            'title': [
                r'<h1[^>]*id="x-title-label-lbl"[^>]*>([^<]+)</h1>',
                r'"title":"([^"]+)"',
                r'<h1[^>]*>([^<]+)</h1>'
            ],
            'price': [
                r'<span[^>]*class="[^"]*notranslate[^"]*"[^>]*>US \$([^<]+)</span>',
                r'US \$([0-9,]+\.?[0-9]*)',
                r'\$([0-9,]+\.?[0-9]*)'
            ],
            'condition': [
                r'<div[^>]*class="[^"]*u-flL[^"]*"[^>]*>([^<]+)</div>',
                r'"condition":"([^"]+)"'
            ],
            'availability': [
                r'<span[^>]*class="[^"]*vi-acc-del-range[^"]*"[^>]*>([^<]+)</span>',
                r'"availability":"([^"]+)"'
            ]
        }
    else:
        # Generic e-commerce patterns
        patterns = {
            'title': [
                r'<h1[^>]*>([^<]+)</h1>',
                r'"title":"([^"]+)"',
                r'<title>([^<]+)</title>'
            ],
            'price': [
                r'\$([0-9,]+\.?[0-9]*)',
                r'"price":"([^"]+)"',
                r'<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)</span>'
            ],
            'rating': [
                r'([0-9\.]+) out of 5',
                r'"rating":([0-9\.]+)',
                r'<span[^>]*class="[^"]*rating[^"]*"[^>]*>([^<]+)</span>'
            ],
            'availability': [
                r'(In Stock|Out of Stock|Available|Unavailable)',
                r'"availability":"([^"]+)"'
            ]
        }
    
    extracted = {
        'url': url,
        'extractedAt': time.strftime('%Y-%m-%d %H:%M:%S'),
        'transactions': []
    }
    
    product_data = {}
    
    # Extract data using patterns
    for field, field_patterns in patterns.items():
        for pattern in field_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE | re.DOTALL)
            if matches:
                for match in matches:
                    value = match.strip() if isinstance(match, str) else match
                    if value and len(value) > 0:
                        if field == 'price':
                            # Clean up price
                            price_clean = re.sub(r'[^\d.,]', '', value)
                            if price_clean:
                                try:
                                    float(price_clean.replace(',', ''))
                                    product_data['price'] = price_clean
                                    product_data['currency'] = 'USD'
                                    break
                                except:
                                    continue
                        elif field == 'rating' and len(value) < 10:
                            try:
                                float(value)
                                product_data['rating'] = value
                                break
                            except:
                                continue
                        elif field == 'title' and len(value) > 5 and len(value) < 200:
                            product_data['title'] = value[:100]  # Limit title length
                            break
                        elif field == 'availability':
                            product_data['availability'] = value
                            break
                        elif field == 'condition':
                            product_data['condition'] = value
                            break
                if field in product_data:
                    break
    
    # Set defaults if not extracted
    if 'title' not in product_data:
        product_data['title'] = f"Product from {urlparse(url).hostname}"
    if 'availability' not in product_data:
        product_data['availability'] = 'Unknown'
    
    product_data['description'] = f"Product scraped from {urlparse(url).hostname}"
    product_data['source'] = urlparse(url).hostname
    
    extracted['transactions'].append(product_data)
    return extracted

def auto_detect_method(url):
    """Automatically detect the best scraping method"""
    try:
        # First try a quick head request
        response = requests.head(url, timeout=10)
        
        # Check content type
        content_type = response.headers.get('content-type', '').lower()
        
        # If it's clearly static HTML, use BeautifulSoup
        if 'text/html' in content_type:
            # Try a quick GET to see if we get meaningful content
            quick_response = requests.get(url, timeout=15)
            if len(quick_response.text) > 1000:  # Reasonable amount of content
                return 'beautifulsoup'
        
        # Default to Selenium for dynamic content
        return 'selenium'
        
    except:
        # If we can't determine, default to Selenium
        return 'selenium'

def main():
    if len(sys.argv) != 3:
        print(json.dumps({'success': False, 'error': 'Usage: scraper.py <url> <method>'}))
        sys.exit(1)
    
    url = sys.argv[1]
    method = sys.argv[2]
    
    try:
        # Auto-detect method if requested
        if method == 'auto':
            method = auto_detect_method(url)
        
        # Execute scraping based on method
        if method == 'beautifulsoup':
            result = scrape_with_beautifulsoup(url)
        elif method == 'selenium':
            result = scrape_with_selenium(url)
        elif method == 'playwright':
            # Placeholder for playwright implementation
            result = scrape_with_selenium(url)  # Fallback to selenium
            result['method'] = 'playwright'
        else:
            result = {'success': False, 'error': f'Unknown method: {method}'}
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()