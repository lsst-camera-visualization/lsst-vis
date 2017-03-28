import { ReducerUtil } from "../util/ReducerUtil";
import { LSSTUtil } from "../util/LSSTUtil";


const commands = {
    "CREATE_BOX": (state, action) => {
        if (action.id in state)
            return state;
        return ReducerUtil.AddElement(state, action.id, new LSSTUtil.Box(action.id));
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

    "SET_BOXTEXT": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].setText(action.text);
        return newState;
    }
}





const initialState = {
    "ffbox": new LSSTUtil.Box("ffbox")
}

const boxReducer = (state = initialState, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default boxReducer;
