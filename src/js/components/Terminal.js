import React from "react";

import TerminalHelp from "./Terminal/TerminalHelp";
import TerminalBody from "./Terminal/TerminalBody";
import { Util, DOMUtil } from "../util/Util";

export default class Terminal extends React.Component {
    constructor() {
        super();
        this.state = {
            input: ""
        };
    }

    handleClick = () => {
        this.input.focus();
    }

    handleKeyDown = e => {
        const ENTER_CHAR_CODE = 13;
        if (e.charCode == ENTER_CHAR_CODE || e.keyCode == ENTER_CHAR_CODE) {
            if (!Util.IsEmptyString(e.target.value)) {
                this.props.onExecute(e.target.value);

                // Clear the user input
                e.target.value = "";
                this.setState({input: ""});
            }
        }
    }

    handleKeyUp = e => {
        this.setState({ caretPos: DOMUtil.GetCaretPos(this.input) });
    }

    handleChange = e => {
        // Save the user input
        this.setState({input: this.input.value});
    }

    render() {
        const style = {
            width: this.props.width,
            height: this.props.height
        };

        return (
            <div className="term-ctr" style={style} onClick={this.handleClick}>
                <TerminalHelp
                    commands={this.props.commands}
                    input={this.state.input}
                    caretPos={this.state.caretPos} />
                <TerminalBody terminalHistory={this.props.terminalHistory}/>
                <input
                    className="term-input-input"
                    ref={ input => this.input = input }
                    placeholder="Enter command here"
                    onKeyDown={this.handleKeyDown}
                    onKeyUp={this.handleKeyUp}
                    onChange={this.handleChange}
                    autoFocus
                />
            </div>
        );
    }
}
