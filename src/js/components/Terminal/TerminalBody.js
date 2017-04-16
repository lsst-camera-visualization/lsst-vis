import React from "react";

export default class TerminalBody extends React.Component {
    createEntry = (entry, i) => {
        switch (entry.type) {
            case "COMMAND": {
                return <p className="term-body-entry" key={i}>{"~> " + entry.msg}</p>
            }

            case "ERROR": {
                return <p className="term-body-error" key={i}>{"Error: " + entry.msg}</p>
            }

            default:
                return null;
        }
    }

    createHistory = () => {
        return <ul>{this.props.terminal.history.map(this.createEntry)}</ul>
    }

    componentDidUpdate() {
        this.bodyElem.scrollTop = this.bodyElem.scrollHeight;
    }

    render() {
        return(
            <div className="term-body-ctr" ref={ e => this.bodyElem = e } >
                {this.createHistory()}
            </div>
        );
    }
}
