# ikman.lk scraper - works pretty well for local classifieds!
# ikman seems simpler than other sites, loads faster too
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
import urllib.parse

def scraper_ikman_fast(search_term, page_number=1):
    """Gets listings from ikman.lk - this site is pretty responsive"""
    
        # Configure the browser for reasonable speed
    browser_options = Options()
    browser_options.add_argument("--headless")  # Run in background
    browser_options.add_argument("--disable-blink-features=AutomationControlled")
    browser_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    browser_options.add_experimental_option('useAutomationExtension', False)
    browser_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    browser_options.add_argument("--disable-dev-shm-usage")
    browser_options.add_argument("--no-sandbox")
    browser_options.add_argument("--disable-gpu")
    browser_options.add_argument('--ignore-ssl-errors-on-localhost')
    browser_options.add_argument('--ignore-ssl-errors')
    browser_options.add_argument('--ignore-certificate-errors-spki-list')
    browser_options.add_argument('--ignore-certificate-errors')
    browser_options.add_argument('--allow-running-insecure-content')
    browser_options.add_argument('--disable-web-security')
    browser_options.add_argument('--allow-running-insecure-content')
    browser_options.add_argument('--disable-features=VizDisplayCompositor')
    # Add these to fix permissions issues
    browser_options.add_argument('--disable-dev-shm-usage')
    browser_options.add_argument('--remote-debugging-port=9223')
    
    # Speed things up a bit
    browser_options.add_argument("--disable-images")  # Skip loading images
    browser_options.add_argument("--disable-javascript")  # ikman works fine without JS
    browser_options.add_argument("--disable-plugins")
    browser_options.add_argument("--disable-extensions")
    
    try:
        # Set up the browser with better error handling
        try:
            service = Service(ChromeDriverManager().install())
        except Exception as e:
            print(f"ChromeDriverManager failed: {e}")
            # Try without explicit service
            service = None
        
        if service:
            browser = webdriver.Chrome(service=service, options=browser_options)
        else:
            # Try with system Chrome
            browser = webdriver.Chrome(options=browser_options)
            
        browser.set_page_load_timeout(12)  # ikman usually loads pretty quick
        
        # A little trick to avoid detection
        browser.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        
        # Go straight to search results (faster than navigating from homepage)
        search_query = urllib.parse.quote(search_term)
        ikman_url = f"https://ikman.lk/en/ads/sri-lanka?query={search_query}&page={page_number}"
        print(f"Loading ikman: {ikman_url}")
        browser.get(ikman_url)
        
        # ikman is pretty fast, so we don't need to wait too long
        time.sleep(5)  # Increased wait time to handle potential blocking
        
        # Get the products using our extraction method
        products_found = try_ikman_html_extraction_fast(browser)
        if products_found:
            print(f"✅ Found {len(products_found)} ikman products")
            return products_found[:5]  # Keep it to 5 for consistency
        
        print("❌ No ikman products found")
        return []
            
    except Exception as e:
        print(f"ikman error: {e}")
        return []
    finally:
        if 'browser' in locals():
            browser.quit()

def try_ikman_html_extraction_fast(browser):
    """Parse ikman listings from HTML - found this to be most reliable"""
    try:
        # Look for the main listing containers
        listing_elements = browser.find_elements(By.CSS_SELECTOR, '.gtm-ad-item')
        print(f"Found {len(listing_elements)} ikman listings")
        
        if listing_elements and len(listing_elements) >= 3:
            products_list = []
            # Process the first bunch for speed
            for element in listing_elements[:10]:
                try:
                    listing_data = extract_ikman_product_fast(element)
                    if listing_data and listing_data.get('name') != 'N/A' and listing_data.get('price') != 'N/A':
                        products_list.append(listing_data)
                        if len(products_list) >= 5:  # Stop when we have enough
                            break
                except Exception:
                    continue
            
            return products_list
        
        return []
        
    except Exception as e:
        print(f"ikman HTML parsing failed: {e}")
        return []

def extract_ikman_product_fast(element):
    """Extract the important details from each ikman listing"""
    try:
        item_data = {
            'name': 'N/A',
            'price': 'N/A',
            'original_price': 'N/A',
            'discount': 'N/A',
            'image': 'N/A',
            'image_url': 'N/A',
            'url': 'N/A',
            'rating': 'N/A',
            'location': 'N/A'
        }
        
        # Get the listing title first (most important)
        try:
            title_elem = element.find_element(By.CSS_SELECTOR, 'h2, h3, .gtm-ad-title')
            title_text = title_elem.text.strip()
            if title_text and len(title_text) > 3:
                item_data['name'] = title_text
        except:
            try:
                title_elem = element.find_element(By.CSS_SELECTOR, 'a[title]')
                item_data['name'] = title_elem.get_attribute('title').strip()
            except:
                pass
        
        # Find the price - this is usually pretty straightforward
        try:
            # Look through the text content for prices
            element_text = element.text
            text_lines = element_text.split('\n')
            for line in text_lines[:5]:  # Check first few lines only
                if 'Rs' in line and any(char.isdigit() for char in line):
                    # Extract price using regex
                    import re
                    price_pattern = re.search(r'Rs\.?\s*[\d,]+', line)
                    if price_pattern:
                        item_data['price'] = price_pattern.group().strip()
                        break
        except:
            pass
        
        # Get the listing URL - ikman uses specific link structure
        # Since ikman.lk uses JavaScript for navigation and doesn't expose direct links
        # in listing elements, we'll construct a search URL based on the product title
        try:
            if item_data['name'] and item_data['name'] != 'N/A':
                # Create a search URL based on the product title
                # This allows users to find the specific product on ikman.lk
                search_title = item_data['name'].replace(' ', '%20').replace('&', '%26')
                item_data['url'] = f"https://ikman.lk/en/ads/sri-lanka?query={search_title}"
                    
        except Exception as e:
            pass
            
            # Additional fallback: try to find any href that contains meaningful content
            if item_data['url'] == 'N/A':
                try:
                    all_links = element.find_elements(By.TAG_NAME, 'a')
                    for link in all_links:
                        href = link.get_attribute('href')
                        if href and len(href) > 20:  # Reasonable URL length
                            item_data['url'] = href
                            break
                except:
                    pass
                    
        except:
            pass
        
        # Get image URL if available
        try:
            img_elem = element.find_element(By.CSS_SELECTOR, 'img')
            img_url = img_elem.get_attribute('src') or img_elem.get_attribute('data-src') or img_elem.get_attribute('data-lazy')
            if img_url:
                item_data['image_url'] = img_url
        except:
            pass
        
        # We skip other stuff for now to keep it fast
        
        # Only return valid listings
        if item_data['name'] != 'N/A' and item_data['price'] != 'N/A':
            # Convert to the standard format everyone else uses
            return {
                'title': item_data['name'],  # Standardize field names
                'price': item_data['price'],
                'link': item_data['url'],   # Standardize field names
                'image_url': item_data['image_url'],
                'location': item_data['location']
            }
            
        return None
        
    except Exception:
        return None

# Example usage:
# results = scraper_ikman_fast("laptop")
# print(f"Found {len(results)} products from ikman")
