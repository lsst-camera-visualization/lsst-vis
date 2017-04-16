export class Box {
    constructor(id) {
        this.id = id;
        this.bMini = false;
        this.clearText();
    }

    loadFromState = state => {
        this.id = state.id;
        this.bMini = state.bMini;
        this.clearText();
        return this;
    }

    clearText = () => {
        this.text = [];
    }

    setText = text => {
        this.text.push(text);
    }

    minimize = () => {
        this.bMini = true;
    }

    maximize = () => {
        this.bMini = false;
    }
}
