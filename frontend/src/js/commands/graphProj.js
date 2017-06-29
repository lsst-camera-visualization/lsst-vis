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
    const region = params.region;

    // The parameters to pass to the backend
    const backendParameters = {
        region: region.toBackendFormat(),
        rowsperbin: parseInt(params.rowsperbin)
    }

    const onSuccess = data => {
        // Reset the viewer regions
        const regionLayer = "GRAPH_PROJ";
        store.dispatch(clearLayer(params.viewer_id, regionLayer));
        const regionOpts = {
            color: "darkorange"
        };
        store.dispatch(drawRegion(params.viewer_id, regionLayer, region, regionOpts));

        // Create output histogram
        const histoData = [
            {
                data: data.projs,
                binColor: "#659CEF",
            }
        ];
        const opts = {
            title: "Graph Projection: " + params.viewer_id,
            xaxis: "Row Numbers"
        }
        store.dispatch(createHistogram(histoData, opts));
    }

    LaunchTask("graphProj", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
