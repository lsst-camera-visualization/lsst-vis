import React from "react";

import TerminalHelp from "./Terminal/TerminalHelp";
import TerminalBody from "./Terminal/TerminalBody";
import { Util, DOMUtil } from "../util/Util";
import { LSSTUtil } from "../util/LSSTUtil";

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

    handleEnter = e => {
        if (!Util.IsEmptyString(e.target.value)) {
            const input = e.target.value;
            this.props.onExecute(input);

            let groups = Util.SplitStringByGroup(input);
            const command = groups.shift();

            // Convert array into dictionary of parameters
            const params = LSSTUtil.MapParamsToNames(groups, this.props.commands.commands[command]);
            this.props.commandDispatcher.dispatch(command, params);

            // Clear the user input
            e.target.value = "";
            this.setState({input: ""});
        }
    }

    handleTab = e => {
        e.preventDefault();

        const defaults = this.props.terminal.defaults;
        if (this._param === null) {
            const ac = this.props.commands.autoCompleteArray.autoComplete(e.target.value);
            if (ac.auto) {
                e.target.value = ac.auto + (ac.bWhole ? " " : "");
            }
        }
        else if (this._param in defaults) {
            e.target.value += defaults[this._param] + " ";
        }

        // Update caret pos and stuff
        this.handleChange();
        this.handleKeyUp();
    }

    handleKeyDown = e => {
        const ENTER_CHAR_CODE = 13;
        const TAB_CHAR_CODE = 9;

        if (e.charCode === ENTER_CHAR_CODE || e.keyCode === ENTER_CHAR_CODE) {
            this.handleEnter(e);
        }
        else if (e.charCode === TAB_CHAR_CODE || e.keyCode === TAB_CHAR_CODE) {
            this.handleTab(e);
        }
    }

    handleKeyUp = e => {
        this.setState({ caretPos: DOMUtil.GetCaretPos(this.input) });
    }

    handleChange = e => {
        // Save the user input
        this.setState({input: this.input.value});
    }

    handleHighlightParameter = param => {
        this._param = param;
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
                    onHighlightParameter={this.handleHighlightParameter}
                    input={this.state.input}
                    caretPos={this.state.caretPos} />
                <TerminalBody terminal={this.props.terminal}/>
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
