import { ReducerUtil } from "../util/reducer";
import { UVController } from "../ui/viewer";

// UVController commands
const commands = {
    "CREATE_VIEWER": (state, action) => {
        if (action.id in state)
            return state;
        return ReducerUtil.AddElement(state, action.id, new UVController(action.id));
    },

    "DELETE_VIEWER": (state, action) => {
        if (!(action.id in state))
            return state;
        return ReducerUtil.RemoveElement(state, action.id);
    },

    "UV_INTERVAL": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].setInterval(action.interval);

        return newState;
    },

    "UV_PAUSE": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].pause();

        return newState;
    },

    "UV_RESUME": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].resume();

        return newState;
    }
}



// UVController reducer function
const uvReducer = (state = {}, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default uvReducer;
