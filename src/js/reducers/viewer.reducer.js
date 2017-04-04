import { ReducerUtil } from "../util/ReducerUtil";
import { LSSTUtil } from "../util/LSSTUtil";
import { FireflyUtil } from "../util/FireflyUtil";


// Viewer commands
const commands = {
    "CREATE_VIEWER": (state, action) => {
        if (action.id in state)
            return state;
        return ReducerUtil.AddElement(state, action.id, new LSSTUtil.Viewer(action.id));
    },

    "DELETE_VIEWER": (state, action) => {
        if (!(action.id in state))
            return state;
        return ReducerUtil.RemoveElement(state, action.id);
    },

    "DRAW_REGIONS": (state, action) => {
        if (!(action.id in state))
            return state;
        const regions = action.regions.map( r => r.toDS9() );
        FireflyUtil.DrawRegions(action.id, action.layer, regions, action.opts);
        return Object.assign({...state}, {});
    },

    "DRAW_DS9REGIONS": (state, action) => {
        if (!(action.id in state))
            return state;
        FireflyUtil.DrawRegions(action.id, action.layer, action.regions, action.opts);
        return Object.assign({...state}, {});
    },

    "CLEAR_REGION": (state, action) => {
        if (!(action.id in state))
            return state;
        FireflyUtil.ClearRegion(action.id, action.layer);
        return Object.assign({...state}, {});
    },
}



// Viewer reducer function
const viewerReducer = (state = {}, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default viewerReducer;
