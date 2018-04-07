// ==UserScript==
// @name         Meguca Request Window
// @namespace    KethRequest
// @version      0.2
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
            "#reqtable { width: 100%; table-layout: fixed; }\n" +
            ".cbhead { width: 10%; }\n" +
            ".cbcell { width: 10%; text-align: center; }\n" +
            "#rtext { width: 80%; }\n" +
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

        var reseta = document.createElement("a");
        reseta.innerText = "Reset Window Position";
        reseta.addEventListener("click", resetWindowPosition);

        reqCont.append(reqa);
        reqCont.append(document.createElement("br"));
        reqCont.append(reseta);
        tabCont.append(reqCont);
        tabButts.append(reqButt);
    }

    function registerEventHandlers()
    {
        reqhead.addEventListener("mousedown", reqheadMouseDown);
        window.addEventListener("mouseup", windowMouseUp);
        html.addEventListener("mousemove", moveRequestWindow);
        window.addEventListener("resize", moveRequestWindow);
        refreshBtn.addEventListener("click", refreshRequestList);
        closeBtn.addEventListener("click", hideRequestsWindow);
    }

    function reqheadMouseDown(e)
    {
        e.preventDefault();
        reqhead.classList.add("drag");
        magicw = e.screenX - reqdiv.getBoundingClientRect().x;
        magich = e.screenY - reqdiv.getBoundingClientRect().y;
    }

    function windowMouseUp(e)
    {
        reqhead.classList.remove("drag");
    }

    function moveRequestWindow(e)
    {
        if (e.type == "mousemove" && reqhead.classList.contains("drag"))
        {
            e.preventDefault();
            var w = e.screenX - magicw,
                h = e.screenY - magich,
                reqw = window.innerWidth - reqdiv.offsetWidth,
                reqh = window.innerHeight - reqdiv.offsetHeight;

            if (h > reqh)
                reqdiv.style.top = reqh + "px";
            else if (h > 0)
                reqdiv.style.top = h + "px";
            else
                reqdiv.style.top = "0px";

            if (w > reqw)
                reqdiv.style.left = reqw + "px";
            else if (w > 0)
                reqdiv.style.left = w + "px";
            else
                reqdiv.style.left = "0px";
        }
        else if(e.type == "resize")
        {
            if (reqdiv.getBoundingClientRect().x + reqdiv.offsetWidth > window.innerWidth)
                reqdiv.style.left = window.innerWidth - reqdiv.offsetWidth + "px";
            if (reqdiv.getBoundingClientRect().y + reqdiv.offsetHeight > window.innerHeight)
                reqdiv.style.top = window.innerHeight - reqdiv.offsetHeight + "px";
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

    function resetWindowPosition()
    {
        reqdiv.style.top = "";
        reqdiv.style.left = "";
    }

    function refreshRequestList()
    {
        var posts = document.getElementsByTagName("article");
        var reqRE = new RegExp('/r/(.*)', 'i');
        var redditRE = new RegExp('reddit.com', 'i');
        var i = lastIndex;

        while (i < posts.length)
        {
            // Don't go past incomplete posts as they might be in the middle of making a request
            if (posts[i].classList.contains("editing"))
            {
                lastIndex = i;
                break;
            }

            var postText = posts[i].getElementsByTagName("blockquote")[0].innerText;
            var lines = postText.split('\n');

            for (var j = 0; j < lines.length; j++)
            {
                var match = lines[j].match(reqRE);

                if(match && lines[j].search(redditRE) < 0)
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