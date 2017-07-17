import { LaunchTask } from "../util/firefly";
import { ParseBackendRegion } from "../util/region";
import * as HardwareRegions from "../util/hardwareregion";
import { clearLayer, drawDS9Regions, setBoundaryRegions } from "../actions/viewer.actions";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

// Parse CCD format
// data: An array of objects containing the boundary info
const parseCCD = data => {
    return data.map( ccd => {
        const name = ccd.name;
        const regions = {
            data: ParseBackendRegion(ccd.data)
        }

        return new HardwareRegions.CCD(name, regions);
    });
}

// Displays the boundary regions on a viewer
export const showBoundary = params => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameters: " + valid));
        return;
    }
    const viewerID = params.viewer_id;
    const viewers = store.getState().viewers;
    const viewer = viewers[viewerID];
    const regionLayer = "BOUNDARY";

    if (!viewer.boundaryRegions){
        const err = "Boundary not fetched for this image."
        console.log(err);
        return;
    }

    store.dispatch(clearLayer(viewerID, regionLayer));
    const regions = viewer.boundaryRegions;
    const opts = {
        color: "red",
        width: 1
    };

    // Draw the boundary regions
    store.dispatch(drawDS9Regions(viewerID, regionLayer, regions, opts));
}

export const hideBoundary = params => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameters: " + valid));
        return;
    }
    const viewerID = params.viewer_id;
    const viewers = store.getState().viewers;
    const viewer = viewers[viewerID];
    const regionLayer = "BOUNDARY";
    // TODO: move boundary functions to a separate js file
    if (!viewer.boundaryRegions){
        const err = "Boundary not fetched for this image."
        console.log(err);
        return;
    }
    store.dispatch(clearLayer(viewerID, regionLayer));
}

// Parse CCD with overscan format
// data: An array of objects containing the boundary info
const parseCCDOverscan = data => {
    return data.map( ccd => {
        const name = ccd.name;
        const regions = {
            data: ParseBackendRegion(ccd.data),
            pre:  ParseBackendRegion(ccd.pre),
            post: ParseBackendRegion(ccd.post),
            over: ParseBackendRegion(ccd.over)
        };

        return new HardwareRegions.CCDOverscan(name, regions);
    });
}



// Loads the hardware region boundaries.
// Because this is only called internally, it accepts the viewer to work on,
//      rather than a list of parameters enter by the user.
export default viewer => {
    const onSuccess = data => {
        const parsers = {
            "CCD": parseCCD,
            "CCD-OVERSCAN": parseCCDOverscan
        }
        console.log(data);
        if (data.type in parsers) {
            // Parse the regions
            const regions = parsers[data.type](data.data);
            store.dispatch(setBoundaryRegions(viewer.id, regions));
        }
        else {
            console.log("ERROR: INVALID BOUNDARY REGION TYPE");
        }
    }

    return LaunchTask("boundary", {}, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
