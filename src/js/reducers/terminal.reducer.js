import { LSSTUtil } from "../util/LSSTUtil";

const initialState = new LSSTUtil.Terminal([], { viewer_id: "ffview", box_id: "ffbox" });

const terminalReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_COMMAND_TO_HISTORY":
            let newState = state.clone();
            newState.history.push(action.payload.plainInput);
            return newState;

        default:
            return state;
    }
}

export default terminalReducer;
