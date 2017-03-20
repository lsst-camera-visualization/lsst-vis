import { combineReducers } from "redux";
import terminalHistoryReducer from "./terminalHistory.reducer";
import boxReducer from "./box.reducer";
import viewerReducer from "./viewer.reducer";
import commandsReducer from "./commands.reducer";

const reducer = combineReducers({
    terminalHistory: terminalHistoryReducer,
    boxes: boxReducer,
    viewers: viewerReducer,
    commands: commandsReducer
});

export default reducer;
