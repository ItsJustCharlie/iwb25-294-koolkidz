import ballerina/http;
import ballerina/io;

type Config record {
    string dataFilePath;
};

configurable Config backend = ?;

type Product record {
    string name;
    float price;
    string? original_price;
    string? discount;
    string image;
    string url;
    float? rating;
};

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],          // Allow all origins
        allowMethods: ["GET", "POST"], // Allow GET/POST requests
        allowHeaders: ["*"]           // Allow all headers
    }
}

service / on new http:Listener(8080) {

    resource function get search(http:Caller caller, http:Request req) returns error? {
        // Step 1: Read JSON file safely
        string jsonStr;
        var readResult = io:fileReadString(backend.dataFilePath);
        if readResult is error {
            json errorResp = {"error": "Cannot read data file."};
            check caller->respond(errorResp);
            return;
        }
        jsonStr = readResult;

        // Step 2: Parse JSON safely
        json|error parseResult = jsonStr.fromJsonString();
        if parseResult is error {
            json errorResp = {"error": "Malformed JSON."};
            check caller->respond(errorResp);
            return;
        }
        json productData = parseResult;

        // Cast to JSON array
        json[] products = <json[]>productData;

        // Clean data
        json[] cleanedProducts = [];
        foreach var productJson in products {
            Product|error productResult = productJson.cloneWithType(Product);
            if productResult is error {
                continue; // Skip invalid products
            }
            Product product = productResult;

            if product.original_price is () {
                product.original_price = "N/A";
            }
            if product.discount is () {
                product.discount = "0%";
            }
            if product.rating is () {
                product.rating = 0.0;
            }

            cleanedProducts.push(product.toJson());
        }

        // Wrap cleaned products in an object
        json response = { products: cleanedProducts };

        // Send the wrapped JSON
        check caller->respond(response);
        }
}
