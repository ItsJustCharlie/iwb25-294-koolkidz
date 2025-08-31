// Content script for e-commerce sites
// This script runs on the actual web pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageInfo") {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname
    };
    
    sendResponse(pageInfo);
  }
});

// Optional: Detect if we're on a product page
function isProductPage() {
  const url = window.location.href;
  
  // Check for common product page patterns
  if (url.includes('daraz.lk') && url.includes('/products/')) return true;
  if (url.includes('ikman.lk') && (url.includes('/ad/') || url.includes('/en/ad/'))) return true;
  if (url.includes('wasi.lk') && url.includes('/product/')) return true;
  
  return false;
}

// Send page info to background script when page loads
if (isProductPage()) {
  chrome.runtime.sendMessage({
    action: "pageDetected",
    url: window.location.href,
    isProductPage: true
  });
}
