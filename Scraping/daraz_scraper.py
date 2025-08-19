# Daraz.lk scraper - had to tweak this one quite a bit!
# Daraz is pretty heavy on JavaScript so we need to be more careful
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time

def scraper_selenium_fast(search_keyword, page_num=1):
    """Get products from Daraz - this site needs more finesse"""
    
    # Configure browser with some tweaks for Daraz
    browser_options = Options()
    # We can run headless but Daraz might catch on sometimes
    browser_options.add_argument("--headless")  # Remove this line if detection gets stronger
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
    browser_options.add_argument('--remote-debugging-port=9222')
    
    # Some speed optimizations (but keep JS for Daraz)
    browser_options.add_argument("--disable-images")  # Skip images to load faster
    browser_options.add_argument("--disable-plugins")
    browser_options.add_argument("--disable-extensions")
    # Important: Don't disable JavaScript - Daraz needs it!
    
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
            
        browser.set_page_load_timeout(30)  # Daraz can be slow sometimes
        
        # Some stealth tricks to avoid detection
        browser.execute_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
            Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
            window.chrome = {runtime: {}};
        """)
        
        # Quick homepage visit first (Daraz seems to like this)
        print("Setting up session...")
        browser.get("https://www.daraz.lk/")
        time.sleep(1)  # Increased setup time
        
        # Now go to the actual search
        search_url = f"https://www.daraz.lk/catalog/?q={search_keyword}&page={page_num}"
        print(f"Loading Daraz: {search_url}")
        browser.get(search_url)
        
        # Wait for content to load
        time.sleep(3)  # Increased wait time to handle potential blocking
        
        # Get the products
        products_found = try_html_extraction_fast(browser)
        if products_found:
            print(f"✅ Found {len(products_found)} Daraz products")
            return products_found[:5]  # Keep to 5 for consistency
        
        print("❌ No Daraz products found")
        return []
            
    except Exception as e:
        print(f"Daraz error: {e}")
        return []
    finally:
        if 'browser' in locals():
            browser.quit()

def try_html_extraction_fast(browser):
    """Extract Daraz products from HTML - using the selector that works best"""
    try:
        # Look for the product containers
        product_elements = browser.find_elements(By.CSS_SELECTOR, 'div[data-qa-locator="product-item"]')
        print(f"Found {len(product_elements)} Daraz elements")
        
        if product_elements and len(product_elements) >= 3:
            products_list = []
            # Process first bunch for speed
            for element in product_elements[:10]:
                try:
                    product_data = extract_product_from_element_fast(element)
                    if product_data and product_data.get('name') != 'N/A' and product_data.get('price') != 'N/A':
                        products_list.append(product_data)
                        if len(products_list) >= 5:  # Stop when we have enough
                            break
                except Exception:
                    continue
            
            return products_list
        
        return []
        
    except Exception as e:
        print(f"Daraz HTML extraction failed: {e}")
        return []

def extract_product_from_element_fast(element):
    """Extract product details from each Daraz listing element"""
    try:
        item_info = {
            'name': 'N/A',
            'price': 'N/A',
            'original_price': 'N/A',
            'discount': 'N/A',
            'image': 'N/A',
            'url': 'N/A',
            'rating': 'N/A'
        }
        
        # Get product name (most important)
        try:
            name_link = element.find_element(By.CSS_SELECTOR, 'a[title]')
            item_info['name'] = name_link.get_attribute('title').strip()
        except:
            try:
                img = element.find_element(By.CSS_SELECTOR, 'img')
                item_info['name'] = img.get_attribute('alt').strip()
                # Grab image URL while we have the img element
                try:
                    item_info['image_url'] = img.get_attribute('src') or img.get_attribute('data-src')
                except:
                    item_info['image_url'] = ''
            except:
                pass
        
        # Get image URL if we didn't get it already
        if 'image_url' not in item_info:
            try:
                img = element.find_element(By.CSS_SELECTOR, 'img')
                item_info['image_url'] = img.get_attribute('src') or img.get_attribute('data-src') or ''
            except:
                item_info['image_url'] = ''
        
        # Get the price
        try:
            price_elem = element.find_element(By.CSS_SELECTOR, 'span.ooOxS')
            item_info['price'] = price_elem.text.strip()
        except:
            # Fallback method
            try:
                spans = element.find_elements(By.TAG_NAME, 'span')
                for span in spans[:3]:  # Check first few spans only
                    text = span.text.strip()
                    if 'Rs.' in text and any(char.isdigit() for char in text):
                        item_info['price'] = text
                        break
            except:
                pass
        
        # Get product URL
        try:
            link_elem = element.find_element(By.CSS_SELECTOR, 'a')
            href = link_elem.get_attribute('href')
            if href:
                item_info['url'] = href if href.startswith('http') else f"https://www.daraz.lk{href}"
        except:
            pass
        
        # We skip other stuff for now to keep it fast
        
        # Only return if we got the basics
        if item_info['name'] != 'N/A' and item_info['price'] != 'N/A':
            # Convert to standard format for consistency
            return {
                'title': item_info['name'],   # Standardize field names
                'price': item_info['price'],
                'link': item_info['url'],     # Standardize field names
                'image_url': item_info.get('image_url', '')
            }
            
        return None
        
    except Exception:
        return None

# Example usage:
# results = scraper_selenium_fast("laptop")
# print(f"Found {len(results)} products from Daraz")
