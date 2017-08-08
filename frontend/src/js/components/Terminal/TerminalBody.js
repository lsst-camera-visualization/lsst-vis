import React from "react";

export default class TerminalBody extends React.Component {
    // Generator function for a single terminal entry (command or error)
    createEntry = (entry, i) => {
        switch (entry.type) {
            case "COMMAND": {
                return <p className="term-body-entry" key={i}>{"~> " + entry.msg}</p>;
            }

            case "ERROR": {
                return <p className="term-body-error" key={i}>{"Error: " + entry.msg}</p>;
            }

            case "WARN": {
                return <p className="term-body-warn" key={i}>{"Warning: " + entry.msg}</p>;
            }

            case "INFO": {
                return <div className="term-body-info" key={i}>{entry.msg}</div>;
            }
            case "LINK": {
                return <a className="term-body-link" key={i} href={entry.msg.link} target="_blank">{entry.msg.displayText}</a>;
            }

            default:
                return null;
        }
    }

    // Creates the list of the terminal history
    createHistory = () => {
        return <ul>{this.props.terminal.history.map(this.createEntry)}</ul>
    }

    componentDidUpdate() {
        // When we type a new command, scroll to the bottom of the history
        this.bodyElem.scrollTop = this.bodyElem.scrollHeight;
    }

    render() {
        const bodyClassName = this.props.isMini ? "term-body-ctr-mini" : "term-body-ctr";
        return(
            <div className={bodyClassName}
                ref={ e => this.bodyElem = e }
                style={this.props.style}>
                {this.createHistory()}
            </div>
        );
    }
}
