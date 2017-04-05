import { ReducerUtil } from "../util/reducer";
import { Viewer } from "../util/viewer";
import { FireflyUtil } from "../util/firefly";


// Viewer commands
const commands = {
    "CLEAR_REGION": (state, action) => {
        if (!(action.id in state))
            return state;
        FireflyUtil.ClearRegion(action.id, action.layer);
        return Object.assign({...state}, {});
    },

    "CREATE_VIEWER": (state, action) => {
        if (action.id in state)
            return state;
        return ReducerUtil.AddElement(state, action.id, new Viewer(action.id));
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

    "UPDATE_CURSORPOS": (state, action) => {
        if (!(action.id in state) || !action.pos)
            return state;

        let newState = Object.assign({...state});
        newState[action.id].cursorPoint = {
            x: Math.trunc(action.pos.x),
            y: Math.trunc(action.pos.y)
        }
        return newState;
    }
}



// Viewer reducer function
const viewerReducer = (state = {}, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default viewerReducer;
