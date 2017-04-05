import * as BoxCommands from "./box.commands";
import averagePixel from "./averagePixel";
import hotPixel from "./hotPixel";

// Maps command names to functions
const commands = {
    "create_box": BoxCommands.createBox,
    "delete_box": BoxCommands.deleteBox,
    "clear_box": BoxCommands.clearBoxText,

    "average_pixel": averagePixel,
    "hot_pixel": hotPixel
};

class CommandDispatcher {
    dispatch = (command, params) => {
        commands[command](params);
    }
}

export default new CommandDispatcher();
