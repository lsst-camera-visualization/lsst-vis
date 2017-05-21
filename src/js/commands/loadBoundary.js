import { LaunchTask } from "../util/firefly";
import { ParseBackendRegion } from "../util/region";
import * as HardwareRegions from "../util/hardwareregion";
import { setBoundaryRegions } from "../actions/viewer.actions";

import store from "../store";

// Parse CCD format
// data: An array of objects containing the boundary info
const parseCCD = data => {
    return data.map( ccd => {
        const name = ccd.name;
        const regions = {
            data: ParseBackendRegion(ccd.data)
        }

        return HardwareRegions.CCD(name, regions);
    });
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
        }

        return HardwareRegions.CCDOverscan(name, regions);
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
            console.log(regions);

            store.dispatch(setBoundaryRegions(regions));
        }
        else {
            console.log("ERROR: INVALID BOUNDARY REGION TYPE");
        }
    }

    return LaunchTask("boundary", {}, viewer)
        .then( onSuccess, error => console.log("Error: ", error) )
}
