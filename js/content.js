// ------------------ FUNCTIONS ------------------
//change status msg
function statMsg(msg) {
    msfn_status.html(msg);
    msfn_status.stop();
    msfn_status.fadeTo(200, 0.8, function () {
        msfn_status.fadeOut(3000, function () {
            msfn_status.html("");
        });
    });
}

// find current subtitle
function findCurrentIndex() {
    for (var i = msfn_subtitleArray.length - 1; i > 0; i--) {
        if (msfn_subtitleArray[i].beginTime < msfn_currentTime) {
            msfn_currentIndex = i;
            break;
        }
    }
}

// parse subtitles to variable
function parseSubtitles(subFile) {

    msfn_subName = subFile.name;
    fileType = subFile.type;
    var reader = new FileReader();
    // saving the file to variable
    reader.onload = (function () {
        // breaking text by lines
        var subtitleText = reader.result.split(/\r?\n/);
        //finding subtitle count
        var i = 1;
        var count;
        //read lines from bottom
        do {
            var line = subtitleText[subtitleText.length - i];
            //check for integer that isnt timing
            if (!isNaN(parseInt(line)) && line.indexOf("-->") === -1) {
                count = parseInt(subtitleText[subtitleText.length - i]);
            }
            i++;
        } while (count === undefined);
        //load subitles into array
        i = 0;
        msfn_currentIndex = 1;
        while (i < subtitleText.length - 1) {
            //prepare subtitle object
            var subtitle = {
                beginTime: 0,
                endTime: 0,
                text: ""
            };
            // parse subtitle
            //skip empty lines (mostly at the end)             
            while (subtitleText[i].trim() === "") {
                i++;
                if (i === subtitleText.length - 1) {
                    var breakCond = true;
                }
            }
            if (breakCond !== undefined) {
                break;
            }
            // skip line numbers
            i++;
            //parse times
            var beginStr = subtitleText[i].split("-->")[0];
            var endStr = subtitleText[i].split("-->")[1];
            beginStr = beginStr.split(":");
            endStr = endStr.split(":")
            subtitle.beginTime = parseFloat(beginStr[0]) * 60 * 60 + parseFloat(beginStr[1]) * 60 + parseFloat(beginStr[2].replace(",", "."));
            subtitle.endTime = parseFloat(endStr[0]) * 60 * 60 + parseFloat(endStr[1]) * 60 + parseFloat(endStr[2].replace(",", "."));
            // increment line number and parse all text lines
            i++;
            //at least one line is always present
            var text = subtitleText[i].trim();
            i++;
            while (subtitleText[i].trim() !== "") {
                text = text + "<br>" + subtitleText[i].trim();
                i++;
            }
            subtitle.text = text;
            //insert into array
            msfn_subtitleArray.push(subtitle);
            i++;
        }
        msfn_currentTime = $("video")[0].currentTime + msfn_delay;
        findCurrentIndex();
        //adjust sub choices
        $(msfn_subtitleList + ">li:contains(Off)").click()
        if (msfn_subName.length > 12) {
            msfn_customSubButton.html(msfn_subName.substr(0, 9) + "...");
        } else {
            msfn_customSubButton.html(msfn_subName);
        }

        //show subs
        msfn_subtitles.show();
        //erase input file
        msfn_subtitleInput.val("");
        statMsg("Subtitles loaded: " + msfn_subName);
        msfn_customActive = true;
    })
    // read the subtitles
    reader.readAsText(subFile, msfn_encoding);
}

function videoLoadTest() {
    //if video isnt loaded, try again
    if ($("video").length === 0) {
        setTimeout(function () {
            videoLoadTest();
        }, 1000);
    } else {
        //display subtitles on video timeupdate
        $("video").on("timeupdate", function () {
            if (msfn_customActive) {
                msfn_currentTime = this.currentTime + msfn_delay;
                if (msfn_subtitleArray.length > 0) {
                    if (msfn_currentTime < msfn_subtitleArray[msfn_currentIndex].endTime) {
                        msfn_subtitles.html(msfn_subtitleArray[msfn_currentIndex].text);
                        //adjust y-position when controls are shown
                        if ($(msfn_playerControlsHidden).length > 0) {
                            msfn_subtitles.css("bottom", "2%");
                        } else {
                            msfn_subtitles.css("bottom", "17%");
                        }
                    } else {
                        if (msfn_currentTime > msfn_subtitleArray[msfn_currentIndex].endTime) {
                            msfn_subtitles.html(" ");
                            if (msfn_currentTime > msfn_subtitleArray[msfn_currentIndex + 1].beginTime) {
                                msfn_currentIndex++;
                            }
                        }
                    }
                }
            }
        });
        $("video").on("seeked", function () {
            if (msfn_customActive) {
                msfn_currentTime = this.currentTime + msfn_delay;
                findCurrentIndex();
            }
        });
    }
}

function controlsLoadTest() {
    //if controls arent loaded, try again
    if ($(".button-nfplayerSubtitles").length === 0) {
        setTimeout(function () {
            controlsLoadTest();
        }, 1000);
    } else {
        //hide custom subs when official are turned on
        $(document).on("click", msfn_subtitleList + ">li:not(:first)", function () {
            if (msfn_customActive) {
                //reset custBtn
                msfn_customSubButton.removeClass("selected").empty().html("Custom");
                $(msfn_subtitleList + ">li>" + msfn_subtitleCheck).show()
                $(this).addClass("selected");
                //remove subs
                msfn_subtitles.hide();
                msfn_subtitleArray = [];
                msfn_customActive = false;
            }
        });
        $(".button-nfplayerSubtitles").mouseover(function () {
            $(msfn_subtitleList).prepend(msfn_customSubButton);
            var checkClone = $(msfn_subtitleList + ">li>" + msfn_subtitleCheck).clone();
            if (msfn_customActive) {
                $(msfn_subtitleList + ">.selected").removeClass("selected");
                $(msfn_subtitleList + ">li>" + msfn_subtitleCheck).hide()
                checkClone.appendTo(msfn_customSubButton);
                msfn_customSubButton.addClass("selected");
            } else {
                $(msfn_subtitleList + ">li>" + msfn_subtitleCheck).show()
            }
        });
    }
}

function changeSubtitleSize(sizeIncrement) {
    var newSize = parseInt(msfn_subtitles.css("font-size")) + sizeIncrement;
    msfn_subtitles.css("font-size", newSize + "px");
    window.postMessage({
        type: "setVars",
        fSize: newSize
    }, "*");
    statMsg("Size: " + newSize + "px");
}

function changeDelay(delayIncrement) {
    msfn_delay -= delayIncrement;
    findCurrentIndex();
    $("video").trigger("timeupdate");
    statMsg("Delay: " + msfn_delay.toFixed(1) + "ms");
}

// ------------------ VARIABLES ------------------
//encoding 
var msfn_encoding = "UTF8";
//subtitle filename
var msfn_subName = "";
// subtitle delay
var msfn_delay = 0.000;
// current video time
var msfn_currentTime = 0;
// subtitle array 
var msfn_subtitleArray = [];
// current subititle index
var msfn_currentIndex = 0;
//
var msfn_customActive = false;
// ---- NETFLIX SELECTORS ----
// player controls
var msfn_playerControls = ".PlayerControlsNeo__bottom-controls";
//hidden controls
var msfn_playerControlsHidden = ".PlayerControlsNeo__bottom-controls--faded";
// subtitle list selector
var msfn_subtitleList = ".track-list-subtitles>ul";
// subtitle check selector
var msfn_subtitleCheck = ".video-controls-check";
// ---- MSFN ELEMENTS ----
//input for subs file
var msfn_subtitleInput = $('<input type="file" id="msfn_subtitleInput" name="msfn_subtitles" accept=".srt">')
        .change(function () {
            var subFiles = this.files;
            if (subFiles.length !== 0) {
                parseSubtitles(subFiles[0]);
            }
        });
//overlay for drag and drop
var msfn_dragOverlay = $('<div id="msfn_dragOverlay">Drop subtitles here</div>');
//subs placeholder
var msfn_subtitles = $('<div id="msfn_subtitles"></div>');
//status div
var msfn_status = $('<div id="msfn_status"></div>');
//custom subtitles button
var msfn_customSubButton = $('<li id="msfn_customSubButton" class="track">Custom</li>')
        .click(function () {
            msfn_subtitleInput.click();
        });
// ------------------ INITIALIZATION ------------------
$(document).ready(function () {
    /* subtitle array init
     msfn_subtitleArray.push({
     beginTime: 0,
     endTime: 0,
     text: ""
     });
     */

// message listener
    window.addEventListener("message", function (event) {
        if (event.data.type) {
            if (event.data.type == "postVars") {
                msfn_subtitles.css({
                    "color": event.data.fColor,
                    "font-size": event.data.fSize,
                    "font-family": event.data.fontFam,
                    "shadow": "0px 0px " + event.data.sSize + " " + event.data.sColor
                });
                msfn_encoding = event.data.encoding;
            }
        }
    }, false);

// -------------------------------------------------------------------------------------------------------------


//keyboard shortcuts
//TODO editable shortcuts - add to vars, cases from vars
    $(document).keydown(function (e) {
        switch (e.which) {
            case 34: // PgDn
                if (e.altKey) {
                    changeDelay(-0.1)
                } else if (e.shiftKey) {
                    changeSubtitleSize(-6);
                }
                break;
            case 33: // PgUp key
                if (e.altKey) {
                    changeDelay(0.1)
                } else if (e.shiftKey) {
                    changeSubtitleSize(6);
                }
                break;
            case 76:
                if (e.altKey) {
                    msfn_subtitleInput.click();
                }
            default:
                return;
        }

    });

// add injected content
    $("body").prepend(msfn_subtitleInput, msfn_dragOverlay, msfn_subtitles, msfn_status);
    /*
     var dragTimer;
     $(document).on('dragover', function (e) {
     msfn_subtitleInput.offset({
     top: e.originalEvent.pageY - 5,
     left: e.originalEvent.pageX - 15
     });
     e.stopPropagation();
     e.preventDefault();
     var dt = e.originalEvent.dataTransfer;
     if (dt.types !== null && (dt.types.indexOf ? dt.types.indexOf('Files') !== -1 : dt.types.contains('application/x-moz-file'))) {
     $("#dndOver").show();
     $("#subInput").show();
     window.clearTimeout(dragTimer);
     }
     });
     //hide when file drag exits
     $(document).on('dragleave drop', function (e) {
     dragTimer = window.setTimeout(function () {
     $("#dndOver").hide();
     $("#subInput").hide();
     }, 100);
     });
     */
    videoLoadTest();
    controlsLoadTest();
}
);
