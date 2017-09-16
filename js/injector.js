//inject jquery
var jq = document.createElement('script');
jq.src = chrome.extension.getURL('js/jquery-2.1.4.min.js');
(document.head).appendChild(jq);
//wait for jq to inject
setTimeout(function () {
    //inject content script and style
    var cs = document.createElement('script');
    var css = document.createElement('link');
    cs.src = chrome.extension.getURL('js/content.js');
    css.rel = 'stylesheet';
    css.type = 'text/css';
    css.href = chrome.extension.getURL('css/content.css');
    (document.head).appendChild(cs);
    (document.head).appendChild(css);
}, 1000);
//communication
window.addEventListener("message", function (event) {
    if (event.data.type) {
        if (event.data.type == "getVars") {
            chrome.storage.sync.get(["encoding", "fColor", "fSize", "sColor", "sSize", "fontFam"], function (items) {
                window.postMessage({
                    type: "postVars",
                    encoding: items.encoding,
                    fColor: items.fColor,
                    fSize: items.fSize,
                    sColor: items.sColor,
                    sSize: items.sSize,
                    fontFam: items.fontFam
                }, "*");
            })
        } else if (event.data.type == "setVars") {
            chrome.storage.sync.set({
                fSize: event.data.fSize
            });
        } else if (event.data.type == "options") {
            chrome.runtime.sendMessage({
                type: "options"
            })
        }
    }
}, false);
