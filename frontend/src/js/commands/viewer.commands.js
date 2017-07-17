import * as ViewerActions from "../actions/viewer.actions";
import { setDefault } from "../actions/terminal.actions";
import { JSUtil } from "../util/jsutil";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

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

// Displays the boundary regions on a viewer
export const showBoundary = params => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameters: " + valid));
        return;
    }
    const viewerID = params.viewer_id;
    const viewers = store.getState().viewers;
    const viewer = viewers[viewerID];
    const regionLayer = "BOUNDARY";

    if (!viewer.boundaryRegions){
        const err = "Boundary not fetched for this image."
        console.log(err);
        return;
    }

    store.dispatch(ViewerActions.clearLayer(viewerID, regionLayer));
    const regions = viewer.boundaryRegions;
    const opts = {
        color: "red",
        width: 1
    };

    // Draw the boundary regions
    store.dispatch(ViewerActions.drawDS9Regions(viewerID, regionLayer, regions, opts));
}

export const hideBoundary = params => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameters: " + valid));
        return;
    }
    const viewerID = params.viewer_id;
    const viewers = store.getState().viewers;
    const viewer = viewers[viewerID];
    const regionLayer = "BOUNDARY";
    // TODO: move boundary functions to a separate js file
    if (!viewer.boundaryRegions){
        const err = "Boundary not fetched for this image."
        console.log(err);
        return;
    }
    store.dispatch(ViewerActions.clearLayer(viewerID, regionLayer));
}
