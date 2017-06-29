import React from "react";

import Resizable from "react-resizable-box";
import TerminalHelp from "./Terminal/TerminalHelp";
import TerminalBody from "./Terminal/TerminalBody";
import TerminalInput from "./Terminal/TerminalInput";
import { JSUtil, DOMUtil } from "../util/jsutil";
import { Util } from "../util/util";
import commandDispatcher from "../commands/commandDispatcher";

export default class Terminal extends React.Component {
    constructor() {
        super();
        this.state = {
            input: ""
        };
    }

    // Sets a ref to the input DOM
    setInput = input => {
        this.input = input;
    }

    // On mouse click handler
    handleClick = () => {
        // Put focus on the input when we click anywhere on the terminal
        this.input.focus();
    }



    // Execute command handler
    handleEnter = input => {
        if (!JSUtil.IsEmptyString(input)) {
            this.props.onExecute(input);

            let groups = JSUtil.SplitStringByGroup(input);
            const command = groups.shift();

            // Make sure command exists
            if (!(command in this.props.commands)) {
                this.props.displayInvalidCommandMessage();
                return;
            }

            // Convert array into dictionary of parameters
            const params = Util.MapParamsToNames(groups, this.props.commands[command].params);

            // Dispatch the command
            commandDispatcher.dispatch(command, params);

            // Clear the user input
            this.setState({input: ""});
        }
    }

    // Autocomplete handler
    handleTab = e => {
        e.preventDefault();

        const defaults = this.props.terminal.defaults;
        const input = e.target.value;
        if (this._param === null) {
            // Entering the command name
            const ac = this.props.terminal.autoCompleteArray.autoComplete(input);
            if (ac.auto) {
                e.target.value = ac.auto + (ac.bWhole ? " " : "");
            }
        }
        else {
            if (input.match(/\s$/)) {
                // Handle default values, because so far we have nothing for this parameter
                if (this._param in defaults)
                    e.target.value += defaults[this._param] + " ";
            }
            else if (this._param in this._autoParams) {
                // Handle auto completing the parameter value
                const curr = input.match(/\w+$/)[0];
                const ac = this._autoParams[this._param].autoComplete(curr);
                if (ac.auto)
                    e.target.value += ac.auto.substr(curr.length) + " ";
            }
        }

        // Simulate a key press
        this.handleChange(e);
        this.handleKeyUp(e);
    }



    // Terminal history handler
    // Direction must be "up" or "down"
    handleMove = (e, direction) => {
        e.persist();

        // Update the input with the correct entry from the terminal history.
        const entry = this.props.terminal[direction]();
        e.target.value = entry;
        DOMUtil.SetCaretPos(this.input, entry.length);

        // Simulate a key press to update the help string
        this.handleChange(e);
    }


    // Key down handler
    handleKeyDown = e => {
        const UP_CHAR_CODE = 38;
        const DOWN_CHAR_CODE = 40;

        if (e.charCode === UP_CHAR_CODE || e.keyCode === UP_CHAR_CODE)
            this.handleMove(e, "up");
        else if (e.charCode === DOWN_CHAR_CODE || e.keyCode === DOWN_CHAR_CODE)
            this.handleMove(e, "down");
    }

    // Key up handler
    handleKeyUp = e => {
        this.setState({ caretPos: DOMUtil.GetCaretPos(e.target) });
    }

    // Input change handler
    handleChange = e => {
        // Save the user input
        this.setState({input: e.target.value});
    }


    // Highlight help parameter handler
    handleHighlightParameter = param => {
        this._param = param;
    }

    componentWillUpdate() {
        // Set the parameter auto's for boxes and viewers
        this._autoParams = {
            box_id: new JSUtil.AutoCompleteArray(JSUtil.ObjectToArray(this.props.boxes)),
            viewer_id: new JSUtil.AutoCompleteArray(JSUtil.ObjectToArray(this.props.viewers))
        }
    }

    render() {
        const style = {
            width: this.props.width,
            height: this.props.height
        };

        return (
            <div onClick={this.handleClick}>
                <Resizable
                    className="term-ctr"
                    width={this.props.width}
                    height={this.props.height} >
                        <TerminalHelp
                            commands={this.props.commands}
                            terminal={this.props.terminal}
                            onHighlightParameter={this.handleHighlightParameter}
                            input={this.state.input}
                            caretPos={this.state.caretPos} />
                        <TerminalBody terminal={this.props.terminal}/>
                        <TerminalInput
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                            onKeyUp={this.handleKeyUp}
                            onEnter={this.handleEnter}
                            onTab={this.handleTab}
                            setInput={this.setInput} />
                </Resizable>
            </div>
        );
    }
}
