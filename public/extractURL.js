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
