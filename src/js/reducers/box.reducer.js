
const boxExists = (state, id) => {
    for (let i = 0; i < state.length; i++)
        if (state[i].id == id)
            return true;
    return false;
}

const executeBoxCommand = (state, action) => {
    const id = action.payload.params[0];
    if (!id)
        return state;

    const bExists = boxExists(state, id);

    switch (action.payload.command) {
        case "create_box":
            if (bExists)
                return state;

            let newState = state.slice();
            newState.push({id});
            return newState;

        case "delete_box":
            if (bExists) {
                let newState = state.slice();
                newState.splice(newState.indexOf(id), 1);
                return newState;
            }
    }

    return state;
}

const boxReducer = (state = [ {id: "ffbox" } ], action) => {
    switch (action.type) {
        case "EXECUTE_COMMAND":
            return executeBoxCommand(state, action);
        default:
            return state;
    }
}

export default boxReducer;
