import { LaunchTask } from "../util/firefly";
import { ParseRegion } from "../util/region";
import { drawDS9Regions, drawRegion, clearLayer } from "../actions/viewer.actions";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

// { viewer_id, threshold, region }
export default params => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameter - " + valid));
        return;
    }

    const viewerID = params.viewer_id;
    const viewer = store.getState().viewers[viewerID];
    const region = params.region;
    const threshold = (params.threshold === "max") ? "max" : parseInt(params.threshold);

    // The parameters to pass to the backend
    const backendParameters = {
        threshold,
        region: region.toBackendFormat()
    }

    const onSuccess = data => {
        // Reset the viewer regions
        const regionLayer = "HOT_PIXEL";
        const regionBoundaryLayer = regionLayer + "_BOUNDARY";
        store.dispatch(clearLayer(viewerID, regionLayer));
        store.dispatch(clearLayer(viewerID, regionBoundaryLayer));

        const ds9Regions = data.hotPixels.map( d => ["circle", d.x+0.5, d.y+0.5, 0.5].join(" "));
        const opts = {
            color: "red",
            width: 2
        };
        const regionOpts = {
            color: "blue"
        };

        // Draw the hot pixels
        store.dispatch(drawRegion(viewerID, regionBoundaryLayer, region, regionOpts));
        store.dispatch(drawDS9Regions(viewerID, regionLayer, ds9Regions, opts));
    }

    LaunchTask("hot_pixel", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
