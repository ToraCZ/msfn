function restore() {
    chrome.storage.sync.get(["encoding", "fColor", "fSize", "sColor", "sSize", "fontFam"], function (items) {
        $("input[name='encoding'][value='" + items.encoding + "']").click();
        $("#fColor").val(items.fColor);
        $("#fSize").val(items.fSize);
        $("#sColor").val(items.sColor);
        $("#sSize").val(items.sSize);
        //if font is set to custom
        if ($("#fontFam>option[value='" + items.fontFam + "']").length == 0) {
            $("#fontFam>option:last-child").attr("selected", "selected").val(items.fontFam);
            $("#fontFam").hide();
            $("#custFont>input").val(items.fontFam);
            $("#custFont").show();

        } else {
            $("#fontFam>option[value='" + items.fontFam + "']").attr("selected", "selected");
        }
    });
    setTimeout(function () {
        $("input").change();
        $("select").change();
    }, 10);
};

function save() {
    chrome.storage.sync.set({
        encoding: $("input[name='encoding']:checked").val(),
        fColor: $("#fColor").val(),
        fSize: $("#fSize").val(),
        sColor: $("#sColor").val(),
        sSize: $("#sSize").val(),
        fontFam: $("#fontFam>option:checked").val()
    });
}
$(document).ready(function () {
    //restore saved
    restore();
    //adjust example test 
    $("#fColor").change(function () {
        $("#example").css("color", $("#fColor").val());
    });
    $("#fSize").change(function () {
        $("#example").css("font-size", $("#fSize").val() + "px");
    });
    $("#sColor").change(function () {
        $("#example").css("text-shadow", "0px 0px " + $("#sSize").val() + "px " + $("#sColor").val());
    });
    $("#sSize").change(function () {
        $("#example").css("text-shadow", "0px 0px " + $("#sSize").val() + "px " + $("#sColor").val());
    });
    $("#fontFam").change(function () {
        $("#example").css("font-family", $("#fontFam>option:checked").val());
    });
    //adjust value according to custom font
    $("#custFont>input").change(function () {
        $("#fontFam>option:checked").val($(this).val());
        $("#example").css("font-family", $("#fontFam>option:checked").val());
    });
    //restore defaults button
    $("#save>button:nth-of-type(1)").click(function () {
        $("#custFont>button").click();
        chrome.storage.sync.set({
            encoding: 'UTF8',
            fColor: "#ffffff",
            fSize: "42",
            sColor: "#000000",
            sSize: "10",
            fontFam: "monospace"
        });
        restore();
        $("#save>span").html("Default settings restored!");
        $("#save>span").fadeIn(200, function () {
            $("#save>span").fadeOut(3000, function () {
                $("#save>span").html("");
            });
        });
    });
    //save button
    $("#save>button:nth-of-type(2)").click(function () {
        save();
        $("#save>span").html("Settings saved!");
        $("#save>span").fadeIn(200, function () {
            $("#save>span").fadeOut(3000, function () {
                $("#save>span").html("");
            });
        });
    });
    //select custom font
    $("#fontFam").change(function () {
        if (this.selectedIndex == this.options.length - 1) {
            $("#fontFam").slideUp("fast", function () {
                $("#custFont").slideDown("fast");
            });
        } else {
            $("#custFont").slideUp("fast", function () {
                $("#fontFam").slideDown("fast");
            });
        }
    });
    //cancel cust font button
    $("#custFont>button").click(function () {
        $("#fontFam")[0].selectedIndex = 0;
        $("#fontFam").change();
        $("#custFont>input").val("");
    });
});
