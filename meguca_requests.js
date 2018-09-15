// ==UserScript==
// @name         Meguca Request Window
// @namespace    KethRequest
// @version      0.4
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
        reqbottom = document.createElement("div"),
        reqtable = document.createElement("table"),
        rtheadtable = document.createElement("table"),
        magich,
        magicw,
        lastIndex = 1,
        editPosts = [],
        postsRoot = document.getElementById("thread-container"),
        reqRE = new RegExp('/r/(.*)', 'i'),
        redditRE = new RegExp('reddit.com', 'i');

    function init()
    {
        createReqWindow();
        registerEventHandlers();
        createStyles();
        createOptionTab();
    }

    function createStyles()
    {
        let css = document.createElement("style"),
            height = window.innerHeight / 2,
            left = window.innerWidth - 425;

        css.type = "text/css";
        css.innerHTML = "#reqdiv { position: fixed; height: " + height + "px; width: 400px; border: 1px solid grey; background-color: inherit; top: 125px; left: " + left + "px; }\n" +
            "#reqhead { height: 15px; background-color: grey; padding: 2px; cursor: move; text-align: center; }\n" +
            "#reqbody { padding: 2px; overflow: auto; }\n" +
            "#closeBtn { float: right; font-weight: bold; }\n" +
            ".reqBtn { height: 15px; background-color: darkgrey; border: none; cursor: pointer; }\n" +
            "#reqbottom { height: 4px; cursor: ns-resize; }\n" +
            "#reqtable { width: 100%; table-layout: fixed; }\n" +
            ".cbhead { width: 10%; }\n" +
            ".cbcell { width: 10%; text-align: center; }\n" +
            "#rtext { width: 80%; }\n" +
            "#rthead { width: 100%; }";

        document.head.appendChild(css);
    }

    function createReqWindow()
    {
        reqdiv.id = "reqdiv";
        reqhead.id = "reqhead";
        reqbottom.id = "reqbottom";
        reqtable.id = "reqtable";
        reqbody.id = "reqbody";
        rtheadtable.id = "rthead";

        closeBtn.innerText = "X";
        closeBtn.id = "closeBtn";
        closeBtn.classList.add("reqBtn");

        let rthead = document.createElement("tr"),
            th1 = document.createElement("th"),
            th2 = document.createElement("th"),
            th3 = document.createElement("th");


        th3.id = "rtext";
        th1.classList.add("cbhead");
        th2.classList.add("cbhead");

        th1.innerText = "Q'd";
        th2.innerText = "Skip";
        th3.innerText = "Request";

        rthead.append(th1);
        rthead.append(th2);
        rthead.append(th3);
        rtheadtable.append(rthead);

        reqhead.append("Requests");
        reqhead.append(closeBtn);
        reqbody.append(reqtable);
        reqdiv.append(reqhead);
        reqdiv.append(rtheadtable);
        reqdiv.append(reqbody);
        reqdiv.append(reqbottom);

        hideRequestsWindow();

        body.append(reqdiv);
    }

    function createOptionTab()
    {
        let opts = document.getElementById("options"),
            tabButts = opts.getElementsByClassName("tab-butts")[0],
            tabCont = opts.getElementsByClassName("tab-cont")[0];

        let reqButt = document.createElement("a");
        reqButt.classList.add("tab-link");
        reqButt.dataset.id = tabButts.childElementCount;
        reqButt.innerText = "Requests";

        let reqCont = document.createElement("div");
        reqCont.dataset.id = tabButts.childElementCount;

        let reqa = document.createElement("a");
        reqa.innerText = "Show Requests Window";
        reqa.addEventListener("click", showRequestsWindow);

        let reseta = document.createElement("a");
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
        html.addEventListener("mousemove", mouseMoveHandler);

        reqbottom.addEventListener("mousedown", reqbottomMouseDown);

        window.addEventListener("resize", resizeHandler);
        closeBtn.addEventListener("click", hideRequestsWindow);
    }

    function reqbottomMouseDown(e)
    {
        e.preventDefault();
        reqbottom.classList.add("drag");
    }

    function reqheadMouseDown(e)
    {
        e.preventDefault();
        reqhead.classList.add("drag");
        magicw = e.screenX - reqdiv.offsetLeft;
        magich = e.screenY - reqdiv.offsetTop;
    }

    function windowMouseUp(e)
    {
        reqhead.classList.remove("drag");
        reqbottom.classList.remove("drag");
    }

    function resizeReqWindowHeight(e)
    {
        e.preventDefault();
        let reqheadH = reqhead.offsetHeight,
            reqbotH = reqbottom.offsetHeight,
            reqtbheadH = rtheadtable.offsetHeight,
            reqTop = reqdiv.offsetTop,
            mouseY = e.clientY,
            newH = mouseY - reqTop;

        newH = newH < 100 ? 100 : newH;
        reqdiv.style.height = newH + "px";
        reqbody.style.height = (newH - reqheadH - reqbotH - reqtbheadH) + "px";
    }

    function moveRequestWindow(e)
    {
        e.preventDefault();
        let w = e.screenX - magicw,
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

    function mouseMoveHandler(e)
    {
        if (reqhead.classList.contains("drag"))
        {
            moveRequestWindow(e);
        }
        else if (reqbottom.classList.contains("drag"))
        {
            resizeReqWindowHeight(e);
        }
    }

    function resizeHandler(e)
    {
        if (reqdiv.offsetLeft + reqdiv.offsetWidth > window.innerWidth)
            reqdiv.style.left = window.innerWidth - reqdiv.offsetWidth + "px";
        if (reqdiv.offsetTop + reqdiv.offsetHeight > window.innerHeight)
            reqdiv.style.top = window.innerHeight - reqdiv.offsetHeight + "px";
    }

    function showRequestsWindow()
    {
        let topH = 0,
            rtheadH = 0,
            reqbodyH = 0,
            reqdH = 0;

        reqdiv.style.display = "block";

        topH = reqhead.offsetHeight + 6;
        rtheadH = rtheadtable.offsetHeight;
        reqdH = reqdiv.offsetHeight;
        reqbodyH = reqdH - topH - rtheadH;
        reqbody.style.height = reqbodyH + "px";

        refreshRequestList();
        createObserver();
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
        let posts = postsRoot.children,
            i = 0;

        for ( ; i < editPosts.length; i++)
        {
            let post = posts[editPosts[i]];
            if (!post.classList.contains("editing"))
            {
                editPosts.splice(i, 1);
                checkForRequest(post);
            }
        }

        i = lastIndex;

        while (i < posts.length)
        {
            // Store currently edited posts in an array to check again next update
            let post = posts[i];
            if (post.classList.contains("editing"))
                editPosts.push(i);

            checkForRequest(post);

            i++;
        }

        lastIndex = i;
    }

    function checkForRequest(post)
    {
        let bquote = post.getElementsByTagName("blockquote")[0],
            postText = null,
            lines = null;

        if (!bquote)
            return;

        postText = bquote.innerText;
        lines = postText.split('\n');

        for (let j = 0; j < lines.length; j++)
        {
            let match = lines[j].match(reqRE);

            if(match && lines[j].search(redditRE) < 0)
                addRequest(match[1].trim(), post.id);
        }
    }

    function addRequest(text, postid)
    {
        let row = document.createElement("tr"),
            qcell = document.createElement("td"),
            nocell = document.createElement("td"),
            reqcell = document.createElement("td"),
            req = document.createElement("a");

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

    function createObserver()
    {
        let obsConfig = {
            attributeFilter: ["class"],
            attributes: true,
            subtree: true,
            attributeOldValue: true },
            observer = null;

        observer = new MutationObserver(observerCallback);
        observer.observe(postsRoot, obsConfig);
    }

    function observerCallback(mutationsList, observer)
    {
        for (let i = 0; i < mutationsList.length; i++)
        {
            let mut = mutationsList[i],
                target = mut.target;

            if (target.localName == "article"
                && mut.oldValue.includes("editing")
                && !mut.oldValue.includes("reply-form")
                && !target.classList.contains("editing"))
            {
                checkForRequest(target);
            }
        }
    }

    init();

})();