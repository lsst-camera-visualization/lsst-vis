import { Terminal } from "../util/terminal";

const lastState = JSON.parse(localStorage.getItem("state")).terminal;
const initialState = new Terminal().loadFromState(lastState);

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
