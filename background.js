chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "initSql") {
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async
});