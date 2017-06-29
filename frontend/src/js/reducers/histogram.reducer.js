import { ReducerUtil } from "../util/reducer";
import { Histogram } from "../ui/histogram";

let _numHistograms = 0;

const commands = {
    "CREATE_HISTOGRAM": (state, action) => {
        const id = "_histogramID" + _numHistograms++;
        const h = new Histogram(id, action.data, action.opts);
        return ReducerUtil.AddElement(state, id, h);
    },

    "DELETE_HISTOGRAM": (state, action) => {
        if (!(action.id in state))
            return state;
        return ReducerUtil.RemoveElement(state, action.id);
    },
}




const initialState = {

}

const histogramReducer = (state = initialState, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default histogramReducer;
