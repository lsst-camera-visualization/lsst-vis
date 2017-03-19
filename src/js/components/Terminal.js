import React from "react";

import TerminalHelp from "./Terminal/TerminalHelp";
import TerminalBody from "./Terminal/TerminalBody";
import { Util } from "../util/Util";

export default class Terminal extends React.Component {

    handleClick = () => {
        this.input.focus();
    }

    handleKeyDown = e => {
        const ENTER_CHAR_CODE = 13;
        if (e.charCode == ENTER_CHAR_CODE || e.keyCode == ENTER_CHAR_CODE) {
            if (!Util.IsEmptyString(e.target.value)) {
                this.props.onExecute(e.target.value);
                e.target.value = "";
            }
        }
    }

    render() {
        const style = {
            width: this.props.width,
            height: this.props.height
        };

        return (
            <div className="term-ctr" style={style} onClick={this.handleClick}>
                <TerminalHelp />
                <TerminalBody terminalHistory={this.props.terminalHistory}/>
                <input
                    className="term-input-input"
                    ref={ input => this.input = input }
                    placeholder="Enter command here"
                    onKeyDown={this.handleKeyDown}
                    autoFocus
                />
            </div>
        );
    }
}
