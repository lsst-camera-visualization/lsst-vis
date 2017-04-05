import { AddActionListener } from "./firefly";
import { drawDS9Regions, updateCursorPos } from "../actions/viewer.actions";
import loadBoundary from "../commands/loadBoundary";

import store from "../store";

export class Viewer {
    constructor(id, image = "http://localhost:8080/static/images/imageE2V_untrimmed.fits") {
        this.id = id;
        this.image = image;
        this.original_image_url = "http://localhost:8080/static/images/imageE2V.fits";

        this.cursorPoint = { x: 0, y: 0 };

        loadBoundary(this).then( () => {
            const regions = this.boundaryRegions;
            const opts = {
                color: "red",
                width: 1
            };
            // Draw the boundary regions
            store.dispatch(drawDS9Regions(this.id, "BOUNDARY", regions, opts));
        });

        AddActionListener("READOUT_DATA", this.onCursorMove);
    }

    setImage = image => {
        this.image = image;
    }

    onCursorMove = action => {
        const imgPt = action.payload.readoutItems.imagePt;
        if (imgPt)
            store.dispatch(updateCursorPos(this.id, imgPt.value));
    }
}
