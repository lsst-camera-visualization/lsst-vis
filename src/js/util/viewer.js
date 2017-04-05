import { FireflyUtil } from "./firefly";
import store from "../store";
import { updateCursorPos } from "../actions/viewer.actions";

export class Viewer {
    constructor(id, image = "http://localhost:8080/static/images/imageE2V_untrimmed.fits") {
        this.id = id;
        this.image = image;

        this.cursorPoint = { x: 0, y: 0 };

        FireflyUtil.AddActionListener("READOUT_DATA", this.onCursorMove);
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
