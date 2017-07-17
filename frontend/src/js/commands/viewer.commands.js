import * as ViewerActions from "../actions/viewer.actions";
import { setDefault } from "../actions/terminal.actions";
import { JSUtil } from "../util/jsutil";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

// TODO: ADD validateParameters!!!

// Clears all region layers on a viewer
export const clearViewer = params => {
    store.dispatch(ViewerActions.clearViewer(params.viewer_id));
}

// Creates a viewer and updates the default value for "viewer_id" if necessary
export const createViewer = params => {
    store.dispatch(ViewerActions.createViewer(params.viewer_id));

    // If we are the only viewer, we automatically become the default
    if (JSUtil.ObjectToArray(store.getState().viewers).length === 1)
        store.dispatch(setDefault("viewer_id", params.viewer_id));
}

// Deletes a viewer and updates the default value for "viewer_id" if necessary
export const deleteViewer = params => {
    store.dispatch(ViewerActions.deleteViewer(params.viewer_id));

    // If we were the last viewer, reset the default
    if (JSUtil.ObjectToArray(store.getState().viewers).length === 0)
        store.dispatch(setDefault("viewer_id", ""));
}

// Loads a new image into a viewer
export const loadImage = params => {
    store.dispatch(ViewerActions.loadImage(params.viewer_id, params.url));
}
