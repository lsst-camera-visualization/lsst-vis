import { combineReducers } from "redux";
import terminalReducer from "./terminal.reducer";
import boxReducer from "./box.reducer";
import viewerReducer from "./viewer.reducer";
import histogramReducer from "./histogram.reducer";
import commandsReducer from "./commands.reducer";
import commandPanelReducer from "./commandPanel.reducer";

// State:
// {
//      terminal: A LSSTUtil.Terminal object, containing all terminal data
//      boxes: A list of all the LSSTUtil.Box's created
//      viewers: A list of all the LSSTUtil.Viewer's created
//      histograms: A list of all the LSSTUtil.Histograms created
//      commands: A list of the valid commands that can be entered by the user in the terminal
//      commandPanel: Describes the command panel state.
//                  { show : Boolean, viewerID : String }
// }

const initialState = {

};

const reducer = (state = initialState, action) => {
    let newState = Object.assign({...state}, {});

    newState.terminal = terminalReducer(state.terminal, action);
    newState.boxes = boxReducer(state.boxes, action);
    newState.viewers = viewerReducer(state.viewers, action);
    newState.histograms = histogramReducer(state.histograms, action);
    newState.commands = commandsReducer(state.commands, action);
    newState.commandPanel = commandPanelReducer(state.commandPanel, action);

    return newState;
}

export default reducer;
