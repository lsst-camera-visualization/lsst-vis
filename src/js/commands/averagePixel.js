import { LaunchTask } from "../util/firefly";
import { ParseRegion } from "../util/region";
import { clearBoxText, setBoxText } from "../actions/box.actions.js";
import { drawRegion, clearLayer } from "../actions/viewer.actions.js";

import store from "../store";

// { viewer_id, box_id, region }
export default (params) => {
    const viewer = store.getState().viewers[params.viewer_id];
    const region = ParseRegion(params.region);

    // The parameters to pass to the backend
    const backendParameters = {
        ...region.toBackendFormat()
    }

    const onSuccess = data => {
        // Reset the viewer regions
        store.dispatch(clearLayer(params.viewer_id, "AVERAGE_PIXEL"));
        store.dispatch(drawRegion(params.viewer_id, "AVERAGE_PIXEL", region));

        // Draw output result to box
        store.dispatch(clearBoxText(params.box_id));
        store.dispatch(setBoxText(params.box_id, [data.result]));
    }

    LaunchTask("average", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
