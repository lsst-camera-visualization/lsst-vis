export class Box {
    constructor(id) {
        this.id = id;
        this.clearText();
    }

    loadFromState = state => {
        this.id = state.id;
        this.clearText();
        return this;
    }

    clearText = () => {
        this.text = [];
    }

    setText = text => {
        this.text.push(text);
    }
}
