import { Terminal } from "../ui/terminal";
import { JSUtil } from "../util/jsutil";

const lastState = JSON.parse(localStorage.getItem("state"));
const initialState = new Terminal();
if (lastState && !JSUtil.IsEmptyObject(lastState.terminal))
    initialState.loadFromState(lastState.terminal);
initialState.defaults = { viewer_id: "ffview", box_id: "ffbox" }


const commands = {
    "ADD_COMMAND": (state, action) => {
        let newState = state.clone();
        newState.addCommand(action.commandName);
        return newState;
    },

    "ADD_COMMAND_TO_HISTORY": (state, action) => {
        let newState = state.clone();
        newState.addEntry(action.payload.plainInput);
        return newState;
    },

    "ADD_ERROR_TO_HISTORY": (state, action) => {
        let newState = state.clone();
        newState.addError(action.error);
        return newState;
    },

    "ADD_PARAMETER_DESC": (state, action) => {
        let newState = state.clone();
        newState.setParameterDesc(action.parameter, action.desc);
        return newState;
    },

    "SET_DEFAULT": (state, action) => {
        let newState = state.clone();
        newState.setDefault(action.parameter_id, action.value);
        return newState;
    },
}

const terminalReducer = (state = initialState, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default terminalReducer;
