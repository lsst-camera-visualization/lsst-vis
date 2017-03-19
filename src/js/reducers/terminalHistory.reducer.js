

const terminalHistoryReducer = (state = [], action) => {
    switch (action.type) {
        case "EXECUTE_COMMAND":
            let newState = state.slice();
            newState.push(action.payload.plainInput);
            return newState;

        default:
            return state;
    }
}

export default terminalHistoryReducer;
