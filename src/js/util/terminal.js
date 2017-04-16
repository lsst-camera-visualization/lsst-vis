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
        me._MAXLENGTH = other._MAXLENGTH;

        return me;
    }

    loadFromState = state => {
        this._copy(this, state);
        this.history = state.history.filter(d => d.type !== "ERROR");
        this.index = this.history.length;
        return this;
    }


    clone = () => {
        let c = this._copy(new Terminal(), this);
        c.autoCompleteArray = this.autoCompleteArray.clone();
        c.index = this.index;
        return c;
    }

    findLastMessage = index => {
        for (let i = index; i >= 0; i--) {
            if (this.history[i].type === "COMMAND") {
                return {
                    msg: this.history[i].msg,
                    index: i
                };
            }
        }
    }

    trimHistory = () => {
        const length = this.history.length;
        if (length > this._MAXLENGTH)
            this.history = this.history.slice(length - this._MAXLENGTH, length);

        this.index = this.history.length;
    }

    addEntry = entry => {
        if (this.history.length === 0 ||
                entry !== this.findLastMessage(this.history.length - 1).msg)
            this.history.push({ msg: entry, type: "COMMAND" });

        this.trimHistory();
    }

    addError = error => {
        this.history.push({ msg: error, type: "ERROR" });

        this.trimHistory();
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
        const last = this.findLastMessage(this.index);
        this.index = last.index;
        return last.msg;
    }

    setDefault = (parameter_id, value) => {
        this.defaults[parameter_id] = value;
    }

    setParameterDesc = (parameter, desc) => {
        this.parameterDescs[parameter] = desc;
    }
}
