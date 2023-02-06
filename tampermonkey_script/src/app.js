import React from "react";
import "./app.less";
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { state: "loading" };
    }
    switch(data) {
        this.props.data = data;
        this.setState({ state: "loded" });
    }
    render() {
        switch (this.state.state) {
            case "loded":
                let list =
                    this.props.data.length == 0 ? (
                        <Entry flag={"无结果"} />
                    ) : (
                        this.props.data.map((p) => (
                            <Entry data={p} name={p.basename} />
                        ))
                    );
                return (
                    <div className="Ba richrswrapper">
                        <div className="richrsrailtitle">
                            <h2>Ob</h2>
                        </div>
                        <div className="richrsrailcontent">{list}</div>
                    </div>
                );
            case "loading":
                return (
                    <div className="Ba richrswrapper">
                        <div className="richrsrailtitle">
                            <h2>Ob</h2>
                        </div>
                        <div className="richrsrailcontent">
                            <Entry flag={"加载中"} />
                        </div>
                    </div>
                );
        }
    }
}

class Entry extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.flag) {
            return (
                <div className="richrsrailsuggestion">{this.props.flag}</div>
            );
        } else {
            this.handleClick = this.handleClick.bind(this);
            let title = highlighter(
                this.props.name,
                this.props.data.foundWords
            );
            return (
                <div
                    className="richrsrailsuggestion"
                    onClick={this.handleClick}
                >
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
            `obsidian://open?vault=${this.props.data.vault}&file=${encodeURI(
                this.props.name
            )}`
        );
    }
}

class Content extends React.Component {
    render() {
        let content = highlighter(
            this.props.data.excerpt,
            this.props.data.foundWords
        );
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
            `${i.replace(
                /([\^\$\.\*\+\?\|\\\/\(\)\[\]\{\}\,])/g,
                (j) => "\\" + j
            )}`,
            "gi"
        );
        excerpt = excerpt.replace(r, (p) => `<strong>${p}</strong>`);
    }
    return excerpt;
}
