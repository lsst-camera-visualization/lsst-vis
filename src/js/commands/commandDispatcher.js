import * as BoxCommands from "./box.commands";
import averagePixel from "./averagePixel";

// Maps command names to functions
const commands = {
    "create_box": BoxCommands.createBox,
    "delete_box": BoxCommands.deleteBox,
    "clear_box": BoxCommands.clearBoxText,

    "average_pixel": averagePixel
};

export default class CommandDispatcher {
    constructor(store) {
        this._store = store;
    }

    dispatch = (command, params) => {
        commands[command](params, this._store);
    }
}
