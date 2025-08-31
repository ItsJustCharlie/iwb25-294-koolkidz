import ballerina/http;
import ballerina/io;
import ballerina/os;

type Deal record {
    string site;
    decimal price;
    string sales;
    string link?;
    string name?;
    string image?;
};

type SearchResponse record {
    string status;
    Deal[] products;
    string? message;
};

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["*"],
        allowMethods: ["GET", "POST", "OPTIONS"]
    }
}
service / on new http:Listener(8080) {

    resource function get search(string q = "laptop") returns SearchResponse|error {
        io:println("Search request for: " + q);
        
        // Run the Python scraper with the actual query
        io:println("Starting scraper for: " + q);
        
        // Execute Python scraper and wait for completion
        os:Process|error result = os:exec({
            value: "python",
            arguments: ["Scraping/main_scraper.py", q]
        });
          
        
        if result is error {
            io:println("Error running scraper: " + result.message());
            // Still try to read existing data if scraper fails
        } else {
            io:println("Scraper process started");
            // Wait for the process to complete
            int|error waitResult = result.waitForExit();
            if waitResult is error {
                io:println("Error waiting for scraper: " + waitResult.message());
            } else {
                io:println("Scraper completed with exit code: " + waitResult.toString());
            }
        }
        
        // Always read from the single data.json file (either fresh or existing)
        string targetFile = "data.json";
        
        var readResult = io:fileReadString(targetFile);
        if readResult is string {
            json|error jsonData = readResult.fromJsonString();
            if jsonData is json[] {
                Deal[] deals = [];
                
                // Collect deals from different platforms
                Deal[] darazDeals = [];
                Deal[] ikmanDeals = [];
                Deal[] wasiDeals = [];
                
                foreach json item in jsonData {
                    if item is map<json> {
                        string linkValue = "";
                        json linkJson = item["link"];
                        if linkJson is string {
                            linkValue = linkJson;
                        }
                        
                        // Get product name/title
                        string productName = "Unknown Product";
                        json titleJson = item["title"];
                        if titleJson is string {
                            productName = titleJson;
                        } else {
                            json nameJson = item["name"];
                            if nameJson is string {
                                productName = nameJson;
                            }
                        }
                        
                        // Get image URL
                        string imageUrl = "";
                        json imageJson = item["image_url"];
                        if imageJson is string {
                            imageUrl = imageJson;
                        } else {
                            json imgJson = item["image"];
                            if imgJson is string {
                                imageUrl = imgJson;
                            }
                        }
                        
                        // Parse actual price from scraped data
                        decimal priceValue = 180000.0; // Default value
                        json priceJson = item["price"];
                        if priceJson is string {
                            string priceStr = priceJson;
                            // Parse price by extracting numbers from strings like "Rs. 207,254"
                            string numericStr = "";
                            foreach int i in 0 ..< priceStr.length() {
                                string char = priceStr.substring(i, i + 1);
                                if char >= "0" && char <= "9" {
                                    numericStr = numericStr + char;
                                }
                            }
                            
                            if numericStr.length() > 0 {
                                var parsedPrice = decimal:fromString(numericStr);
                                if parsedPrice is decimal {
                                    priceValue = parsedPrice;
                                }
                            }
                        }
                        
                        // Get platform name
                        string platformName = "Unknown";
                        json platformJson = item["platform"];
                        if platformJson is string {
                            platformName = platformJson;
                        }
                        
                        Deal deal = {
                            site: platformName,
                            price: priceValue,
                            sales: "Available",
                            link: linkValue,
                            name: productName,
                            image: imageUrl
                        };
                        
                        // Categorize by platform
                        if platformName == "Daraz" {
                            darazDeals.push(deal);
                        } else if platformName == "ikman.lk" {
                            ikmanDeals.push(deal);
                        } else if platformName == "wasi.lk" {
                            wasiDeals.push(deal);
                        } else {
                            deals.push(deal);
                        }
                    }
                }
                
                // Select one deal from each platform for variety
                Deal[] topDeals = [];
                if darazDeals.length() > 0 {
                    topDeals.push(darazDeals[0]);
                }
                if ikmanDeals.length() > 0 {
                    topDeals.push(ikmanDeals[0]);
                }
                if wasiDeals.length() > 0 {
                    topDeals.push(wasiDeals[0]);
                }
                
                // If we don't have 3 yet, add more from any platform
                if topDeals.length() < 3 {
                    foreach Deal deal in deals {
                        if topDeals.length() < 3 {
                            topDeals.push(deal);
                        }
                    }
                }
                
                if topDeals.length() > 0 {
                    io:println("Found " + topDeals.length().toString() + " deals for query: " + q);
                    return {
                        status: "completed",
                        products: topDeals,
                        message: "Found " + topDeals.length().toString() + " deals for: " + q
                    };
                }
            }
        }
        
        io:println("No data found, returning fallback for query: " + q);
        // Return fallback data if no file found
        Deal[] fallbackDeals = [
            {site: "Daraz", price: 200000.00, sales: "Available", link: "#", name: "Sample Laptop", image: ""},
            {site: "Ikman", price: 180000.00, sales: "Available", link: "#", name: "Sample Device", image: ""},
            {site: "Wasi", price: 190000.00, sales: "Available", link: "#", name: "Sample Product", image: ""}
        ];
        return {
            status: "completed",
            products: fallbackDeals,
            message: "Showing sample results for: " + q
        };
    }

    resource function get results(string query = "laptop") returns SearchResponse|error {
        io:println("Results request for: " + query);
        
        // Always read from the single data.json file
        var readResult = io:fileReadString("data.json");
        if readResult is string {
            json|error jsonData = readResult.fromJsonString();
            if jsonData is json[] {
                Deal[] deals = [];
                foreach json item in jsonData {
                    if item is map<json> {
                        string linkValue = "";
                        json linkJson = item["link"];
                        if linkJson is string {
                            linkValue = linkJson;
                        }
                        
                        // Get product name/title
                        string productName = "Unknown Product";
                        json titleJson = item["title"];
                        if titleJson is string {
                            productName = titleJson;
                        } else {
                            json nameJson = item["name"];
                            if nameJson is string {
                                productName = nameJson;
                            }
                        }
                        
                        // Get image URL
                        string imageUrl = "";
                        json imageJson = item["image_url"];
                        if imageJson is string {
                            imageUrl = imageJson;
                        } else {
                            json imgJson = item["image"];
                            if imgJson is string {
                                imageUrl = imgJson;
                            }
                        }
                        
                        // Parse actual price from scraped data
                        decimal priceValue = 180000.0; // Default value
                        json priceJson = item["price"];
                        if priceJson is string {
                            string priceStr = priceJson;
                            // Parse price by extracting numbers
                            string numericStr = "";
                            foreach int i in 0 ..< priceStr.length() {
                                string char = priceStr.substring(i, i + 1);
                                if char >= "0" && char <= "9" {
                                    numericStr = numericStr + char;
                                }
                            }
                            
                            if numericStr.length() > 0 {
                                var parsedPrice = decimal:fromString(numericStr);
                                if parsedPrice is decimal {
                                    priceValue = parsedPrice;
                                }
                            }
                        }
                        
                        string platformName = "Unknown";
                        json platformJson = item["platform"];
                        if platformJson is string {
                            platformName = platformJson;
                        }
                        
                        Deal deal = {
                            site: platformName,
                            price: priceValue,
                            sales: "Available",
                            link: linkValue,
                            name: productName,
                            image: imageUrl
                        };
                        deals.push(deal);
                    }
                }
                if deals.length() > 0 {
                    io:println("Found " + deals.length().toString() + " deals from data.json");
                    return {
                        status: "completed",
                        products: deals,
                        message: "Found " + deals.length().toString() + " deals"
                    };
                }
            }
        }
        
        // Return empty results if no data found
        return {
            status: "no_results",
            products: [],
            message: "No deals found"
        };
    }
}
