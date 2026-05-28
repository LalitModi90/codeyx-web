// content.js
// Inject script to intercept fetch requests in page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from inject.js
window.addEventListener("CodeyxSubmission", function(event) {
    const data = event.detail;
    if (data && data.status === "Accepted") {
        console.log("Codeyx: Detected Accepted Submission for", data.slug);
        
        chrome.storage.local.get(['codeyxUserId'], function(result) {
            if (result.codeyxUserId) {
                // Send to background to make API call safely
                chrome.runtime.sendMessage({
                    type: 'SYNC_SUBMISSION',
                    userId: result.codeyxUserId,
                    problemSlug: data.slug,
                    platform: 'leetcode'
                });
            } else {
                console.warn("Codeyx: User ID not set in extension. Click the extension icon to set it.");
            }
        });
    }
});
