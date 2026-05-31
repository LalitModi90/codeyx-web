// inject.js
// Monkey-patch fetch to intercept SPA submission network requests
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    let url = '';
    if (args[0] instanceof Request) {
        url = args[0].url;
    } else if (typeof args[0] === 'string') {
        url = args[0];
    } else if (args[0] && args[0].toString) {
        url = args[0].toString();
    }
    
    // Leetcode GraphQL Submission Interceptor
    if (url && typeof url === 'string' && url.includes('/graphql')) {
        const clonedRes = response.clone();
        clonedRes.json().then(data => {
            if (data && data.data) {
                const details = data.data.submissionDetails || data.data.mySubmissionDetail;
                if (details) {
                    if (details.statusCode === 10 || details.statusDisplay === "Accepted" || details.status === 10) {
                        const slug = details.question?.titleSlug || details.questionSlug;
                        if (slug) {
                            window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                                detail: { status: 'Accepted', slug: slug, platform: 'leetcode' }
                            }));
                        } else {
                            // Fallback to URL if slug is missing in payload
                            const match = window.location.pathname.match(/\/problems\/([^/]+)/);
                            if (match) {
                                window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                                    detail: { status: 'Accepted', slug: match[1], platform: 'leetcode' }
                                }));
                            }
                        }
                    }
                }
            }
        }).catch(err => {});
    }

    // Legacy Leetcode polling fallback
    if (url && typeof url === 'string' && url.includes('/submissions/detail/') && url.includes('/check/')) {
        const clonedRes = response.clone();
        clonedRes.json().then(data => {
            if (data.state === "SUCCESS" && data.status_msg === "Accepted") {
                const match = window.location.pathname.match(/\/problems\/([^/]+)/);
                if (match) {
                    const slug = match[1];
                    window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                        detail: { status: 'Accepted', slug: slug, platform: 'leetcode' }
                    }));
                }
            }
        }).catch(err => {});
    }

    // GeeksforGeeks API
    if (url && typeof url === 'string' && url.includes('practiceapi.geeksforgeeks.org/api/v1/problems') && url.includes('/submissions/')) {
        const clonedRes = response.clone();
        clonedRes.json().then(data => {
            if (data && data.status === "correct" || data.result === "Accepted") {
                const match = window.location.pathname.match(/\/problems\/([^/]+)/);
                if (match) {
                    const slug = match[1];
                    window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                        detail: { status: 'Accepted', slug: slug, platform: 'geeksforgeeks' }
                    }));
                }
            }
        }).catch(err => {});
    }

    // GeeksforGeeks API
    // GFG logic remains below...
    if (url && typeof url === 'string' && url.includes('practiceapi.geeksforgeeks.org/api/v1/problems/') && url.includes('/compile-and-run/')) {
        const clonedRes = response.clone();
        clonedRes.json().then(data => {
            if (data.status === "correct") {
                const match = window.location.pathname.match(/\/problems\/([^/]+)/);
                if (match) {
                    const slug = match[1];
                    window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                        detail: { status: 'Accepted', slug: slug, platform: 'gfg' }
                    }));
                }
            }
        }).catch(err => {});
    }
    
    return response;
};

// Monkey-patch XMLHttpRequest just in case Leetcode uses Axios/XHR
const originalXHR = window.XMLHttpRequest;
function newXHR() {
    const xhr = new originalXHR();
    xhr.addEventListener('load', function() {
        try {
            if (this.responseURL && this.responseURL.includes('/graphql')) {
                const data = JSON.parse(this.responseText);
                if (data && data.data) {
                    const details = data.data.submissionDetails || data.data.mySubmissionDetail;
                    if (details) {
                        if (details.statusCode === 10 || details.statusDisplay === "Accepted" || details.status === 10) {
                            const slug = details.question?.titleSlug || details.questionSlug;
                            if (slug) {
                                window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                                    detail: { status: 'Accepted', slug: slug, platform: 'leetcode' }
                                }));
                            } else {
                                // Fallback to URL if slug is missing in payload
                                const match = window.location.pathname.match(/\/problems\/([^/]+)/);
                                if (match) {
                                    window.dispatchEvent(new CustomEvent('CodeyxSubmission', {
                                        detail: { status: 'Accepted', slug: match[1], platform: 'leetcode' }
                                    }));
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {}
    });
    return xhr;
}
window.XMLHttpRequest = newXHR;
