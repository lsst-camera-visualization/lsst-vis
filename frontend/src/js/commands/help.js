import {addInfoToHistory, addLinkToHistory} from "../actions/terminal.actions";
import {availableCommands} from "./commandDispatcher.js"

import store from "../store";

export const helpCommand = (params) => {
    const helpPrompt = availableCommands().join(", ");
    const helpLink = {
        link: "https://github.com/lsst-camera-visualization/lsst-vis/wiki",
        displayText: "Link to the help documentation"
    };
    store.dispatch(addInfoToHistory(helpPrompt));
    store.dispatch(addLinkToHistory(helpLink));
}
