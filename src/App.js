import React from "react";
import "./app.less";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { status: "loading", data: null };
    }
    switch(data) {
        this.setState({ status: "loaded", data });
    }
    setStatus(status) {
        this.setState({ status });
    }
    render() {
        let child;
        switch (this.state.status) {
            case "loaded":
                child =
                    this.state.data.length == 0 ? (
                        <Entry flag={"无结果"} />
                    ) : (
                        this.state.data.map((p, i) => <Entry data={p} name={p.basename} key={i} />)
                    );
                break;
            case "loading":
                child = <Entry flag={"加载中"} />;
                break;
            case "error":
                child = <Entry flag={"加载失败"} />;
                break;
        }
        let className =
            "obsidian-results" + (this.props.className ? " " + this.props.className : "");
        return (
            <div className={className}>
                <div className="title">Obsidian</div>
                <div className="content">{child}</div>
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
            return (
                <div className="suggestion">
                    <div className="box">{this.props.flag}</div>
                </div>
            );
        } else {
            this.handleClick = this.handleClick.bind(this);
            let title = highlighter(this.props.name, this.props.data.foundWords);
            return (
                <div className="suggestion" onClick={this.handleClick}>
                    <div className="box">
                        <div
                            className="header"
                            dangerouslySetInnerHTML={{
                                __html: title,
                            }}
                        ></div>
                        <div
                            className="content"
                            dangerouslySetInnerHTML={{
                                __html: highlighter(
                                    this.props.data.excerpt,
                                    this.props.data.foundWords
                                ),
                            }}
                        ></div>
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
