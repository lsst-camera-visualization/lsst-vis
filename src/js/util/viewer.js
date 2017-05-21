import { AddActionListener } from "./firefly";
import * as ViewerActions from "../actions/viewer.actions";
import loadBoundary from "../commands/loadBoundary";
import { ClearLayer, DrawRegions } from "../util/firefly";
import { JSUtil } from "../util/jsutil";

import store from "../store";

export class Viewer {
    constructor(id, image = "http://localhost:8080/static/images/imageE2V_untrimmed.fits") {
        this.id = id;
        this.image = image;
        this.original_image_url = "http://localhost:8080/static/images/imageE2V.fits";
        this.layers = [];

        this.cursorPoint = { x: 0, y: 0 };

        loadBoundary(this).then( () => {
            // Display options
            const opts = {
                color: "red",
                width: 1
            };

            // Create the list of ds9 regions from all of the boundary regions
            let regions = [];
            for (let i = 0; i < this.boundaryRegions.length; i++) {
                const b = this.boundaryRegions[i];
                regions = regions.concat(b.toDS9());
            }
            store.dispatch(drawDS9Regions(this.id, "BOUNDARY", regions, opts));
        });

        AddActionListener("READOUT_DATA", this.onCursorMove);
    }

    removeLayer = layer => {
        const idx = this.layers.indexOf(layer);
        if (idx !== -1) {
            ClearLayer(this.id, layer);
            this.layers.splice(idx, 1);
        }
    }

    removeAllLayers = () => {
        JSUtil.Foreach(this.layers, layer => {
            ClearLayer(this.id, layer);
        });
        this.layers = [];
    }

    drawRegions = (layer, regions, opts) => {
        if (this.layers.indexOf(layer) === -1)
            this.layers.push(layer);

        DrawRegions(this.id, layer, regions, opts);
    }

    loadImage = image => {
        this.image = image;
    }

    calculateHoveredAmpName = () => {
        for (let i = 0; i < this.boundaryRegions.length; i++) {
            const b = this.boundaryRegions[i];
            const displayName = b.contains(this.cursorPoint);
            if (displayName !== null)
                return { name: displayName, hwregion: b };
        }

        // Weird interaction if we get here
        return null;
    }

    // Firefly callback function
    onCursorMove = action => {
        const imgPt = action.payload.readoutItems.imagePt;
        if (imgPt)
            store.dispatch(ViewerActions.updateCursorPos(this.id, imgPt.value));

        let value = "";
        if (action.payload.hasValues) {
            const v = action.payload.readoutItems.nobandFlux.value;
            if (v !== undefined)
                value = v;
        }
        store.dispatch(ViewerActions.updatePixelValue(this.id, value));

        const amp = this.calculateHoveredAmpName();
        if (amp)
            store.dispatch(ViewerActions.updateHoveredAmpName(this.id, amp.name, amp.hwregion));
    }
}
