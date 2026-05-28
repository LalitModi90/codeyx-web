// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SYNC_SUBMISSION') {
        const { userId, problemSlug, platform } = request;
        
        fetch('http://localhost:5005/api/progress/extension-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, slug: problemSlug, platform })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Codeyx Sync Success:', data);
        })
        .catch(err => console.error('Codeyx Sync Error:', err));
    }
});
