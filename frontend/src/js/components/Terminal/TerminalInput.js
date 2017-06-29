import React from "react";

import { JSUtil } from "../../util/jsutil";

export default class TerminalInput extends React.Component {
    // Enter key handler
    handleEnter = e => {
        if (!JSUtil.IsEmptyString(e.target.value)) {
            const input = e.target.value;
            this.props.onEnter(input);

            // Clear the user input
            e.target.value = "";
        }
    }


    // Key press handler, dispatches other key specific functions
    handleKeyDown = e => {
        const ENTER_CHAR_CODE = 13;
        const TAB_CHAR_CODE = 9;

        if (e.charCode === ENTER_CHAR_CODE || e.keyCode === ENTER_CHAR_CODE)
            this.handleEnter(e);
        else if (e.charCode === TAB_CHAR_CODE || e.keyCode === TAB_CHAR_CODE)
            this.props.onTab(e);

        this.props.onKeyDown(e);
    }


    render() {
        return (
            <input
                className="term-input-input"
                ref={ this.props.setInput }
                placeholder="Enter command here"
                onKeyDown={this.handleKeyDown}
                onKeyUp={this.props.onKeyUp}
                onChange={this.props.onChange}
                autoFocus
            />
        );
    }
}
