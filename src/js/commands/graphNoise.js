import { LaunchTableTask } from "../util/firefly";
import { ParseRegion } from "../util/region";
import { createHistogram, drawHistogram } from "../actions/histogram.actions";
import { drawRegion, clearLayer } from "../actions/viewer.actions";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

// { viewer_id }
export default (params) => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameter - " + valid));
        return;
    }

    const viewer = store.getState().viewers[params.viewer_id];

    // The parameters to pass to the backend
    const backendParameters = {
        regions: []
    };

    viewer.boundaryRegions.map( (r) => {
        const region = {
            name: r.name,
            data: r.regions.data.toBackendFormat(),
            pre:  r.regions.pre.toBackendFormat(),
            post: r.regions.post.toBackendFormat(),
            over: r.regions.over.toBackendFormat(),
        };

        backendParameters.regions.push(region);
    });
    console.log(backendParameters);

    LaunchTableTask("graphNoise", backendParameters, viewer);
}
