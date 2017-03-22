

const viewerExists = (state, id) => {
    for (let i = 0; i < state.length; i++)
        if (state[i].id == id)
            return true;
    return false;
}

const executeViewerCommand = (state, action) => {
    const viewerID = action.payload.params[0];
    if (!id)
        return state;

    const bExists = viewerExists(state, id);

    switch (action.payload.command) {
        case "create_viewer":
            if (bExists)
                return state;

            let newState = state.slice();
            newState.push({id});
            return newState;

        case "delete_viewer":
            if (bExists) {
                let newState = state.slice();
                newState.splice(newState.indexOf(id), 1);
                return newState;
            }
    }

    return state;
}


const taskReducer = (state = [], action) => {
    switch (action.type) {
        case "EXECUTE_COMMAND":
            return executeTask(state, action);
        default:
            return state;
    }
}

export default taskReducer;
