import { LaunchTask } from "../util/firefly";
import { ParseBackendRegion } from "../util/region";
import * as HardwareRegions from "../util/hardwareregion";
import { clearLayer, drawDS9Regions, setBoundaryRegions } from "../actions/viewer.actions";
import { validateParameters } from "../util/command";
import { addErrorToHistory } from "../actions/terminal.actions";

import store from "../store";

const layerName = "BOUNDARY";

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
export const showBoundary = (params) => {
    if (!validateBoundaryCommandInput(params)){
        return;
    }

    const viewers = store.getState().viewers;
    const viewer = viewers[params.viewer_id];
    store.dispatch(clearLayer(viewer.id, layerName));
    const regions = viewer.boundaryRegionsDS9;
    const opts = {
        color: "red",
        width: 1
    };
    // Draw the boundary regions
    store.dispatch(drawDS9Regions(viewer.id, layerName, regions, opts));
}

export const hideBoundary = (params) => {
    if (!validateBoundaryCommandInput(params)){
        return;
    }
    const viewers = store.getState().viewers;
    const viewer = viewers[params.viewer_id];
    checkBoundary(viewer);

    store.dispatch(clearLayer(viewer.id, layerName));
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

const checkBoundary = (viewer) => {
    if (!viewer.boundaryRegions || !viewer.boundaryRegionsDS9) {
        const err = "Boundary not fetched for this image. Try to fetch now."
        console.log(err);
        loadBoundary(viewer);
    }
}

const validateBoundaryCommandInput = (params) => {
    const valid = validateParameters(params, store.getState());
    if (valid !== null) {
        store.dispatch(addErrorToHistory("Bad parameters: " + valid));
        return false;
    }
    return true;
}
// Loads the hardware region boundaries.
// Because this is only called internally, it accepts the viewer to work on,
//      rather than a list of parameters enter by the user.
export const loadBoundary = (viewer) => {
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
            const opts = {
                color: "red",
                width: 1
            };
            store.dispatch(drawDS9Regions(viewer.id, layerName, viewer.boundaryRegionsDS9, opts));
        }
        else {
            console.log("ERROR: INVALID BOUNDARY REGION TYPE");
        }
    }

    return LaunchTask("boundary", {}, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
