import { combineReducers } from "redux";
import terminalHistoryReducer from "./terminalHistory.reducer";
import boxReducer from "./box.reducer";
import commandsReducer from "./commands.reducer";

const reducer = combineReducers({
    terminalHistory: terminalHistoryReducer,
    boxes: boxReducer,
    commands: commandsReducer
});

export default reducer;
