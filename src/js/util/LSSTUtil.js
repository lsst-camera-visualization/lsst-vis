import { Util } from "../util/Util";

export const LSSTUtil = {
    Rectangle: class {
        constructor(x1, y1, x2, y2) {
            this._x1 = Math.trunc(Math.min(x1, x2));
            this._x2 = Math.trunc(Math.max(x1, x2));
            this._y1 = Math.trunc(Math.min(y1, y2));
            this._y2 = Math.trunc(Math.max(y1, y2));
        }

        toDS9() {
            const width  = this._x2 - this._x1;
            const height = this._y2 - this._y1;
            return ['box', this._x1 + (width / 2.), this._y1 + (height / 2.), width, height, 0].join(' ');
        }

        toBackendFormat() {
            return {
                type: "rect",
                value: {
                    x1: this._x1,
                    x2: this._x2,
                    y1: this._y1,
                    y2: this._y2
                }
            }
        }
    },

    Circle: class {

    },

    Region: {
        Parse: region => {
            if (Array.isArray(region)) {
                if (region[0] === "rect")
                    return new LSSTUtil.Rectangle(region[1], region[2], region[3], region[4]);
                else
                    return new LSSTUtil.Circle(region[1], region[2], region[3]);
            }
        }
    },



    Box: class {
        constructor(id) {
            this.id = id;
            this.clearText();
        }

        clearText() {
            this.text = [];
        }

        setText(text) {
            this.text.push(text);
        }
    },

    Viewer: class {
        constructor(id, image = "http://localhost:8080/static/images/imageE2V_untrimmed.fits") {
            this.id = id;
            this.image = image;
        }

        setImage = image => {
            this.image = image;
        }
    },

    Terminal: class {
        constructor(history = [], defaults = {}) {
            this.history = history;
            this.defaults = defaults;
        }

        clone() {
            let c = new LSSTUtil.Terminal();
            c.history = this.history.slice();
            c.defaults = Object.assign({...this.defaults}, {});

            return c;
        }
    },



    MapParamsToNames: (paramValues, paramDesc) => {
        let result = {};
        Util.Foreach(paramDesc, (p,i) => { result[p] = paramValues[i]; } );
        return result;
    }
}
