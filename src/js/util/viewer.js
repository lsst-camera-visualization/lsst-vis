import { AddActionListener } from "./firefly";
import { drawDS9Regions, updateCursorPos, updateHoveredAmpName } from "../actions/viewer.actions";
import loadBoundary from "../commands/loadBoundary";

import store from "../store";

export class Viewer {
    constructor(id, image = "http://localhost:8080/static/images/imageE2V_untrimmed.fits") {
        this.id = id;
        this.image = image;
        this.original_image_url = "http://localhost:8080/static/images/imageE2V.fits";

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

    setImage = image => {
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
            store.dispatch(updateCursorPos(this.id, imgPt.value));

        const name = this.calculateHoveredAmpName();
        if (name)
            store.dispatch(updateHoveredAmpName(this.id, name));
    }
}
