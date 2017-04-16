import { JSUtil } from "../util/jsutil";

export class Terminal {
    constructor(history = [], defaults = {}) {
        this.history = history;
        this.defaults = defaults;
        this.parameterDescs = {};
        this.index = this.history.length;
        this._MAXLENGTH = 50;
        this.autoCompleteArray = new JSUtil.AutoCompleteArray([], false);
    }

    _copy = (me, other) => {
        me.history = other.history.slice();
        me.defaults = Object.assign({...other.defaults}, {});
        me.parameterDescs = Object.assign({...other.parameterDescs}, {});
        me.index = other.index;
        me._MAXLENGTH = other._MAXLENGTH;

        return me;
    }

    loadFromState = state => {
        this._copy(this, state);
        return this;
    }


    clone = () => {
        let c = this._copy(new Terminal(), this);
        c.autoCompleteArray = this.autoCompleteArray.clone();
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

    addCommand = command => {
        this.autoCompleteArray.insert(command);
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

    setDefault = (parameter_id, value) => {
        this.defaults[parameter_id] = value;
    }

    setParameterDesc = (parameter, desc) => {
        this.parameterDescs[parameter] = desc;
    }
}
