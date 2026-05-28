// inject.js
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0];
    
    // Leetcode constantly polls for submission status
    if (url && typeof url === 'string' && url.includes('/submissions/detail/') && url.includes('/check/')) {
        const clonedRes = response.clone();
        clonedRes.json().then(data => {
            if (data.state === "SUCCESS" && data.status_msg === "Accepted") {
                const match = window.location.pathname.match(/\/problems\/([^/]+)/);
                if (match) {
                    const slug = match[1];
                    window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                        detail: { status: 'Accepted', slug: slug }
                    }));
                }
            }
        }).catch(err => {
            // Ignore parse errors for irrelevant requests
        });
    }
    return response;
};
