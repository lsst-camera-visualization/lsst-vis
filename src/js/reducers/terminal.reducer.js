import { Terminal } from "../util/terminal";
import { JSUtil } from "../util/jsutil";

const lastState = JSON.parse(localStorage.getItem("state"));
const initialState = new Terminal();
if (lastState && !JSUtil.IsEmptyObject(lastState.terminal))
    initialState.loadFromState(lastState.terminal);
initialState.defaults = { viewer_id: "ffview", box_id: "ffbox" }

const terminalReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_COMMAND_TO_HISTORY":
            let newState = state.clone();
            newState.addEntry(action.payload.plainInput);
            return newState;

        default:
            return state;
    }
}

export default terminalReducer;
