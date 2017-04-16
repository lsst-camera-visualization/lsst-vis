import { LaunchTask } from "../util/firefly";
import { ParseRegion } from "../util/region";
import { createHistogram, drawHistogram } from "../actions/histogram.actions";
import { drawRegion, clearLayer } from "../actions/viewer.actions";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

// { viewer_id, region, num_bins, min, max, [scale] }
export default (params) => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameter - " + valid));
        return;
    }

    const viewer = store.getState().viewers[params.viewer_id];
    const region = ParseRegion(params.region);

    // The parameters to pass to the backend
    const backendParameters = {
        region: region.toBackendFormat(),
        bins: parseInt(params.num_bins) || 10,
        min: parseFloat(params.min) || -1,
        max: parseFloat(params.max) || -1
    }

    const onSuccess = data => {
        // Reset the viewer regions
        const regionLayer = "GRAPH_PIXEL";
        store.dispatch(clearLayer(params.viewer_id, regionLayer));
        const regionOpts = {
            color: "darkorange"
        };
        store.dispatch(drawRegion(params.viewer_id, regionLayer, region, regionOpts));

        // Create output histogram
        const histoData = [
            {
                data: data.main,
                binColor: "#659CEF",
                name: "Main"
            },
            {
                data: data.underflow,
                binColor: "#CB3515",
                name: "Underflow"
            },
            {
                data: data.overflow,
                binColor: "#CB3515",
                name: "Overflow"
            }
        ];
        const opts = {
            title: "Graph Pixel: " + params.viewer_id,
            xaxis: "Pixel Value"
        }
        store.dispatch(createHistogram(histoData, opts));
    }

    LaunchTask("graph_pixel", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
