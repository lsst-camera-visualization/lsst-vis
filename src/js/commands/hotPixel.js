import { LaunchTask } from "../util/firefly";
import { ParseRegion } from "../util/region";
import { drawDS9Regions, clearLayer } from "../actions/viewer.actions.js";

import store from "../store";

// { viewer_id, box_id, region }
export default params => {
    const viewerID = params.viewer_id;
    const viewer = store.getState().viewers[viewerID];
    const region = ParseRegion(params.region);
    const threshold = (params.threshold === "max") ? "max" : parseInt(params.threshold);

    // The parameters to pass to the backend
    const backendParameters = {
        threshold,
        region: region.toBackendFormat()
    }

    const onSuccess = data => {

        // Reset the viewer regions
        const regionLayer = "HOT_PIXEL";
        store.dispatch(clearLayer(viewerID, regionLayer));

        const ds9Regions = data.hotPixels.map( d => ["circle", "point", d.x, d.y].join(" "));
        const opts = {
            color: "red"
        }

        // Draw the hot pixels
        store.dispatch(drawDS9Regions(viewerID, regionLayer, ds9Regions, opts));
    }

    LaunchTask("hot_pixel", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
