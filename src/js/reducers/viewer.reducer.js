import { ReducerUtil } from "../util/ReducerUtil";
import { LSSTUtil } from "../util/LSSTUtil";

const executeViewerCommand = (state, action) => {
    const id = action.payload.params[0];
    if (!id)
        return state;

    const viewer = state[id];
    switch (action.payload.command) {
        case "create_viewer":
            if (viewer)
                return state;

            return ReducerUtil.AddElement(state, id, new LSSTUtil.Viewer(id));

        case "delete_viewer":
            if (viewer)
                return ReducerUtil.RemoveElement(state, id);
    }

    return state;
}


const viewerReducer = (state = {}, action) => {
    switch (action.type) {
        case "EXECUTE_COMMAND":
            return executeViewerCommand(state, action);
        default:
            return state;
    }
}

export default viewerReducer;
