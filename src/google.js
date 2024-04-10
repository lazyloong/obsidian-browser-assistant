import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

export default class GoogleLoader {
    regex = /https?:\/\/www\.google\.com(?:\.hk)?\/search\?q=([^&]*)/;
    test(url) {
        return this.regex.test(url);
    }
    load(url, port) {
        let query = this.regex.exec(url)[1];
        let rcnt = document.querySelector("div#rcnt");
        let target_block = rcnt.querySelector("#rhs");
        if (!target_block) {
            target_block = document.createElement("div");
            target_block.id = "rhs";
            rcnt.appendChild(target_block);
        }

        let newblock = document.createElement("div");
        target_block.insertBefore(newblock, target_block.firstChild);
        const app = ReactDOM.render(<App />, newblock);
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
