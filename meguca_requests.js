// ==UserScript==
// @name         Meguca Request Window
// @namespace    KethRequest
// @version      0.1
// @description  Show all requests that start with /r/
// @author       Kethsar
// @match        https://meguca.org/a/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var body = document.getElementsByTagName("body")[0],
        html = document.getElementsByTagName("html")[0],
        reqdiv = document.createElement("div"),
        reqhead = document.createElement("div"),
        reqbody = document.createElement("div"),
        closeBtn = document.createElement("button"),
        refreshBtn = document.createElement("button"),
        reqbottom = document.createElement("div"),
        reqtable = document.createElement("table"),
        magich,
        magicw,
        lastIndex = 1;

    function init()
    {
        createReqWindow();
        registerEventHandlers();
        createStyles();
        createOptionTab();
    }

    function createStyles()
    {
        var css = document.createElement("style");
        var height = window.innerHeight / 2;
        var left = window.innerWidth - 425;

        css.type = "text/css";
        css.innerHTML = "#reqdiv { position: fixed; height: " + height + "px; width: 400px; border: 1px solid grey; background-color: inherit; top: 125px; left: " + left + "px; }\n" +
            "#reqhead { height: 15px; background-color: grey; padding: 2px; cursor: move; text-align: center; }\n" +
            "#reqbody { padding: 2px; height: " + (height - 25) + "px; overflow: auto; }\n" +
            "#closeBtn { float: right; font-weight: bold; }\n" +
            "#refreshBtn { float: left; }\n" +
            ".reqBtn { height: 15px; background-color: darkgrey; border: none; cursor: pointer; }\n" +
            "#reqbottom { height: 4px; cursor: ns-resize; }\n" +
            "#reqtable { width: 100%; }\n" +
            ".cbhead { width: 10%; }\n" +
            ".cbcell { width: 10%; text-align: center; }\n" +
            "#rtext { wdith: 80%; }\n" +
            "#rthead { height: 5%; }";

        document.head.appendChild(css);
    }

    function createReqWindow()
    {
        reqdiv.id = "reqdiv";
        reqhead.id = "reqhead";
        reqbottom.id = "reqbottom";
        reqtable.id = "reqtable";
        reqbody.id = "reqbody";

        closeBtn.innerText = "X";
        closeBtn.id = "closeBtn";
        closeBtn.classList.add("reqBtn");

        refreshBtn.innerText = "Refresh";
        refreshBtn.title = "Grab requests from posts made after the last refresh";
        refreshBtn.id = "refreshBtn";
        refreshBtn.classList.add("reqBtn");

        var rthead = document.createElement("tr");
        var th1 = document.createElement("th");
        var th2 = document.createElement("th");
        var th3 = document.createElement("th");

        rthead.id = "rthead";
        th3.id = "rtext";
        th1.classList.add("cbhead");
        th2.classList.add("cbhead");

        th1.innerText = "Q'd";
        th2.innerText = "No";
        th3.innerText = "Request";

        rthead.append(th1);
        rthead.append(th2);
        rthead.append(th3);
        reqtable.append(rthead);

        reqhead.append(refreshBtn);
        reqhead.append("Requests");
        reqhead.append(closeBtn);
        reqbody.append(reqtable);
        reqdiv.append(reqhead);
        reqdiv.append(reqbody);
        reqdiv.append(reqbottom);

        hideRequestsWindow();

        body.append(reqdiv);
    }

    function createOptionTab()
    {
        var opts = document.getElementById("options");
        var tabButts = options.getElementsByClassName("tab-butts")[0];
        var tabCont = options.getElementsByClassName("tab-cont")[0];

        var reqButt = document.createElement("a");
        reqButt.classList.add("tab-link");
        reqButt.dataset.id = tabButts.childElementCount;
        reqButt.innerText = "Requests";

        var reqCont = document.createElement("div");
        reqCont.dataset.id = tabButts.childElementCount;

        var reqa = document.createElement("a");
        reqa.innerText = "Show Requests Window";
        reqa.addEventListener("click", showRequestsWindow);

        reqCont.append(reqa);
        tabCont.append(reqCont);
        tabButts.append(reqButt);
    }

    function registerEventHandlers()
    {
        reqhead.addEventListener("mousedown", reqheadMouseDown);
        window.addEventListener("mouseup", windowMouseUp);
        html.addEventListener("mousemove", htmlMouseMove);
        refreshBtn.addEventListener("click", refreshRequestList);
        closeBtn.addEventListener("click", hideRequestsWindow);
    }

    function reqheadMouseDown(e)
    {
        reqhead.classList.add("drag");
        magicw = e.screenX - reqdiv.getBoundingClientRect().x;
        magich = e.screenY - reqdiv.getBoundingClientRect().y;
        body.style.userSelect = "none";
    }

    function windowMouseUp(e)
    {
        reqhead.classList.remove("drag");
        body.style.userSelect = "";
    }

    function htmlMouseMove(e)
    {
        if(reqhead.classList.contains("drag"))
        {
            var w = e.screenX - magicw,
                h = e.screenY - magich,
                reqw = window.innerWidth - reqdiv.offsetWidth,
                reqh = window.innerHeight - reqdiv.offsetHeight;

            if (h > 0)
                reqdiv.style.top = h + "px";
            else
                reqdiv.style.top = "0px";

            if (w > 0)
                reqdiv.style.left = w + "px";
            else
                reqdiv.style.left = "0px";

            if (w > reqw)
                reqdiv.style.left = reqw + "px";
            if (h > reqh)
                reqdiv.style.top = reqh + "px";
        }
    }

    function showRequestsWindow()
    {
        reqdiv.style.display = "block";
    }

    function hideRequestsWindow()
    {
        reqdiv.style.display = "none";
    }

    function refreshRequestList()
    {
        var posts = document.getElementsByTagName("article");
        var re = new RegExp('/r/(.*)', 'i');
        var i = lastIndex;

        while (i < posts.length)
        {
            var postText = posts[i].getElementsByTagName("blockquote")[0].innerText;
            var lines = postText.split('\n');

            for (var j = 0; j < lines.length; j++)
            {
                var match = lines[j].match(re);

                if(match)
                    addRequest(match[1].trim(), posts[i].id);
            }

            i++;
        }

        lastIndex = i;
    }

    function addRequest(text, postid)
    {
        var row = document.createElement("tr");
        var qcell = document.createElement("td");
        var nocell = document.createElement("td");
        var reqcell = document.createElement("td");
        var req = document.createElement("a");

        if(!text)
            text = "[empty, check post]";

        qcell.innerHTML = '<input type="checkbox">';
        qcell.classList.add("cbcell");

        nocell.innerHTML = '<input type="checkbox">';
        nocell.classList.add("cbcell");

        req.href = "#" + postid;
        req.innerText = text;

        reqcell.append(req);
        row.append(qcell);
        row.append(nocell);
        row.append(reqcell);
        reqtable.append(row);
    }

    init();

})();