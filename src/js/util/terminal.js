export class Terminal {
    constructor(history = [], defaults = {}) {
        this.history = history;
        this.defaults = defaults;
        this.index = this.history.length;
        this._MAXLENGTH = 50;
    }

    loadFromState = state => {
        this.history = state.history.slice();
        this.defaults = Object.assign({...state.defaults}, {});
        this.index = state.index;
        this._MAXLENGTH = 50;
        return this;
    }


    clone = () => {
        let c = new Terminal();
        c.history = this.history.slice();
        c.defaults = Object.assign({...this.defaults}, {});
        c.index = this.index;
        c._MAXLENGTH = this._MAXLENGTH;

        return c;
    }

    addEntry = entry => {
        if (entry !== this.history[this.history.length - 1])
            this.history.push(entry);

        const length = this.history.length;
        if (length > this._MAXLENGTH)
            this.history = this.history.slice(length - this._MAXLENGTH, length);

        this.index = this.history.length;
    }

    up = () => {
        this.index = Math.max(0, this.index - 1);
        return this.getEntry();
    }

    down = () => {
        this.index = Math.min(this.history.length, this.index + 1);
        return this.getEntry();
    }

    getEntry = () => {
        if (this.index >= this.history.length)
            return "";
        return this.history[this.index];
    }
}
