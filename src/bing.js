import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

export default class BingLoader {
    regex = /https?:\/\/(?:www|cn)\.bing\.com\/search\?q=([^&]*)/;
    test(url) {
        return this.regex.test(url);
    }
    load(url, port) {
        let query = this.regex.exec(url)[1];
        let target_block = document
            .querySelector("div#b_content")
            .querySelector('[aria-label="更多结果"]')
            .querySelector("ol");
        let newblock = document.createElement("li");
        newblock.className = "b_ans";
        target_block.insertBefore(newblock, target_block.firstChild);
        const app = ReactDOM.render(<App className="bing" />, newblock);
        const post_url = `http://localhost:${port}/search?q=${query}`;
        // GET http://localhost:51361/search?q=your%20query
        fetch(post_url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((data) => {
                app.switch(data);
            })
            .catch(() => {
                app.setStatus("error");
            });
    }
}
