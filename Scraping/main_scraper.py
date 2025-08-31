import json
import time
import threading
from daraz_scraper import scraper_selenium_fast
from ikman_scraper import scraper_ikman_fast
from wasi_scraper import search_wasi_products

def unified_scraper_three_platforms(query, max_products_per_platform=3):
    print(f"Searching for '{query}' across platforms...")
    
    platform_results = {
        'daraz': [],
        'ikman': [],
        'wasi': []
    }
    
    def get_daraz_products():
        try:
            daraz_products = scraper_selenium_fast(query)
            if daraz_products:
                for item in daraz_products[:max_products_per_platform]:
                    item['platform'] = 'Daraz'
                platform_results['daraz'] = daraz_products[:max_products_per_platform]
        except Exception:
            platform_results['daraz'] = []
    
    def get_ikman_products():
        try:
            ikman_items = scraper_ikman_fast(query)
            if ikman_items:
                for product in ikman_items[:max_products_per_platform]:
                    product['platform'] = 'ikman.lk'
                platform_results['ikman'] = ikman_items[:max_products_per_platform]
        except Exception:
            platform_results['ikman'] = []
    
    def get_wasi_products():
        try:
            wasi_results = search_wasi_products(query, max_products_per_platform)
            platform_results['wasi'] = wasi_results
        except Exception:
            platform_results['wasi'] = []
    
    start_time = time.time()
    
    daraz_thread = threading.Thread(target=get_daraz_products)
    ikman_thread = threading.Thread(target=get_ikman_products)
    wasi_thread = threading.Thread(target=get_wasi_products)
    
    daraz_thread.start()
    ikman_thread.start() 
    wasi_thread.start()
    
    daraz_thread.join()
    ikman_thread.join()
    wasi_thread.join()
    
    total_time = time.time() - start_time
    
    all_products = []
    all_products.extend(platform_results['daraz'])
    all_products.extend(platform_results['ikman'])  
    all_products.extend(platform_results['wasi'])
    
    print(f"Search completed in {total_time:.2f} seconds")
    print(f"Found {len(all_products)} products total")
    
    return all_products

def main():
    search_term = input("What are you looking for? ").strip()
    if not search_term:
        search_term = "mobile"
    
    found_products = unified_scraper_three_platforms(search_term, max_products_per_platform=3)
    
    if found_products:
        print(f"\nResults - {len(found_products)} products:")
        
        for idx, product in enumerate(found_products, 1):
            name = product.get('title') or product.get('name', 'Unknown Product')
            print(f"{idx}. {name}")
            print(f"   Price: {product.get('price', 'Not available')}")
            print(f"   Platform: {product.get('platform', 'Unknown')}")
            print(f"   Link: {product.get('link') or product.get('url', 'No link')}")
            print(f"   Image: {product.get('image_url') or product.get('image', 'No image')}")
            print()
        
        main_filename = "data.json"
        # Use absolute path to ensure it goes to the project root
        import os
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_file_path = os.path.join(project_root, main_filename)
        
        with open(data_file_path, 'w', encoding='utf-8') as f:
            json.dump(found_products, f, indent=2, ensure_ascii=False)
        
        print(f"Saved results to: {data_file_path}")
    
    else:
        print("No products found!")

if __name__ == "__main__":
    import sys
    print("scraper opens")
    if len(sys.argv) > 1:
        # Get query from command line argument
        query = " ".join(sys.argv[1:])
        print(f"Scraping for: {query}")
        
        # Run the scraper
        found_products = unified_scraper_three_platforms(query)
        
        if found_products:
            # Save to the single data.json file (overwrite each time)
            # Use absolute path to ensure it goes to the correct location
            import os
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_file_path = os.path.join(project_root, "data.json")
            try:
                with open(data_file_path, 'w', encoding='utf-8') as f:
                    json.dump(found_products, f, indent=2, ensure_ascii=False)
                print(f"Saved {len(found_products)} products to: {data_file_path}")
                # Print the first product for verification
                if found_products:
                    print("First product in saved file:", found_products[0])
            except Exception as e:
                print(f"Error writing to {data_file_path}: {e}")
        else:
            print("No products found!")
    else:
        # Original main function for interactive use
        main()
