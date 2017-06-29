import { ReducerUtil } from "../util/reducer";
import { Box } from "../ui/box";


const commands = {
    "CREATE_BOX": (state, action) => {
        if (action.id in state)
            return state;

        return ReducerUtil.AddElement(state, action.id, new Box(action.id));
    },

    "DELETE_BOX": (state, action) => {
        if (!(action.id in state))
            return state;

        return ReducerUtil.RemoveElement(state, action.id);
    },

    "CLEAR_BOXTEXT": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].clearText();
        return newState;
    },

    "HIDE_BOX": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].minimize();
        return newState;
    },

    "SET_BOXTEXT": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].setText(action.text);
        return newState;
    },

    "SHOW_BOX": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].maximize();
        return newState;
    },
}




const initialState = {
    "ffbox": new Box("ffbox")
}

const boxReducer = (state = initialState, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default boxReducer;
