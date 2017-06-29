import { AddActionListener, AddExtension } from "../util/firefly";
import * as ViewerActions from "../actions/viewer.actions";
import loadBoundary from "../commands/loadBoundary";
import { ClearLayer, DrawRegions } from "../util/firefly";
import { JSUtil } from "../util/jsutil";
import { openCommandPanel } from "../actions/commandPanel.actions";
import { Rectangle } from "../util/region";

import store from "../store";

const defaultImage = (process.env.NODE_ENV !== "production") ?
    "http://localhost:8080/static/images/imageE2V_untrimmed.fits" :
    "http://lsst.cs.illinois.edu/static/images/imageE2V_untrimmed.fits";

const defaultImageTrimmed = (process.env.NODE_ENV !== "production") ?
    "http://localhost:8080/static/images/imageE2V.fits" :
    "http://lsst.cs.illinois.edu/static/images/imageE2V.fits";

export class Viewer {
    constructor(id, image = defaultImage) {
        this.id = id;
        this.image = image;
        this.original_image_url = defaultImageTrimmed;
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

            const a = ViewerActions.drawDS9Regions(this.id, "BOUNDARY", regions, opts);
            store.dispatch(a);
        });

        AddActionListener("READOUT_DATA", this.onCursorMove);

        AddExtension(id, "Choose command", "AREA_SELECT", this.onChooseCommand);
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
        if (!this.boundaryRegions)
            return null;

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

    // Firefly callback function
    onChooseCommand = action => {
        const r = new Rectangle(action.ipt0.x, action.ipt0.y, action.ipt1.x, action.ipt1.y);
        store.dispatch(openCommandPanel(this.id, r));
    }
}

// Update viewer controller
// Querys an image repository and updates the target viewer's image, if necessary
export class UVController {
    constructor(viewerID, imageRepo) {
        this._viewer = viewerID;
        this._imageRepo = imageRepo;

        this.setInterval(3000);
        this.pause();
    }

    destroy() {
        clearInterval(this._timerID);
    }

    query = () => {
        const imageRepo = store.getState().settings.imagerepo;
        if (imageRepo) {
            JSUtil.LoadJSONFromPath(imageRepo)
                .then(data => {
                    const imageURL = data.uri;
                    store.dispatch(ViewerActions.loadImage(this._viewer, imageURL));
                })
                .catch(error => null);
        }
    }

    setInterval(newInterval) {
        this.destroy();

        this._interval = newInterval;
        this._timerID = setInterval(this.query, this._interval);
    }

    reset() {
        if (!this._bPaused)
            this.setInterval(this._interval);
    }

    pause() {
        this._bPaused = true;
        this.destroy();
    }

    resume() {
        this._bPaused = false;
        this.setInterval(this._interval);
    }
}
