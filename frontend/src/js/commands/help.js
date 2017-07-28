import React from "react";
import {addInfoToHistory, addLinkToHistory} from "../actions/terminal.actions";
import {availableCommands} from "./commandDispatcher.js"

import store from "../store";

export const helpCommand = (params) => {
    const helpPrompt = "List of available commands:\n"
    const cmdsLineBreak = availableCommands().map((cmd, keyID) => {
        return (<p key={keyID}>{cmd}</p>);
    });
    const helpInfo = <div>{helpPrompt}{cmdsLineBreak}</div>;
    const helpLink = {
        link: "https://github.com/lsst-camera-visualization/lsst-vis/wiki",
        displayText: "Link to the help documentation"
    };
    store.dispatch(addInfoToHistory(helpInfo));
    store.dispatch(addLinkToHistory(helpLink));
}
