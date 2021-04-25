chrome.storage.sync.get(['trackerid'], res => {
    document.getElementById("tid").innerHTML = res.trackerid
})