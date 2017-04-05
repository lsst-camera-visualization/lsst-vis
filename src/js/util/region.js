

export class Rectangle {
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
}

export class Circle {

}

export const ParseRegion = region => {
    if (Array.isArray(region)) {
        if (region[0] === "rect")
            return new Rectangle(region[1], region[2], region[3], region[4]);
        else
            return new Circle(region[1], region[2], region[3]);
    }
}
