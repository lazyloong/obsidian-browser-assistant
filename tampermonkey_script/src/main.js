import React from "react";
import ReactDOM from "react-dom";
import App from "./app";

GM_registerMenuCommand("切换端口", function () {
    let port = GM_getValue("ba_port");
    if (!port) {
        port = 27125;
    }
    port = window.prompt("设置可用端口", port);
    GM_setValue("ba_port", port);
});

const url = window.location.href;
const regex = new RegExp(
    "https:\\/\\/cn\\.bing\\.com\\/search\\?q=([^&]*)(&.*)?"
);
let query = regex.exec(url)[1];
console.log(GM_getValue("ba_port"));
let post_url = "http://127.0.0.1:" + GM_getValue("ba_port") ?? "27125";

let target_block = document
    .querySelector("div#b_content")
    .querySelector('[aria-label="更多结果"]')
    .querySelector("ol");
let n = document.createElement("div");
target_block.insertBefore(n, target_block.firstChild);

let httpRequest = new XMLHttpRequest();
httpRequest.open("POST", post_url, true);
httpRequest.send(JSON.stringify({ query: query }));
httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        let json = httpRequest.responseText,
            data = JSON.parse(json);
        ReactDOM.render(<App data={data} />, n);
    }
};
