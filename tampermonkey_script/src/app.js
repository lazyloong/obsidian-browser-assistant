import React from "react";
import "./app.less";
export default class extends React.Component {
    render() {
        let list =
            this.props.data.length == 0 ? (
                <Entry flag={0} />
            ) : (
                this.props.data.map((p) => <Entry data={p} name={p.basename} />)
            );
        return (
            <div className="Ba richrswrapper">
                <div className="richrsrailtitle">
                    <h2>Ob</h2>
                </div>
                <div className="richrsrailcontent">{list}</div>
            </div>
        );
    }
}

class Entry extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    render() {
        if (this.props.flag == 0) {
            return <div className="richrsrailsuggestion">无结果</div>;
        } else {
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
