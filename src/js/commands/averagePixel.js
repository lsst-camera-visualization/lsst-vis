import { FireflyUtil } from "../util/FireflyUtil";
import { LSSTUtil } from "../util/LSSTUtil";
import { clearBoxText, setBoxText } from "../actions/box.actions.js";

// { viewer_id, box_id, region }
export default (params, store) => {
    const viewer = store.getState().viewers[params.viewer_id];

    const p = {
        ...LSSTUtil.Region.Parse(params.region).toBackendFormat()
    }

    const onSuccess = data => {
        store.dispatch(clearBoxText(params.box_id));
        store.dispatch(setBoxText(params.box_id, [data.result]));
    }

    FireflyUtil.LaunchTask("average", p, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
