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

    // Helper copy function
    _copy = (me, other) => {
        me.history = other.history.slice();
        me.defaults = Object.assign({...other.defaults}, {});
        me.parameterDescs = Object.assign({...other.parameterDescs}, {});
        me._MAXLENGTH = other._MAXLENGTH;

        return me;
    }

    // Loads the terminal from the previous state
    loadFromState = state => {
        this._copy(this, state);
        this.history = state.history.filter(d => d.type !== "ERROR");
        this.index = this.history.length;
        return this;
    }

    // Clones this terminal into a new terminal object
    clone = () => {
        let c = this._copy(new Terminal(), this);
        c.autoCompleteArray = this.autoCompleteArray.clone();
        c.index = this.index;
        return c;
    }

    // Finds the last COMMAND message
    // Returns the message and the index
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

    // Trims the history to only have MAXLENGTH entries
    trimHistory = () => {
        const length = this.history.length;
        if (length > this._MAXLENGTH)
            this.history = this.history.slice(length - this._MAXLENGTH, length);

        this.index = this.history.length;
    }

    // Adds a new entry to the history
    addEntry = entry => {
        const last = this.findLastMessage(this.history.length - 1);
        if (this.history.length === 0 || (last && entry !== last.msg))
            this.history.push({ msg: entry, type: "COMMAND" });

        this.trimHistory();
    }

    // Adds a new error message to the history
    addError = error => {
        this.history.push({ msg: error, type: "ERROR" });

        this.trimHistory();
    }

    // Adds a command for this terminal to use
    addCommand = command => {
        this.autoCompleteArray.insert(command);
    }

    // Moves the history index up
    up = () => {
        this.index = Math.max(0, this.index - 1);
        return this.getEntry();
    }

    // Moves the history index down
    down = () => {
        this.index = Math.min(this.history.length, this.index + 1);
        return this.getEntry();
    }

    // Gets the current history entry
    getEntry = () => {
        if (this.index >= this.history.length)
            return "";
        const last = this.findLastMessage(this.index);
        if (last) {
            this.index = last.index;
            return last.msg;
        }
        return "";
    }

    // Sets the default value for a parameter
    setDefault = (parameter_id, value) => {
        if (value)
            this.defaults[parameter_id] = value;
        else
            delete this.defaults[parameter_id];
    }

    // Sets a description for a parameter
    setParameterDesc = (parameter, desc) => {
        this.parameterDescs[parameter] = desc;
    }
}
