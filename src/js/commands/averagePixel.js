import { FireflyUtil } from "../util/FireflyUtil";
import { LSSTUtil } from "../util/LSSTUtil";
import { clearBoxText, setBoxText } from "../actions/box.actions.js";
import { drawRegion, clearLayer } from "../actions/viewer.actions.js";

// { viewer_id, box_id, region }
export default (params, store) => {
    const viewer = store.getState().viewers[params.viewer_id];
    const region = LSSTUtil.Region.Parse(params.region);

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

    FireflyUtil.LaunchTask("average", backendParameters, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
