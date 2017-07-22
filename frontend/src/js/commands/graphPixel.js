import { LaunchTask } from "../util/firefly";
import { ParseRegion } from "../util/region";
import { createHistogram, drawHistogram } from "../actions/histogram.actions";
import { drawRegion, clearLayer } from "../actions/viewer.actions";
import { validateParameters } from "../util/command";
import { addErrorToHistory, addWarnToHistory, addInfoToHistory } from "../actions/terminal.actions";

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
    let numBins = parseInt(params.num_bins);
    let rangeMin = parseInt(params.min);
    let rangeMax = parseInt(params.max);
    let logFlag = false;

    if (params.num_bins == "log"){
        numBins = "auto";
        rangeMin = "auto";
        rangeMax = "auto";
        logFlag = true;
    } else {
        if (!numBins || numBins<0){
            if (params.num_bins != "auto"){
                store.dispatch(addWarnToHistory("Cannot parse \"num_bins\". The value will be set automatically instead."));
            }
            numBins = "auto";
        }
        if (params.min == "log"){
            rangeMin = "auto";
            rangeMax = "auto";
            logFlag = true;
        }else{
            logFlag = params["[scale]"] == "log";
            if (!rangeMin || !rangeMax || rangeMin<0 || rangeMax<0){
                if (params.min != "auto" || params.max != "auto"){
                    store.dispatch(addWarnToHistory("Cannot parse the given input range (\"min\" and \"max\"). The values will be set automatically instead."));
                }
                rangeMin = "auto";
                rangeMax = "auto";
            } else {
                // Ensure min is always smaller than max
                if (rangeMin > rangeMax){
                    let temp = rangeMax;
                    rangeMax = rangeMin;
                    rangeMin = temp;
                }
            }
        }
    }

    const backendParameters = {
        region: region.toBackendFormat(),
        bins: numBins,
        min: rangeMin,
        max: rangeMax
    }

    console.log(backendParameters);

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
        if (logFlag){
            store.dispatch(addInfoToHistory("Option \"log\" is seen in the input. Thus Y axis is set to log scale."));
        }
        const opts = {
            title: "Graph Pixel: " + params.viewer_id,
            xaxis: "Pixel Value",
            logs: logFlag ? "y" : undefined
        }
        store.dispatch(createHistogram(histoData, opts));
    }

    LaunchTask("graph_pixel", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
