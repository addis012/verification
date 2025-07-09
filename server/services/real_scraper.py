#!/usr/bin/env python3
"""
Real scraper for Bank of Abyssinia transaction receipts
Attempts multiple methods to extract actual transaction data
"""

import requests
import json
import re
import time
import subprocess
import os
from urllib.parse import parse_qs, urlparse

def extract_transaction_from_url(url):
    """Extract transaction ID from URL parameters"""
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    return params.get('trx', [None])[0]

def try_api_endpoints(transaction_id):
    """Try to find API endpoints that might serve transaction data"""
    base_url = "https://cs.bankofabyssinia.com"
    
    possible_endpoints = [
        f"/api/slip/{transaction_id}",
        f"/api/transaction/{transaction_id}",
        f"/api/receipt/{transaction_id}",
        f"/slip/api/transaction/{transaction_id}",
        f"/slip/data/{transaction_id}",
        f"/data/{transaction_id}.json",
    ]
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': f'https://cs.bankofabyssinia.com/slip/?trx={transaction_id}',
    })
    
    for endpoint in possible_endpoints:
        try:
            response = session.get(base_url + endpoint, timeout=10)
            if response.status_code == 200:
                try:
                    data = response.json()
                    return data
                except:
                    # Check if response contains transaction data
                    if transaction_id in response.text:
                        return {"raw_response": response.text}
        except:
            continue
    
    return None

def try_chromium_headless(url):
    """Try using chromium directly to render and extract content"""
    try:
        # Use chromium with minimal flags
        cmd = [
            '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--virtual-time-budget=10000',  # Wait 10 seconds for JS
            '--run-all-compositor-stages-before-draw',
            '--dump-dom',
            url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return result.stdout
        else:
            return None
            
    except Exception as e:
        print(f"Chromium error: {e}")
        return None

def extract_data_from_rendered_content(html_content, transaction_id):
    """Extract transaction data from rendered HTML content"""
    if not html_content or len(html_content) < 1000:
        return None
    
    # Look for common patterns in transaction receipts
    patterns = {
        'amount': [
            r'ETB\s+([\d,]+\.?\d*)',
            r'Amount[:\s]+([\d,]+\.?\d*)',
            r'Transferred\s+amount[:\s]+ETB\s+([\d,]+\.?\d*)',
        ],
        'account': [
            r'Account[:\s]+(\d+\*+\d+)',
            r'Receiver.*Account[:\s]+(\d+\*+\d+)',
        ],
        'name': [
            r'Receiver.*Name[:\s]+([A-Z\s]+)',
            r'Name[:\s]+([A-Z\s]+)',
        ],
        'date': [
            r'(\d{2}/\d{2}/\d{2,4}\s+\d{2}:\d{2})',
            r'Date[:\s]+(\d{2}/\d{2}/\d{2,4}\s+\d{2}:\d{2})',
        ]
    }
    
    extracted = {'transactionId': transaction_id}
    
    for field, field_patterns in patterns.items():
        for pattern in field_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                extracted[field] = match.group(1).strip()
                break
    
    return extracted if len(extracted) > 1 else None

def scrape_real_transaction_data(url):
    """Main function to attempt real data extraction"""
    transaction_id = extract_transaction_from_url(url)
    if not transaction_id:
        return {"error": "Could not extract transaction ID from URL"}
    
    print(f"Attempting to scrape transaction: {transaction_id}")
    
    # Method 1: Try to find API endpoints
    print("Trying API endpoints...")
    api_data = try_api_endpoints(transaction_id)
    if api_data:
        print("Found data via API!")
        return {"success": True, "method": "api", "data": api_data}
    
    # Method 2: Try chromium headless
    print("Trying chromium headless...")
    html_content = try_chromium_headless(url)
    if html_content:
        print(f"Got rendered HTML ({len(html_content)} chars)")
        
        # Extract data from rendered content
        extracted_data = extract_data_from_rendered_content(html_content, transaction_id)
        if extracted_data:
            print("Successfully extracted transaction data!")
            return {
                "success": True, 
                "method": "chromium_headless",
                "data": extracted_data,
                "raw_html_preview": html_content[:1000]
            }
    
    # Method 3: Network analysis (check for XHR requests)
    print("Checking for XHR patterns...")
    # This would require more sophisticated network monitoring
    
    return {
        "error": "Could not extract real transaction data",
        "attempted_methods": ["api_endpoints", "chromium_headless"],
        "transaction_id": transaction_id,
        "note": "The Bank of Abyssinia receipt system likely requires authentication or has anti-bot protection"
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python real_scraper.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    result = scrape_real_transaction_data(url)
    print(json.dumps(result, indent=2))