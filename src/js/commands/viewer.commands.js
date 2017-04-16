import * as ViewerActions from "../actions/viewer.actions";

import store from "../store";

export const clearViewer = params => {
    store.dispatch(ViewerActions.clearViewer(params.viewer_id));
}

export const createViewer = params => {
    store.dispatch(ViewerActions.createViewer(params.viewer_id));
}

export const deleteViewer = params => {
    store.dispatch(ViewerActions.deleteViewer(params.viewer_id));
}

export const showBoundary = params => {
    const viewerID = params.viewer_id;
    const viewers = store.getState().viewers;
    if (!(viewerID in viewers) || !viewers[viewerID].boundaryRegions)
        return;

    const viewer = store.getState().viewers[viewerID];
    const regions = viewer.boundaryRegions;
    const opts = {
        color: "red",
        width: 1
    };

    // Draw the boundary regions
    store.dispatch(ViewerActions.drawDS9Regions(viewerID, "BOUNDARY", regions, opts));
}
