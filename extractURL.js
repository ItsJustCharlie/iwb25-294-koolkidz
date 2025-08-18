// Function to extract product name from URL
function extractProductName(url) {
    // Remove query parameters or hash fragments
    let cleanUrl = url.split("?")[0].split("#")[0];

    // Split the URL by "/"
    let parts = cleanUrl.split("/");

    // Usually the last meaningful part has the product name
    let lastPart = parts[parts.length - 1];

    // Remove file extensions (like .html)
    let productName = lastPart.split(".")[0];

    // Site-specific optimizations for Sri Lankan e-commerce platforms
    if (url.includes('daraz.lk')) {
        // Daraz URLs often have product-name-iXXXXXX format
        // Remove the item ID part (i followed by numbers)
        productName = productName.replace(/-i\d+$/g, '');
    } else if (url.includes('wasi.lk')) {
        // Wasi.lk specific cleaning (if needed)
        // Remove any trailing product IDs or codes
        productName = productName.replace(/-\d+$/g, '');
    } else if (url.includes('ikman.lk')) {
        // Ikman.lk specific cleaning
        // Remove any trailing ad IDs or codes
        productName = productName.replace(/-ad-\d+$/g, '');
        productName = productName.replace(/-\d+$/g, '');
    }

    // General cleaning
    // Replace hyphens or underscores with spaces
    productName = productName.replace(/[-_]/g, " ");
    
    // Remove extra spaces and trim
    productName = productName.replace(/\s+/g, " ").trim();
    
    // Capitalize first letter of each word for better readability
    productName = productName.replace(/\b\w/g, l => l.toUpperCase());

    return productName;
}

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hook up the button with class "find-button"
    const findButton = document.querySelector(".find-button");
    
    if (findButton) {
        findButton.addEventListener("click", () => {
            // Get the current active tab
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const url = tabs[0].url;

                // Extract the product name from URL
                const productName = extractProductName(url);
                console.log("Extracted Product Name:", productName);
                
                // Display the product name in the popup (optional)
                const resultDiv = document.getElementById('result');
                if (resultDiv) {
                    resultDiv.textContent = `Product: ${productName}`;
                }

                // Send the product name to your backend
                fetch(`http://localhost:8080/search?query=${encodeURIComponent(productName)}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log("Search results from backend:", data);
                        // You can now send this to Fuse.js for sorting/filtering
                        
                        // Display results in popup (optional)
                        if (resultDiv) {
                            resultDiv.innerHTML = `<strong>Product:</strong> ${productName}<br><strong>Results:</strong> ${data.length} items found`;
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching backend:", err);
                        if (resultDiv) {
                            resultDiv.textContent = `Error: ${err.message}`;
                        }
                    });
            });
        });
    } else {
        console.error("Find button not found!");
    }
});
