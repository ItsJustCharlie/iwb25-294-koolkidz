import ballerina/http;
import ballerina/io;

type Deal record {
    string site;
    decimal price;
    string sales;
    string link?;
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

    resource function get search(string query = "laptop") returns SearchResponse|error {
        io:println("Search request for: " + query);
        
        // For now, use a simple mapping based on query
        string targetFile = "Scraping/search_results_asus_laptop.json";
        
        // Basic query mapping - we'll improve this to be truly dynamic later
        if query.includes("iphone") || query.includes("iPhone") {
            targetFile = "Scraping/search_results_iphone_12.json";
        } else if query.includes("barbie") || query.includes("doll") {
            targetFile = "Scraping/search_results_barbie_doll.json";
        } else if query.includes("toy") || query.includes("car") {
            targetFile = "Scraping/search_results_toy_car.json";
        }
        
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
                            link: linkValue
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
                    io:println("Found " + topDeals.length().toString() + " deals for query: " + query);
                    return {
                        status: "completed",
                        products: topDeals,
                        message: "Found " + topDeals.length().toString() + " deals for: " + query
                    };
                }
            }
        }
        
        io:println("No data found, returning fallback for query: " + query);
        // Return fallback data if no file found
        Deal[] fallbackDeals = [
            {site: "Daraz", price: 200000.00, sales: "Available", link: "#"},
            {site: "Ikman", price: 180000.00, sales: "Available", link: "#"},
            {site: "Wasi", price: 190000.00, sales: "Available", link: "#"}
        ];
        return {
            status: "completed",
            products: fallbackDeals,
            message: "Showing sample results for: " + query
        };
    }

    resource function get results(string query = "laptop") returns SearchResponse|error {
        io:println("Results request for: " + query);
        
        // Try to read the most recent scraped file
        string[] possibleFiles = [
            "Scraping/search_results_iphone_12.json",
            "Scraping/search_results_asus_laptop.json", 
            "Scraping/search_results_barbie_doll.json",
            "Scraping/search_results_toy_car.json"
        ];
        
        foreach string jsonFile in possibleFiles {
            var readResult = io:fileReadString(jsonFile);
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
                                link: linkValue
                            };
                            deals.push(deal);
                        }
                    }
                    if deals.length() > 0 {
                        io:println("Found " + deals.length().toString() + " deals from " + jsonFile);
                        return {
                            status: "completed",
                            products: deals,
                            message: "Found " + deals.length().toString() + " deals"
                        };
                    }
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
