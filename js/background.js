// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {
    //set default values if there arent any set already
    if (!chrome.storage.sync.get("encoding", function (items) {})) {
        chrome.storage.sync.set({
            encoding: 'UTF8',
            fColor: "#FFFFFF",
            fSize: "42",
            sColor: "#000000",
            sSize: "10",
            fontFam: "monospace"
        });
    }
    /* Replace all rules ...
     chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
     // With a new rule ...
     chrome.declarativeContent.onPageChanged.addRules([
     {
     // That fires when a page's URL contains a 'g' ...
     conditions: [
     new chrome.declarativeContent.PageStateMatcher({
     pageUrl: {
     urlMatches: 'netflix.com/watch/*'
     },
     })
     ],
     // And shows the extension's page action.
     actions: [new chrome.declarativeContent.ShowPageAction()]
     }
     ]);
     })
     */
});
//listen for options open message
chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log(message);
    if (message.type == "options") {
        chrome.runtime.openOptionsPage();
    }
});
