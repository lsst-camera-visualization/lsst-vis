export class Box {
    constructor(id) {
        this.id = id;
        this.bMini = false;
        this.clearText();
    }

    // Loads a box from the previous state
    loadFromState = state => {
        this.id = state.id;
        this.bMini = state.bMini;
        this.clearText();
        return this;
    }

    // Clears the text in this box
    clearText = () => {
        this.text = [];
    }

    // Sets the new text for this box
    setText = text => {
        this.text = text;
    }

    // Minimizes this box to the title bar
    minimize = () => {
        this.bMini = true;
    }

    // Maximizes this box to the title bar
    maximize = () => {
        this.bMini = false;
    }
}
