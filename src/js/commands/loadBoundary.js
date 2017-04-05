import { LaunchTask } from "../util/firefly";
import { setHeaderData, setBoundaryRegions } from "../actions/viewer.actions";
import { JSUtil } from "../util/jsutil";

import store from "../store";

// Loads the hardware region boundaries.
// Because this is only called internally, it accepts the viewer to work on,
//      rather than a list of parameters enter by the user.
export default viewer => {
    const onSuccess = data => {
        // Set the header data
        store.dispatch(setHeaderData(viewer.id, data));

        // Calculate the boundary regions
        let regions = [];
        const segWidth  = data.SEG_SIZE.x;
        const segHeight = data.SEG_SIZE.y;
        // From overscan
        for (let i = 0; i < data.NUM_AMPS.x; i++) {
            for (let j = 0; j < data.NUM_AMPS.y; j++) {
                const x = i * segWidth  + segWidth  / 2;
                const y = j * segHeight + segHeight / 2;
                regions.push(["box", x, y, segWidth, segHeight, 0].join(" "));
            }
        }
        JSUtil.Foreach(data.BOUNDARY_OVERSCAN, d =>
            JSUtil.Foreach(d, d2 =>
                regions.push(["box", d2.x, d2.y, d2.width, d2.height, 0].join(" "))
            )
        );

        // Set the boundary regions in the viewer
        store.dispatch(setBoundaryRegions(viewer.id, regions));
    }

    return LaunchTask("boundary", {}, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
