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
        region: region.toBackendFormat()
    }

    const onSuccess = data => {
        // Reset the viewer regions
        const regionLayer = "NOISE";
        store.dispatch(clearLayer(params.viewer_id, regionLayer));
        const regionOpts = {
            color: "#33AA33"
        };
        store.dispatch(drawRegion(params.viewer_id, regionLayer, region, regionOpts));

        // Draw output result to box
        store.dispatch(clearBoxText(params.box_id));
        const boxOutput = [
            "Noise",
            ["Viewer", params.viewer_id],
            ["Region", region.toString()],
            ":line-dashed:",
            ["Noise", data.noise]
        ];
        store.dispatch(setBoxText(params.box_id, boxOutput));
    }

    LaunchTask("noise", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
