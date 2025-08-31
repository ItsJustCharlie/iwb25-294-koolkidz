// Function to extract product name from URL
function extractProductName(url) {
    try {
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
            // Wasi.lk specific cleaning
            productName = productName.replace(/-\d+$/g, '');
        } else if (url.includes('ikman.lk')) {
            // Ikman.lk specific cleaning
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

        return productName || "Unknown Product";
    } catch (error) {
        console.error("Error extracting product name:", error);
        return "Unknown Product";
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentUrl") {
    try {
      // Get the current active tab
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        try {
          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message
            });
            return;
          }
          
          if (tabs && tabs[0]) {
            const currentUrl = tabs[0].url;
            const productName = extractProductName(currentUrl);
            
            sendResponse({
              url: currentUrl,
              productName: productName,
              success: true
            });
          } else {
            sendResponse({
              success: false,
              error: "Could not get current tab"
            });
          }
        } catch (error) {
          sendResponse({
            success: false,
            error: error.message
          });
        }
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});
