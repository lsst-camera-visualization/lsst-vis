import { LaunchTask } from "../util/firefly";
import { ParseRegion } from "../util/region";
import { clearBoxText, setBoxText } from "../actions/box.actions";
import { drawRegion, clearLayer } from "../actions/viewer.actions";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

// { viewer_id, box_id, region }
export default (params) => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameter - " + valid));
        return;
    }

    const viewer = store.getState().viewers[params.viewer_id];
    const region = ParseRegion(params.region) ||
                    ((typeof params.region === "object") ? params.region : null);

    // The parameters to pass to the backend
    const backendParameters = {
        region: region.toBackendFormat()
    };

    const onSuccess = data => {
        // Reset the viewer regions
        const regionLayer = "AVERAGE_PIXEL";
        store.dispatch(clearLayer(params.viewer_id, regionLayer));
        const regionOpts = {
            color: "blue"
        };
        store.dispatch(drawRegion(params.viewer_id, regionLayer, region, regionOpts));

        // Draw output result to box
        store.dispatch(clearBoxText(params.box_id));
        const boxOutput = [
            "Average Pixel",
            ["Viewer", params.viewer_id],
            ["Region", region.toString()],
            ":line-dashed:",
            ["Average pixel value", data.result]
        ];
        store.dispatch(setBoxText(params.box_id, boxOutput));
    }

    LaunchTask("average_pixel", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
