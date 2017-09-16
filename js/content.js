 //encoding variable
 var encoding = "UTF8";
 //subtitle filename
 var subName = "";
 //message listener
 window.addEventListener("message", function (event) {
     if (event.data.type) {
         if (event.data.type == "postVars") {
             $("#subs").css({
                 "color": event.data.fColor,
                 "font-size": event.data.fSize,
                 "font-family": event.data.fontFam,
                 "shadow": "0px 0px " + event.data.sSize + " " + event.data.sColor
             });
             encoding = event.data.encoding;
         }
     }
 }, false);
 //timing vars
 var delay = 0.000;
 var curTime = 0;
 // subtitle arrray 
 var subtitles = [];
 subtitles.push({
     beginTime: 0,
     endTime: 0,
     text: ""
 });

 var currentIndex = 0;
 // -------------------------------------------------------------------------------------------------------------

 //change status msg
 function statMsg(msg) {
     $("#status").html(msg);
     $("#status").stop();
     $("#status").fadeTo(200, 0.8, function () {
         $("#status").fadeOut(3000, function () {
             $("#status").html("");
         });
     });
 }
 // find current subtitle
 function findCurrentIndex() {
     for (var i = subtitles.length - 1; i > 0; i--) {
         if (subtitles[i].beginTime < curTime) {
             currentIndex = i;
             return
         }
     }
 }
 // parse subtitles to variable
 function parseSubtitles() {
     var subInput = $("#subInput")[0].files[0];
     subName = subInput.name;
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
                 if (!isNaN(parseInt(line)) && line.indexOf("-->") == -1) {
                     count = parseInt(subtitleText[subtitleText.length - i]);
                 }
                 i++;
             } while (count === undefined);
             //load subitles into array
             i = 0;
             var subIndex = 1;
             while (i < subtitleText.length - 1) {
                 //prepare subtitle object
                 var subtitle = {
                     beginTime: 0,
                     endTime: 0,
                     text: ""
                 };
                 // parse subtitle
                 //skip empty lines (mostly at the end)             
                 while (subtitleText[i].trim() == "") {
                     i++;
                     if (i == subtitleText.length - 1) {
                         var breakCond = true;
                     }
                     //  continue;
                 }
                 if (breakCond !== undefined) {
                     break;
                 }
                 // skip line numbers
                 i++;
                 //check for integer that isnt timing
                 /*
                 if (!isNaN(parseInt(subtitleText[i])) && subtitleText.indexOf("-->") == -1) {
                     i++;
                     continue
                 }
                 */
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
                 while (subtitleText[i].trim() != "") {
                     text = text + "<br>" + subtitleText[i].trim();
                     i++;
                 }
                 subtitle.text = text;
                 //insert into array
                 subtitles.push(subtitle);
                 i++;
             }
             curTime = $("video")[0].currentTime + delay;
             findCurrentIndex();
             //adjust sub choices
             $("ol.player-timed-text-tracks>li:contains(Off)").click()
             setTimeout(function () {
                 $("ol.player-timed-text-tracks>li:contains(Off)").removeClass("player-track-selected");
             }, 100);
             $("#custBtn").addClass("player-track-selected");
             if (subName.length > 12) {
                 $("#custBtn").html(subName.substr(0, 12) + "...");
             } else {
                 $("#custBtn").html(subName);
             }

             //show subs
             $("#subs").show();
             //erase input file
             $("#subInput").val("");
             //add listener to other buttons
             $("ol.player-timed-text-tracks>li:not(#custBtn)").click(function () {
                 //reset custBtn
                 $("#custBtn").removeClass("player-track-selected");
                 $("#custBtn").html("Custom");
                 //add selector to this
                 $(this).addClass("player-track-selected");
                 //remove subs
                 $("#subs").hide();
                 var subtitles = [];
                 subtitles.push({
                     beginTime: 0,
                     endTime: 0,
                     text: ""
                 });
             });
             statMsg("Subtitles loaded: " + subName);
         })
         // read the subtitles
     reader.readAsText(subInput, encoding);


 }

 // -------------------------------------------------------------------------------------------------------------
 // test for succesful load of netflix player controls
 function controlsTest() {
     //if controls arent loaded, try again
     if ($(".player-timed-text-tracks").length == 0) {
         setTimeout(function () {
             controlsTest();
         }, 1000);
     }
     // else add injected content
     else {
         //input for subs file
         $("#netflix-player").prepend($('<input type="file" id="subInput" name="subtitles" accept=".srt">')
             //TODO eventlistener parse subs when changed
             .change(function () {
                 parseSubtitles();
             }) //.hide()
         );
         //overlay for drag and drop
         $("#netflix-player").prepend($('<div id="dndOver"></div>').append("<span>Drop subtitles here</span>"));
         //show overlay when file is dragged
         var dragTimer;
         $(document).on('dragover', function (e) {
             $("#subInput").offset({
                 top: e.originalEvent.pageY - 5,
                 left: e.originalEvent.pageX - 15
             });
             e.stopPropagation();
             e.preventDefault();
             var dt = e.originalEvent.dataTransfer;
             if (dt.types != null && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('application/x-moz-file'))) {
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
         //subs placeholder
         $("#netflix-player").prepend('<div id="subs"></div>');
         //restore font settings
         window.postMessage({
             type: "getVars"
         }, "*");
         //status placeholder
         $("#netflix-player").append('<div id="status"></div>');
         //button for custom subs
         $(".player-timed-text-tracks>lh").after(
             $('<li id="custBtn">Custom</li>')
             //listener for clicking on custom
             .click(function () {
                 $("#subInput").click();
             }));
         //hide subs when official are turned on
         $("ol.player-timed-text-tracks>li:not(#custBtn)").click(function () {
             //reset custBtn
             $("#custBtn").removeClass("player-track-selected");
             $("#custBtn").html("Custom");
             //add selector to this
             $(this).addClass("player-track-selected");
             //remove subs
             $("#subs").hide();
             var subtitles = [];
             subtitles.push({
                 beginTime: 0,
                 endTime: 0,
                 text: ""
             });
             //add this listener again
             $("ol.player-timed-text-tracks>li:not(#custBtn)").click(function () {
                 //reset custBtn
                 $("#custBtn").removeClass("player-track-selected");
                 $("#custBtn").html("Custom");
                 //add selector to this
                 $(this).addClass("player-track-selected");
                 //remove subs
                 $("#subs").hide();
                 var subtitles = [];
                 subtitles.push({
                     beginTime: 0,
                     endTime: 0,
                     text: ""
                 });
             });
         });
         //display subtitles on video timeupdate
         $("video").on("timeupdate", function () {
             curTime = $("video")[0].currentTime + delay
             if (subtitles.length > 1) {
                 if (curTime < subtitles[currentIndex].endTime) {
                     $("#subs").html(subtitles[currentIndex].text);
                     //adjust y-position
                     if ($(".player-controls-wrapper.display-none").length > 0) {
                         $("#subs").css("bottom", "2%");
                     } else {
                         $("#subs").css("bottom", "17%");
                     }
                 } else {
                     if (curTime > subtitles[currentIndex].endTime) {
                         $("#subs").html(" ");
                         if (curTime > subtitles[currentIndex + 1].beginTime) {
                             currentIndex++;
                         }
                     }
                 }
             }
         }).on("seeked", function () {
             curTime = $("video")[0].currentTime + delay
             findCurrentIndex();
         });
         //keyboard shortcuts
         $(document).keydown(function (e) {
             switch (e.which) {
                 case 34: // PgDn
                     if (e.altKey) {
                         delay -= 0.100;
                         statMsg("Delay: " + delay.toFixed(1) + "ms");
                         findCurrentIndex();
                         $("video").trigger("timeupdate");

                     } else if (e.shiftKey) {
                         $("#subs").css("font-size", (parseInt($("#subs").css("font-size")) - 6) + "px");
                         window.postMessage({
                             type: "setVars",
                             fSize: parseInt($("#subs").css("font-size"))
                         }, "*");
                     }
                     break;

                 case 33: // PgUp key
                     if (e.altKey) {
                         delay += 0.100;
                         statMsg("Delay: " + delay.toFixed(1) + "ms");
                         findCurrentIndex();
                         $("video").trigger("timeupdate");
                     } else if (e.shiftKey) {
                         $("#subs").css("font-size", (parseInt($("#subs").css("font-size")) + 6) + "px");
                         window.postMessage({
                             type: "setVars",
                             fSize: parseInt($("#subs").css("font-size"))
                         }, "*");
                     }
                     break;
                 case 76:
                     if (e.altKey) {
                         $("#subInput").click();
                     }
                 default:
                     return;
             }

         });
         // -------------------------------------------------------------------------------------------------------------
         /*
         //TEST savefile
         // request filesystem
         window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
         window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
             console.log('Opened fs ' + fs.name);
             //create new file
             fs.root.getFile("subs.srt", {
                 create: true,
                 // exclusive: true
             }, function (fileEntry) {
                 fileEntry.createWriter(function (fileWriter) {
                     var name = new Blob([$(".player-status-main-title").html()], {
                         type: "text/plain"
                     });
                     fileWriter.write(name);
                     console.log(fileEntry.toURL());
                 }, errorHandler);
             }, errorHandler);
         });
         */

     }
 }
 // initalization
 $(document).ready(function () {
     controlsTest();
 });

 function errorHandler(e) {
     console.log('Error: ' + e.name);
 }
