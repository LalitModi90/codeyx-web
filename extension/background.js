// background.js
// Background Sync Engine for Codeyx

let API_BASE_URL = 'http://127.0.0.1:5005/api'; // Change to production later

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SYNC_SUBMISSION') {
        const payload = {
            userId: message.userId,
            problemSlug: message.problemSlug,
            platform: message.platform,
            timestamp: message.timestamp || Date.now()
        };
        queueSubmission(payload);
    } else if (message.type === 'AUTO_CONNECT') {
        // Automatically link account if not linked
        chrome.storage.local.get(['codeyxUserId'], async (res) => {
            if (!res.codeyxUserId && message.username) {
                try {
                    const profileRes = await fetch(`${API_BASE_URL}/profile/${message.username}`);
                    if (profileRes.ok) {
                        const data = await profileRes.json();
                        if (data.success && data.data && data.data.userId) {
                            chrome.storage.local.set({ codeyxUserId: data.data.userId });
                            console.log("Codeyx Sync: Automatically connected account", data.data.userId);
                            
                            chrome.notifications.create({
                                type: 'basic',
                                iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 
                                title: 'Codeyx Automatically Connected',
                                message: `Your extension is now linked to ${message.username}!`
                            });
                        }
                    }
                } catch (err) {
                    console.log("Codeyx Sync: Auto-connect failed", err);
                }
            }
        });
    }
});

function queueSubmission(payload) {
    chrome.storage.local.get({ syncQueue: [] }, (result) => {
        const queue = result.syncQueue;
        // Prevent duplicate immediate queues
        if (!queue.find(q => q.problemSlug === payload.problemSlug && q.platform === payload.platform && (Date.now() - q.timestamp < 60000))) {
            queue.push(payload);
            chrome.storage.local.set({ syncQueue: queue }, () => {
                attemptSync();
            });
        }
    });
}

async function attemptSync() {
    if (!navigator.onLine) {
        console.log("Codeyx: Offline, will retry later.");
        return;
    }

    chrome.storage.local.get({ syncQueue: [], codeyxUserId: null }, async (result) => {
        const queue = result.syncQueue;
        if (queue.length === 0) return;

        const userId = result.codeyxUserId;
        if (!userId) return;

        let failedQueue = [];

        for (let item of queue) {
            try {
                // Determine appropriate endpoint based on platform
                // Assuming we have an endpoint to accept extension syncs
                const response = await fetch(`${API_BASE_URL}/progress/extension-sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, slug: item.problemSlug, platform: item.platform })
                });

                if (!response.ok) {
                    console.error("Codeyx: Sync failed for", item.problemSlug);
                    failedQueue.push(item);
                } else {
                    console.log("Codeyx: Successfully synced", item.problemSlug);
                    
                    // Save to history for Timeline
                    chrome.storage.local.get({ syncHistory: [] }, (histRes) => {
                        let history = histRes.syncHistory;
                        history.unshift({
                            platform: item.platform,
                            slug: item.problemSlug,
                            timestamp: Date.now()
                        });
                        if (history.length > 50) history = history.slice(0, 50); // Keep last 50
                        chrome.storage.local.set({ syncHistory: history });
                    });
                    // Fetch latest stats to update popup UI live!
                    try {
                        const statsRes = await fetch(`${API_BASE_URL}/leaderboard/user/${userId}`);
                        if (statsRes.ok) {
                            const statsData = await statsRes.json();
                            if (statsData.success && statsData.data) {
                                chrome.storage.local.set({ codeyxStats: statsData.data, lastSynced: Date.now() });
                            }
                        }
                    } catch (e) {
                        console.error("Codeyx: Failed to refresh stats in background", e);
                    }

                    // Trigger notification
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 
                        title: 'Codeyx Sync Successful',
                        message: `Tracked ${item.platform} activity: ${item.problemSlug}`
                    });
                }
            } catch (err) {
                console.error("Codeyx: Network error during sync", err);
                failedQueue.push(item);
            }
        }

        chrome.storage.local.set({ syncQueue: failedQueue });
    });
}

// Periodic check for unsynced items
chrome.alarms.create("syncRetry", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "syncRetry") {
        attemptSync();
    }
});
