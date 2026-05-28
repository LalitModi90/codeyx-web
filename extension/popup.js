document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['codeyxUserId'], (result) => {
        if (result.codeyxUserId) {
            document.getElementById('userIdInput').value = result.codeyxUserId;
        }
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        const userId = document.getElementById('userIdInput').value.trim();
        chrome.storage.local.set({ codeyxUserId: userId }, () => {
            const status = document.getElementById('statusMsg');
            status.style.display = 'block';
            setTimeout(() => { status.style.display = 'none'; }, 2000);
        });
    });
});
