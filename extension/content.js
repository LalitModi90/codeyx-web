// content.js
// Universal Content Script for Codeyx Universal Sync

// 1. Listen for intercepted fetch requests (from inject.js) for SPAs like LeetCode and GFG
window.addEventListener("CodeyxSubmission", function(event) {
    const data = event.detail;
    if (data && data.status === "Accepted") {
        console.log(`Codeyx: Detected Accepted Submission on ${data.platform} for ${data.slug}`);
        sendToBackground(data.platform, data.slug);
    }
});

// 2. DOM Observers for SSR sites like Codeforces & CodeChef
function observeDOM() {
    const hostname = window.location.hostname;

    if (hostname.includes('codeforces.com')) {
        // Watch for 'Accepted' in status table
        const observer = new MutationObserver(() => {
            const statusCells = document.querySelectorAll('span.submissionVerdictWrapper');
            statusCells.forEach(cell => {
                if (cell.textContent.includes('Accepted') && !cell.hasAttribute('data-codeyx-synced')) {
                    cell.setAttribute('data-codeyx-synced', 'true');
                    const row = cell.closest('tr');
                    const problemLink = row?.querySelector('td[data-problemid] a');
                    if (problemLink) {
                        const slug = problemLink.href.split('/').pop();
                        console.log("Codeyx: Codeforces Accepted ->", slug);
                        sendToBackground('codeforces', slug || 'unknown');
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (hostname.includes('leetcode.com')) {
        // Ultimate Fallback for LeetCode
        setInterval(() => {
            // Check if we are on a problem page or submission page
            const match = window.location.pathname.match(/\/problems\/([^/]+)/);
            if (!match) return;
            const slug = match[1];

            // Strategy 1: Check for explicit data-e2e-locator (Modern LeetCode UI)
            const e2eElement = document.querySelector('[data-e2e-locator="submission-result"]');
            if (e2eElement && e2eElement.textContent && e2eElement.textContent.includes('Accepted') && !e2eElement.hasAttribute('data-codeyx-synced')) {
                e2eElement.setAttribute('data-codeyx-synced', 'true');
                console.log("Codeyx: LeetCode Ultimate Tracker Accepted (e2e) ->", slug);
                sendToBackground('leetcode', slug);
                return;
            }

            // Strategy 2: Look for any element that has exactly "Accepted" text
            // Or contains both "Accepted" and "testcases passed" (very common in the modern UI)
            const elems = document.querySelectorAll('span, div, h1, h2, h3, p');
            for (let i = 0; i < elems.length; i++) {
                const text = elems[i].textContent;
                if (!text || elems[i].hasAttribute('data-codeyx-synced')) continue;

                const isExactMatch = text.trim() === 'Accepted' || text.trim() === 'Accepted!';
                const isCompositeMatch = text.includes('Accepted') && text.includes('testcases passed');

                if (isExactMatch || isCompositeMatch) {
                    // Check if the text matches but make sure it's not a huge container (like body or main wrapper)
                    if (text.length < 100) {
                        elems[i].setAttribute('data-codeyx-synced', 'true');
                        console.log("Codeyx: LeetCode Ultimate Tracker Accepted (DOM Match) ->", slug);
                        sendToBackground('leetcode', slug);
                        break;
                    }
                }
            }
        }, 1500);
    }

    if (hostname.includes('codechef.com')) {
        const observer = new MutationObserver(() => {
            const statusIcon = document.querySelector('img[alt="Accepted"], [title="accepted"]');
            if (statusIcon && !statusIcon.hasAttribute('data-codeyx-synced')) {
                statusIcon.setAttribute('data-codeyx-synced', 'true');
                const slug = window.location.pathname.split('/')[2] || 'unknown';
                console.log("Codeyx: CodeChef Accepted ->", slug);
                sendToBackground('codechef', slug);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    if (hostname.includes('github.com')) {
        // Watch for PR merges, issue closures, or commits
        // Complex to track live, rely mostly on background polling for Github, 
        // but we can catch explicit "Merge pull request" clicks
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.tagName === 'BUTTON' && target.textContent.includes('Merge pull request')) {
                sendToBackground('github', 'pr_merged');
            }
        });
    }

    if (hostname.includes('localhost') || hostname.includes('codeyx')) {
        // Auto-Connect when the user visits their Codeyx Dashboard
        const tryAutoConnect = setInterval(() => {
            const username = window.localStorage.getItem('codeyx_username');
            if (username) {
                clearInterval(tryAutoConnect);
                chrome.runtime.sendMessage({
                    type: 'AUTO_CONNECT',
                    username: username
                });
                console.log("Codeyx Sync: Auto-connect triggered for", username);
            }
        }, 2000);
    }
}

function sendToBackground(platform, slug) {
    chrome.storage.local.get(['codeyxUserId'], function(result) {
        if (result.codeyxUserId) {
            chrome.runtime.sendMessage({
                type: 'SYNC_SUBMISSION',
                userId: result.codeyxUserId,
                problemSlug: slug,
                platform: platform,
                timestamp: Date.now()
            });
        } else {
            console.warn("Codeyx: User ID not set. Please link your account in the extension popup.");
        }
    });
}

// Start observing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeDOM);
} else {
    observeDOM();
}
