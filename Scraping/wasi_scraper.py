import time
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

def setup_driver():
    """Set up Chrome browser for wasi.lk scraping"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-plugins')
    chrome_options.add_argument('--disable-images')  # Speed boost
    chrome_options.add_argument('--ignore-ssl-errors-on-localhost')
    chrome_options.add_argument('--ignore-ssl-errors')
    chrome_options.add_argument('--ignore-certificate-errors-spki-list')
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--allow-running-insecure-content')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--allow-running-insecure-content')
    chrome_options.add_argument('--disable-features=VizDisplayCompositor')
    # wasi.lk is WooCommerce so we need JavaScript enabled
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Headless mode for faster execution
    chrome_options.add_argument('--headless')
    
    try:
        service = Service(ChromeDriverManager().install())
        browser = webdriver.Chrome(service=service, options=chrome_options)
        browser.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        browser.set_page_load_timeout(45)  # Reasonable timeout - not too long
        return browser
    except Exception as error:
        print(f"Browser setup failed: {error}")
        return None

def extract_wasi_product_from_element(product):
    """Extract product information with ENHANCED PRICE DETECTION"""
    try:
        product_data = {}
        
        # Extract title using the correct selector we found
        title = ""
        
        # First, try to get title from data attribute (most reliable for wasi.lk)
        try:
            wishlist_link = product.find_element(By.CSS_SELECTOR, 'a[data-product-title]')
            title = wishlist_link.get_attribute('data-product-title')
            if title and title.strip():
                print(f"Found title from data attribute: {title}")
        except:
            pass
        
        # If data attribute didn't work, try text selectors
        if not title:
            title_selectors = [
                'h2.woo-loop-product__title a',
                '.woo-loop-product__title a', 
                'h2 a',
                'a[href*="/shop/"]'
            ]
            
            for selector in title_selectors:
                try:
                    title_element = product.find_element(By.CSS_SELECTOR, selector)
                    potential_title = title_element.text.strip()
                    # Only use text if it's not a status message
                    if (potential_title and 
                        potential_title not in ['Out Of Stock', 'In Stock', 'Add to cart', 'Quick view'] and
                        len(potential_title) > 3):
                        title = potential_title
                        print(f"Found title with selector '{selector}': {title}")
                        break
                except:
                    continue
        
        # Filter out unwanted titles
        unwanted_titles = [
            'Sort by Default sorting', 'Sort by popularity', 'Sort by latest', 
            'Sort by price: low to high', 'Sort by price: high to low',
            'Out Of Stock', 'In Stock', 'Add to cart', 'Quick view', 'Select options'
        ]
        
        if not title or title in unwanted_titles:
            return None
            
        # Skip discount percentages
        if re.match(r'^-?\d+%$', title):
            return None
        
        # ENHANCED PRICE EXTRACTION - Multiple strategies for better success rate
        price = "Price not available"
        price_found = False
        
        # Strategy 1: Standard WooCommerce price selectors
        price_selectors = [
            '.price .woocommerce-Price-amount bdi',
            '.woocommerce-Price-amount bdi', 
            '.price .amount',
            '.woocommerce-Price-amount',
            '.price-wrapper .price',
            'span.price',
            '.price',
            '.price ins .amount',
            '.regular-price',
            '.sale-price'
        ]
        
        for selector in price_selectors:
            try:
                price_element = product.find_element(By.CSS_SELECTOR, selector)
                price_text = price_element.text.strip()
                if price_text and ('Rs' in price_text or '₨' in price_text or 'රු' in price_text or any(char.isdigit() for char in price_text)):
                    price = price_text
                    price_found = True
                    break
            except:
                continue
        
        # Strategy 2: Regex search in all text if standard selectors fail
        if not price_found:
            try:
                all_text = product.text
                price_patterns = [
                    r'රු\s*[\d,]+(?:\.\d{2})?',    # Sinhala rupee symbol
                    r'Rs\.?\s*[\d,]+(?:\.\d{2})?',  # Rs with optional period
                    r'₨\s*[\d,]+(?:\.\d{2})?',     # Unicode rupee symbol
                    r'\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*Rs',  # Number followed by Rs
                    r'LKR\s*[\d,]+(?:\.\d{2})?'    # LKR format
                ]
                
                for pattern in price_patterns:
                    price_match = re.search(pattern, all_text, re.IGNORECASE)
                    if price_match:
                        price = price_match.group().strip()
                        price_found = True
                        break
            except:
                pass
        
        # Strategy 3: Look for price in parent elements as fallback
        if not price_found:
            try:
                parent_element = product.find_element(By.XPATH, '..')
                parent_text = parent_element.text
                price_match = re.search(r'රු\s*[\d,]+(?:\.\d{2})?', parent_text, re.IGNORECASE)
                if price_match:
                    price = price_match.group().strip()
                    price_found = True
                    print(f"✅ Found price in parent: {price}")
            except:
                pass
        
        # Strategy 4: Look through all child elements for any price indication
        if not price_found:
            try:
                all_elements = product.find_elements(By.CSS_SELECTOR, '*')
                for elem in all_elements:
                    try:
                        elem_text = elem.text.strip()
                        if elem_text and ('Rs' in elem_text or '₨' in elem_text or 'රු' in elem_text):
                            price_match = re.search(r'(රු\s*[\d,]+(?:\.\d{2})?|Rs\.?\s*[\d,]+(?:\.\d{2})?|₨\s*[\d,]+(?:\.\d{2})?)', elem_text)
                            if price_match:
                                price = price_match.group().strip()
                                price_found = True
                                print(f"✅ Found price in child element: {price}")
                                break
                    except:
                        continue
            except:
                pass
        
        # Extract link
        link = ""
        try:
            link_element = product.find_element(By.CSS_SELECTOR, 'h2.woo-loop-product__title a, h2 a, a[href*="/shop/"]')
            link = link_element.get_attribute('href')
        except:
            pass
        
        # Extract image
        image_url = ""
        try:
            img_element = product.find_element(By.CSS_SELECTOR, 'img')
            image_url = img_element.get_attribute('src') or img_element.get_attribute('data-src')
        except:
            pass
        
        # Extract availability
        availability = "Available"
        try:
            if product.find_element(By.CSS_SELECTOR, '.out-of-stock'):
                availability = "Out of Stock"
        except:
            pass
        
        if title:  # Only return if we have a title
            product_data = {
                'title': title,
                'price': price,
                'link': link,
                'image_url': image_url,  # Changed from 'image' to 'image_url' for consistency
                'availability': availability,
                'platform': 'wasi.lk'
            }
            return product_data
        
        return None
        
    except Exception as e:
        print(f"Error extracting product data: {e}")
        return None

def search_wasi_products(search_query, max_items=5):
    """Search wasi.lk for products - found this to be the most reliable approach!"""
    print(f"Searching wasi.lk for: {search_query}")
    
    browser = setup_driver()
    if not browser:
        return []
    
    try:
        # Build the search URL
        wasi_search_url = f"https://www.wasi.lk/?s={search_query}&post_type=product"
        print(f"Navigating to: {wasi_search_url}")
        
        browser.get(wasi_search_url)
        
        # Give page time to load completely (this is key!)
        time.sleep(10)  # Increased wait time to handle potential blocking
        
        products = []
        
        # Use the selector we found working in debug
        try:
            print("Looking for products...")
            product_elements = browser.find_elements(By.CSS_SELECTOR, '.products .product')
            print(f"Found {len(product_elements)} product elements")
            
            if product_elements:
                for i, product in enumerate(product_elements[:max_items]):
                    try:
                        print(f"Processing product {i+1}...")
                        
                        # Debug: Print the product HTML structure
                        product_html = product.get_attribute('outerHTML')[:500]
                        print(f"Product HTML preview: {product_html}...")
                        
                        product_data = extract_wasi_product_from_element(product)
                        if product_data and product_data['title']:
                            products.append(product_data)
                            print(f"Successfully extracted: {product_data['title'][:50]}...")
                        else:
                            print(f"Failed to extract valid data from product {i+1}")
                            
                        if len(products) >= max_items:
                            break
                    except Exception as e:
                        print(f"Error processing product {i+1}: {e}")
                        continue
                            
        except Exception as e:
            print(f"Error extracting products: {e}")
        
        return products
        
    except Exception as e:
        print(f"Error searching wasi.lk: {e}")
        return []
    finally:
        browser.quit()

if __name__ == "__main__":
    search_term = input("Enter search term: ").strip()
    if not search_term:
        search_term = "phone"
    
    print(f"Searching for '{search_term}' on wasi.lk...")
    products = search_wasi_products(search_term, max_items=5)
    
    if products:
        print(f"\nFound {len(products)} products on wasi.lk:")
        for i, product in enumerate(products, 1):
            print(f"\n{i}. {product['title']}")
            print(f"   Price: {product['price']}")
            print(f"   Link: {product['link']}")
            print(f"   Availability: {product['availability']}")
    else:
        print("No products found!")
