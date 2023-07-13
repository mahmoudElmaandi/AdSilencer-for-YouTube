const responseCallback = () => {
    if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("Receiving end does not exist")) {
        console.log("lastError", chrome.runtime.lastError)
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { to, action } = message;
    if (!to == "background") return;
    console.log(message);

    switch (action) {
        case "setBadgeStatus":
            chrome.action.setBadgeText({
                tabId: sender.tab.id,
                text: message.badgeText,
            });

            chrome.action.setBadgeBackgroundColor({
                tabId: sender.tab.id,
                color: message.badgeColor
            })
            break;

        default:
            break;
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    console.log("action.onClicked");
    const prevText = await chrome.action.getBadgeText({ tabId: tab.id });
    const prevColor = await chrome.action.getBadgeBackgroundColor({ tabId: tab.id });

    const isOff = prevText === 'OFF';

    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: isOff ? prevText : 'OFF',
    });

    await chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: isOff ? prevColor : "#FF0000"
    });

    chrome.tabs.sendMessage(tab.id, { to: "index", action: isOff ? "observe" : "disconnect" }, responseCallback)
});