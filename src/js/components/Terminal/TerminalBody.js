import React from "react";

export default class TerminalBody extends React.Component {
    createHistory = () => {
        return (
            <ul>
                { this.props.terminalHistory.map(
                    (entry, i) =>
                        <li className="term-body-entry" key={i} >{"~> " + entry}</li>
                    )
                }
            </ul>
        );
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
