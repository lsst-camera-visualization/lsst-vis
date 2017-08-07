import React from "react";
import Draggable from 'react-draggable';
import Resizable from "react-resizable-box";

import TerminalHelp from "./Terminal/TerminalHelp";
import TerminalBody from "./Terminal/TerminalBody";
import TerminalInput from "./Terminal/TerminalInput";
import { JSUtil, DOMUtil } from "../util/jsutil";
import { Util } from "../util/util";
import commandDispatcher from "../commands/commandDispatcher";

import store from "../store.js";
import {getSettingsFromLocal} from "../store.js";
import { extendSettings } from "../actions/misc.actions.js";

export default class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.fontSizeArrary = [
            "50%",
            "67%",
            "75%",
            "80%",
            "90%",
            "100%",
            "110%",
            "125%",
            "150%",
            "175%",
            "200%"
        ];
        const settings = getSettingsFromLocal();
        let fontSize = "110%";
        if (settings.hasOwnProperty("termFontSize") && this.fontSizeArrary.indexOf(settings.termFontSize)!=-1) {
            fontSize = settings.termFontSize;
        }
        this.updateLocalFontSize(fontSize);
        const idx = this.fontSizeArrary.indexOf(fontSize);
        this.state = {
            input: "",
            isMini: false,
            height: props.height,
            width: props.width,
            defaultWidth: props.width,
            defaultHeight: props.height,
            minHeight: 60,
            minWidth: 300,
            fontSizeIdx: idx,
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

    handleMinMax = () => {
        const termDim = this.state.isMini
            ? ({width: this.state.width, height: this.state.height})
            : ({width: this.state.minWidth, height: this.state.minHeight});
        this.state.resizable.updateSize(termDim);
        this.setState({isMini: !this.state.isMini});
    }

    handleOnResize = (event, direction, refToElement, delta) => {
        const updater = {
            height: refToElement.clientHeight,
            width: refToElement.clientWidth,
            isMini: false
        };
        this.setState(updater);
    }

    handleReset = () => {
        const updater = {
            height: this.state.defaultHeight,
            width: this.state.defaultWidth,
            isMini: false
        };
        const termDim = {
            width: this.state.defaultWidth,
            height: this.state.defaultHeight
        };
        this.state.resizable.updateSize(termDim);
        this.setState(updater);
    }

    handleIncreaseFontSize = () => {
        let idx = this.state.fontSizeIdx;
        if ((idx + 1) < this.fontSizeArrary.length){
            idx++;
            this.updateLocalFontSize(this.fontSizeArrary[idx]);
        }
        const updater = {
            fontSizeIdx: idx
        };
        this.setState(updater);
    }

    handleDecreaseFontSize = () => {
        let idx = this.state.fontSizeIdx;
        if (idx >= 1){
            idx--;
            this.updateLocalFontSize(this.fontSizeArrary[idx]);
        }
        const updater = {
            fontSizeIdx: idx
        };
        this.setState(updater);
    }

    updateLocalFontSize = (fontSize) => {
        const settings = {
            termFontSize: fontSize
        };
        store.dispatch(extendSettings(settings));
    }

    render() {
        const styleFontSize = {
            fontSize: this.fontSizeArrary[this.state.fontSizeIdx]
        };
        return (
            <div className="term-hover">
                <TermToolbar className="term-toolbar"
                    onClickMinMax={this.handleMinMax}
                    onClickReset={this.handleReset}
                    onClickIncreaseFont={this.handleIncreaseFontSize}
                    onClickDecreaseFont={this.handleDecreaseFontSize}
                    fontSizeIdx={this.state.fontSizeIdx}
                    fontSizeArraryLen={this.fontSizeArrary.length}
                    isMini={this.state.isMini}>
                </TermToolbar>
                <div onClick={this.handleClick}>
                    <Resizable
                        className="term-ctr"
                        ref={r => {this.state.resizable=r;}}
                        width={this.props.width}
                        height={this.props.height}
                        onResizeStop={this.handleOnResize}>
                            <TerminalHelp
                                commands={this.props.commands}
                                terminal={this.props.terminal}
                                onHighlightParameter={this.handleHighlightParameter}
                                input={this.state.input}
                                caretPos={this.state.caretPos}
                                isMini={this.state.isMini}
                                style={styleFontSize}/>
                            <TerminalBody
                                terminal={this.props.terminal}
                                isMini={this.state.isMini}
                                style={styleFontSize}/>
                            <TerminalInput
                                onChange={this.handleChange}
                                onKeyDown={this.handleKeyDown}
                                onKeyUp={this.handleKeyUp}
                                onEnter={this.handleEnter}
                                onTab={this.handleTab}
                                setInput={this.setInput}
                                isMini={this.state.isMini}
                                style={styleFontSize}/>
                    </Resizable>
                </div>
                </div>
        );
    }
}

class TermToolbar extends React.Component {
    render() {
        const iconClass = "material-icons md-36 md-light";
        const iconMinMaxName = (this.props.isMini) ?  "expand_less" : "expand_more";
        const iconMinMax = (
            <i className={iconClass}
                onClick={this.props.onClickMinMax}>
                {iconMinMaxName}
            </i>
        );

        const iconShowBoundary = (
            <i className={iconClass}
                onClick={this.props.onClickShowBoundary}>
                grid_on
            </i>
        );

        const iconHideBoundary = (
            <i className={iconClass}
                onClick={this.props.onClickHideBoundary}>
                grid_off
            </i>
        );

        const iconReset = (
            <i className={iconClass}
                onClick={this.props.onClickReset}>
                restore
            </i>
        );

        const isIncreaseInactive = (this.props.fontSizeIdx+1 >= this.props.fontSizeArraryLen) ? " md-inactive" : "";

        const iconIncreaseFont = (
            <i className={iconClass + isIncreaseInactive}
                onClick={this.props.onClickIncreaseFont}>
                add_circle_outline
            </i>
        );

        const isDecreaseInactive = (this.props.fontSizeIdx <= 0) ? " md-inactive" : "";
        const iconDecreaseFont = (
            <i className={iconClass + isDecreaseInactive}
                onClick={this.props.onClickDecreaseFont}>
                remove_circle_outline
            </i>
        );

        return (
            <div className={this.props.className}>
                {iconMinMax}
                {iconReset}
                {iconIncreaseFont}
                {iconDecreaseFont}
                {iconHideBoundary}
                {iconShowBoundary}
                {this.props.children}
            </div>
        );
    }
}
