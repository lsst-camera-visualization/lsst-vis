import { AddActionListener } from "./firefly";
import * as ViewerActions from "../actions/viewer.actions";
import loadBoundary from "../commands/loadBoundary";
import { ClearLayer, DrawRegions } from "../util/firefly";
import { JSUtil } from "../util/jsutil";

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

        /*loadBoundary(this).then( () => {
            const regions = this.boundaryRegions;
            const opts = {
                color: "red",
                width: 1
            };
            // Draw the boundary regions
            store.dispatch(drawDS9Regions(this.id, "BOUNDARY", regions, opts));
        });*/

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

    calculateHoveredSeg = () => {
        if (this.header) {
            const boundary = this.header.BOUNDARY_OVERSCAN || this.header.BOUNDARY;
            const numAmps = this.header.NUM_AMPS;
            const segSize = this.header.SEG_SIZE || this.header.SEG_DATASIZE;

            const h = {
                x: Math.floor(this.cursorPoint.x / segSize.x),
                y: numAmps.y - 1 - Math.floor(this.cursorPoint.y / segSize.y)
            };
            if (h.y >= 0 && h.x >= 0 && h.y < boundary.length && h.x < boundary[0].length)
                return h;
        }

        return null;
    }

    calculateHoveredAmpName = () => {
        const boundary = this.header.BOUNDARY_OVERSCAN || this.header.BOUNDARY;
        const segSize = this.header.SEG_SIZE || this.header.SEG_DATASIZE;
        const overscan = {
            pre: this.header.OVERSCAN.PRE,
            post: this.header.OVERSCAN.POST,
            over: this.header.OVERSCAN.OVER
        };

        const h = this.calculateHoveredSeg();
        let name = null;
        if (h) {
            name = "amp" + h.y.toString() + h.x.toString();
            let s = {
                x: this.cursorPoint.x % segSize.x,
                y: this.cursorPoint.y % segSize.y
            };

            const seg = boundary[h.y][h.x];
            if (seg.reverse_slice.y)
                s.y = segSize.y - s.y;
            if (seg.reverse_slice.x)
                s.x = segSize.x - s.x;

            if (s.y >= overscan.over)
                name += "overscan";
            else if (s.x < overscan.pre)
                name += "prescan";
            else if (s.x >= overscan.post)
                name += "postscan";
            else
                name += "data";
        }

        return name;
    }

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

        const name = null;//this.calculateHoveredAmpName();
        if (name)
            store.dispatch(ViewerActions.updateHoveredAmpName(this.id, name));
    }
}


export class UVController {
    constructor(viewerID, imageRepo) {
        this._viewer = viewerID;
        this._imageRepo = imageRepo;

        this.setInterval(3000);

        this.pause();
        this.resume();
    }

    destroy() {
        clearInterval(this._timerID);
    }

    query = () => {
        // TODO: Query image repository and do stuff with the data
        console.log("query");
    }

    setInterval(newInterval) {
        this._interval = newInterval;

        this._timerID = setInterval(this.query, this._interval);
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
