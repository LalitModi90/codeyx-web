// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const userIdInput = document.getElementById('userIdInput');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const errorMsg = document.getElementById('errorMsg');

    const API_BASE_URL = 'http://127.0.0.1:5005/api';

    // Check if user is logged in
    chrome.storage.local.get(['codeyxUserId', 'codeyxStats'], (result) => {
        if (result.codeyxUserId) {
            showDashboard(result.codeyxUserId, result.codeyxStats);
            fetchLatestStats(result.codeyxUserId);
        } else {
            showLogin();
        }
    });

    saveBtn.addEventListener('click', async () => {
        const inputId = userIdInput.value.trim();
        if (!inputId) {
            showError('Please enter a valid User ID or Username');
            return;
        }

        saveBtn.textContent = 'Connecting...';
        
        try {
            // Verify user ID or username
            const res = await fetch(`${API_BASE_URL}/profile/${inputId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data && data.data.userId) {
                    const realUserId = data.data.userId;
                    chrome.storage.local.set({ codeyxUserId: realUserId }, () => {
                        showDashboard(realUserId, null);
                        fetchLatestStats(realUserId);
                    });
                } else {
                    showError('User not found. Please check your username/ID.');
                    saveBtn.textContent = 'Connect Account';
                }
            } else {
                showError('Invalid request. Please check and try again.');
                saveBtn.textContent = 'Connect Account';
            }
        } catch (err) {
            showError('Network error. Is the Codeyx backend running?');
            saveBtn.textContent = 'Connect Account';
        }
    });

    logoutBtn.addEventListener('click', () => {
        chrome.storage.local.remove(['codeyxUserId', 'codeyxStats'], () => {
            showLogin();
        });
    });

    function showLogin() {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }

    function showDashboard(userId, cachedStats) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        
        if (cachedStats) {
            updateUI(cachedStats);
        } else {
            // Render at least the timeline if stats are missing
            updateUI({});
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }

    async function fetchLatestStats(userId) {
        try {
            // Fetch stats from Leaderboard or Profile API
            const res = await fetch(`${API_BASE_URL}/leaderboard/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    const stats = data.data;
                    chrome.storage.local.set({ codeyxStats: stats, lastSynced: Date.now() });
                    updateUI(stats);
                }
            }
        } catch (err) {
            console.error('Failed to fetch latest stats', err);
        }
    }

    function updateUI(stats) {
        document.getElementById('statProblems').textContent = stats.problems || 0;
        // In a real scenario, fetch streak from a specific endpoint
        document.getElementById('statStreak').textContent = (stats.streak || 0) + ' 🔥';

        const platContainer = document.getElementById('platformBreakdownContainer');
        if (platContainer) {
            platContainer.innerHTML = '';
            let hasPlatforms = false;
            
            if (stats.platformBreakdown) {
                Object.entries(stats.platformBreakdown).forEach(([platform, data]) => {
                    if (data.solved > 0 || data.rating > 0) {
                        hasPlatforms = true;
                        // Format platform name
                        const name = platform.charAt(0).toUpperCase() + platform.slice(1);
                        const badge = document.createElement('div');
                        badge.style.cssText = 'background: #18181B; border: 1px solid #27272A; border-radius: 6px; padding: 4px 8px; font-size: 11px; color: #E4E4E7; display: flex; align-items: center; gap: 6px;';
                        
                        let iconColor = '#10B981';
                        if (platform === 'leetcode') iconColor = '#F59E0B';
                        else if (platform === 'codeforces') iconColor = '#3B82F6';
                        else if (platform === 'codeyx') iconColor = '#FF8A00';
                        else if (platform === 'geeksforgeeks') iconColor = '#22C55E';
                        
                        badge.innerHTML = `<div style="width: 6px; height: 6px; border-radius: 50%; background: ${iconColor};"></div> ${name}: ${data.solved || 0}`;
                        platContainer.appendChild(badge);
                    }
                });
            }

            if (!hasPlatforms) {
                platContainer.innerHTML = `<div style="font-size: 11px; color:#A1A1AA;">Solve problems to see breakdown</div>`;
            }
        }

        chrome.storage.local.get(['syncQueue', 'lastSynced', 'syncHistory'], (res) => {
            if (res.lastSynced) {
                const mins = Math.floor((Date.now() - res.lastSynced) / 60000);
                document.getElementById('lastSyncedText').textContent = mins === 0 ? 'Synced just now' : `Synced ${mins}m ago`;
            }
            
            const timelineContainer = document.getElementById('timelineContainer');
            timelineContainer.innerHTML = ''; // clear

            let hasItems = false;

            // Render queued items first
            if (res.syncQueue && res.syncQueue.length > 0) {
                hasItems = true;
                res.syncQueue.forEach(q => {
                    const el = document.createElement('div');
                    el.className = 'activity-row';
                    el.innerHTML = `
                        <div class="activity-title" style="color: #F59E0B">Queued: ${q.problemSlug} (${q.platform})</div>
                        <div class="activity-time">Pending...</div>
                    `;
                    timelineContainer.appendChild(el);
                });
            }

            // Render history items
            if (res.syncHistory && res.syncHistory.length > 0) {
                hasItems = true;
                res.syncHistory.forEach(h => {
                    const el = document.createElement('div');
                    el.className = 'activity-row';
                    const timeStr = new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    el.innerHTML = `
                        <div class="activity-title">Solved ${h.slug} (${h.platform})</div>
                        <div class="activity-time">${timeStr}</div>
                    `;
                    timelineContainer.appendChild(el);
                });
            }

            if (!hasItems) {
                timelineContainer.innerHTML = `
                    <div class="activity-row" style="border-top: none; padding-top: 0;">
                        <div class="activity-title" style="color:#A1A1AA;">No recent activity tracked</div>
                    </div>
                `;
            }
        });
    }

    // Listen for storage changes to update UI live if popup is kept open
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && (changes.syncQueue || changes.syncHistory || changes.lastSynced)) {
            chrome.storage.local.get(['codeyxStats'], (res) => {
                updateUI(res.codeyxStats || {});
            });
        }
    });
});
