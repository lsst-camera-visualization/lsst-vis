import { AddActionListener, AddExtension } from "../util/firefly";
import * as ViewerActions from "../actions/viewer.actions";
import { loadBoundary } from "../commands/boundary.commands";
import { ClearLayer, DrawRegions } from "../util/firefly";
import { JSUtil } from "../util/jsutil";
import { openCommandPanel } from "../actions/commandPanel.actions";
import { Rectangle } from "../util/region";

import store from "../store";

// CCD level (two images with and without overscan)
const defaultImage = () => {
    let image = store.getState().settings.defaultImage;
    // If default image is not set in settings, make a default for it.
    if (image && (image == "")){
        const ccdWithOverscan = "https://www.dropbox.com/s/3n571i6ak648gmy/default-untrimmed.fits?dl=1";

        const ccdWithoutOverscan = "https://www.dropbox.com/s/e7g1rynikrqbxlc/default-trimmed.fits?dl=1";

        // Raft level is not recommended since it takes long to download.
        const raftWithoutOverscan = "https://www.dropbox.com/s/k18d9x2hr2otj2y/20170304160038.fits?dl=1";

        image = ccdWithoutOverscan;
    }
    return image;
};

export class Viewer {
    constructor(id, image = defaultImage()) {
        this.id = id;
        this.image = image;
        this.layers = [];
        this.isBoundaryDisplayed = false;

        this.cursorPoint = { x: 0, y: 0 };

        AddActionListener("READOUT_DATA", this.onCursorMove);

        AddExtension(id, "Choose command", "AREA_SELECT", this.onChooseCommand);

        loadBoundary(this);
    }

    removeRegionLayer = layer => {
        const idx = this.layers.indexOf(layer);
        if (idx !== -1) {
            ClearLayer(this.id, layer);
            this.layers.splice(idx, 1);
            if (layer == "BOUNDARY"){
                this.isBoundaryDisplayed = false;
            }
        }
    }

    removeAllRegionLayers = () => {
        JSUtil.Foreach(this.layers, layer => {
            ClearLayer(this.id, layer);
        });
        this.isBoundaryDisplayed = false;
        this.layers = [];
    }

    drawRegions = (layer, regions, opts) => {
        if (this.layers.indexOf(layer) === -1)
            this.layers.push(layer);

        if (layer=="BOUNDARY"){
            this.isBoundaryDisplayed = true;
        }
        DrawRegions(this.id, layer, regions, opts);
    }

    loadImage = image => {
        this.removeAllRegionLayers();
        this.image = image;
        loadBoundary(this);
        console.log(this);
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
        const imageRepo = store.getState().settings.imageRepo;
        const requestUri = (this.since) ? (imageRepo+"?since="+this.since.toString()+"&wait="+Math.floor(this._interval/1000)) : (imageRepo);
        if (requestUri) {
            JSUtil.QueryFromURI(requestUri)
                .then(data => {
                    if (data.isNewImage) {
                        const imageURL = data.uri;
                        this.since = data.timestamp;
                        store.dispatch(ViewerActions.loadImage(this._viewer, imageURL));
                    } else {
                        console.log("There are no new images.");
                    }
                })
                .catch(error => console.error("Cannot load image requested", error));
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
