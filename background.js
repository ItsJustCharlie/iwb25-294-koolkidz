console.log('Background script loaded and active');
if ('action' in chrome) {
  console.log('Chrome action API available');
  chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked, tab ID:', tab.id);
    if (!tab || !tab.id) {
      console.error('Invalid tab object:', tab);
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).then(() => {
      console.log('Content script injected into tab', tab.id);
    }).catch((error) => {
      console.error('Injection failed:', error.message);
    });
  });
} else {
  console.error('Chrome action API not supported');
}