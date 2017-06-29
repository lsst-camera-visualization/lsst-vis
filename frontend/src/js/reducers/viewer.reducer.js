import { ReducerUtil } from "../util/reducer";
import { Viewer } from "../ui/viewer";

// Viewer commands
const commands = {
    "CLEAR_LAYER": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].removeLayer(action.layer);

        return newState;
    },

    "CLEAR_VIEWER": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].removeAllLayers();

        return newState;
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

        let newState = Object.assign({...state}, {});

        const regions = action.regions.map( r => r.toDS9() );
        newState[action.id].drawRegions(action.layer, regions, action.opts);

        return newState;
    },

    "DRAW_DS9REGIONS": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].drawRegions(action.layer, action.regions, action.opts);

        return newState;
    },

    "LOAD_IMAGE": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state}, {});
        newState[action.id].loadImage(action.url);

        return newState;
    },

    "SET_BOUNDARY_REGIONS": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state});
        newState[action.id].boundaryRegions = action.regions;
        return newState;
    },

    "SELECT_REGION": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state});
        newState[action.id].selectedRegion = action.region;
        return newState;
    },

    "UPDATE_CURSOR_POS": (state, action) => {
        if (!(action.id in state) || !action.pos)
            return state;

        let newState = Object.assign({...state});
        newState[action.id].cursorPoint = {
            x: Math.trunc(action.pos.x),
            y: Math.trunc(action.pos.y)
        };
        return newState;
    },

    "UPDATE_HOVERED_AMPNAME": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state});
        newState[action.id].hovered = {
            name: action.name,
            hwregion: action.hwregion
        };

        return newState;
    },

    "UPDATE_PIXEL_VALUE": (state, action) => {
        if (!(action.id in state))
            return state;

        let newState = Object.assign({...state});
        newState[action.id].pixelValue = action.value;
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
