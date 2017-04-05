import { FireflyUtil } from "./firefly";

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
        console.log(action);
        const imgPt = action.payload.readoutItems.imagePt;
        if (imgPt) {
            this.cursorPoint = {
                x: imgPt.value.x,
                y: imgPt.value.y
            }
        }
    }
}
