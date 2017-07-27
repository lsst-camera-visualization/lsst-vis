import {addInfoToHistory, addLinkToHistory} from "../actions/terminal.actions";

import store from "../store";

export const helpCommand = (params) => {
    const helpPrompt = "Visit the wiki page for command usages."
    const helpLink = {
        link: "https://github.com/lsst-camera-visualization/lsst-vis/wiki",
        displayText: "Link to the help documentation"
    };
    store.dispatch(addInfoToHistory(helpPrompt));
    store.dispatch(addLinkToHistory(helpLink));
}
