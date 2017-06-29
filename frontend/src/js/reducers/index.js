import { combineReducers } from "redux";
import terminalReducer from "./terminal.reducer";
import boxReducer from "./box.reducer";
import viewerReducer from "./viewer.reducer";
import uvReducer from "./uv.reducer";
import histogramReducer from "./histogram.reducer";
import commandsReducer from "./commands.reducer";
import commandPanelReducer from "./commandPanel.reducer";
import settingsReducer from "./settings.reducer";

// State:
// {
//      terminal: A LSSTUtil.Terminal object, containing all terminal data
//      boxes: A list of all the LSSTUtil.Box's created
//      viewers: A list of all the LSSTUtil.Viewer's created
//      uvControllers: A list of all the UVControllers
//      histograms: A list of all the LSSTUtil.Histograms created
//      commands: A list of the valid commands that can be entered by the user in the terminal
//      commandPanel: Describes the command panel state.
//                  { show : Boolean, viewerID : String }
//      settings: Application settings
// }

const initialState = {

};

const reducer = (state = initialState, action) => {
    let newState = Object.assign({...state}, {});

    newState.terminal = terminalReducer(state.terminal, action);
    newState.boxes = boxReducer(state.boxes, action);
    newState.viewers = viewerReducer(state.viewers, action);
    newState.uvControllers = uvReducer(state.uvControllers, action);
    newState.histograms = histogramReducer(state.histograms, action);
    newState.commands = commandsReducer(state.commands, action);
    newState.commandPanel = commandPanelReducer(state.commandPanel, action);
    newState.settings = settingsReducer(state.settings, action);

    return newState;
}

export default reducer;
