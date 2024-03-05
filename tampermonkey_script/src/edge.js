import React from "react";
import ReactDOM from "react-dom";
import "./edge.less";

export default class EdgeLoader {
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
        const app = ReactDOM.render(<Edge />, newblock);
        const post_url = `http://localhost:${port}/search?q=${query}`;
        // GET http://localhost:51361/search?q=your%20query
        fetch(post_url)
            .then((res) => res.json())
            .then((data) => {
                app.switch(data);
            });
    }
}
class Edge extends React.Component {
    constructor(props) {
        super(props);
        this.state = { state: "loading", data: null };
    }
    switch(data) {
        this.setState({ state: "loded", data });
    }
    render() {
        let child;
        switch (this.state.state) {
            case "loded":
                let list =
                    this.state.data.length == 0 ? (
                        <Entry flag={"无结果"} />
                    ) : (
                        this.state.data.map((p) => <Entry data={p} name={p.basename} />)
                    );
                child = list;
                break;
            case "loading":
                child = <Entry flag={"加载中"} />;
                break;
        }
        return (
            <div className="Ba richrswrapper">
                <div className="richrsrailtitle">
                    <h2>Ob</h2>
                </div>
                <div className="richrsrailcontent">{child}</div>
            </div>
        );
    }
}

class Entry extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.flag) {
            return <div className="richrsrailsuggestion">{this.props.flag}</div>;
        } else {
            this.handleClick = this.handleClick.bind(this);
            let title = highlighter(this.props.name, this.props.data.foundWords);
            return (
                <div className="richrsrailsuggestion" onClick={this.handleClick}>
                    <div className="ba-box">
                        <div
                            className="ba-header"
                            dangerouslySetInnerHTML={{
                                __html: title,
                            }}
                        ></div>
                        <Content data={this.props.data} />
                    </div>
                </div>
            );
        }
    }
    handleClick() {
        window.open(
            `obsidian://open?vault=${this.props.data.vault}&file=${encodeURI(this.props.name)}`
        );
    }
}

class Content extends React.Component {
    render() {
        let content = highlighter(this.props.data.excerpt, this.props.data.foundWords);
        return (
            <div
                className="ba-content"
                dangerouslySetInnerHTML={{
                    __html: content,
                }}
            ></div>
        );
    }
}

function highlighter(excerpt, foundWords) {
    for (const i of foundWords) {
        let r = new RegExp(
            `${i.replace(/([\^\$\.\*\+\?\|\\\/\(\)\[\]\{\}\,])/g, (j) => "\\" + j)}`,
            "gi"
        );
        excerpt = excerpt.replace(r, (p) => `<strong>${p}</strong>`);
    }
    return excerpt;
}
