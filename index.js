let videoPlayer, mainVideo, muteButton;

const extStatus = {
    on: { text: "ON", color: "#008000" }, // green
    off: { text: "OFF", color: "#FF0000" }, // red
    adPlaying: { text: "Muted", color: "#FFA500" }, // orange
    videoPlaying: { text: "ON", color: "#008080" }, // teal
};

const observer = new MutationObserver((mutationList, observer) => {
    videoPlayer = document.querySelector('#player-container .html5-video-player');
    mainVideo = videoPlayer.querySelector('.html5-main-video');
    muteButton = videoPlayer.querySelector('.ytp-mute-button');
    const muteButtonStatus = muteButton.getAttribute("data-title-no-tooltip");

    if (videoPlayer.classList.contains("ad-interrupting")) {
        console.log("ad is playing");
        mainVideo.style.display = "none";
        if (muteButtonStatus == "Mute") muteButton.click();
        sendSetBadgeStatusMessage(extStatus.adPlaying);
    } else {
        console.log("No Ads");
        mainVideo.style.display = "block";
        if (muteButtonStatus == "Unmute") muteButton.click();
        sendSetBadgeStatusMessage(extStatus.videoPlaying);
    }
});

function sendSetBadgeStatusMessage({ text, color }) {
    chrome.runtime.sendMessage({
        to: "background",
        action: "setBadgeStatus",
        badgeText: text,
        badgeColor: color
    });
};

function observe() {
    videoPlayer = document.querySelector('#player-container .html5-video-player');
    let noTries = 0;
    while (!videoPlayer && ++noTries < 5) videoPlayer = document.querySelector('#player-container .html5-video-player');

    sendSetBadgeStatusMessage(videoPlayer ? extStatus.on : extStatus.off);

    if (!videoPlayer) return;

    observer.observe(videoPlayer, { attributes: true });
    videoPlayer.classList.add("observing");
    console.log("Observing");
};

function disconnect() {
    observer.disconnect();
    mainVideo.style.display = "block";
    if (muteButton.getAttribute("data-title-no-tooltip") == "Unmute") muteButton.click();
    console.log("Discontented");
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { to, action } = message;
    if (!to == "index") return;
    console.log(message);

    switch (action) {
        case "observe":
            observe();
            break;

        case "disconnect":
            disconnect();
            break;

        default:
            break;
    }
});

setTimeout(observe, 1000);
console.log("Ext is loaded");