import * as BoxCommands from "./box.commands";
import * as ViewerCommands from "./viewer.commands";
import averagePixel from "./averagePixel";
import hotPixel from "./hotPixel";

// Maps command names to functions
const commands = {
    "create_box": BoxCommands.createBox,
    "delete_box": BoxCommands.deleteBox,
    "clear_box": BoxCommands.clearBoxText,

    "create_viewer": ViewerCommands.createViewer,
    "delete_viewer": ViewerCommands.deleteViewer,
    "show_boundary": ViewerCommands.showBoundary,

    "average_pixel": averagePixel,
    "hot_pixel": hotPixel
};

class CommandDispatcher {
    dispatch = (command, params) => {
        commands[command](params);
    }
}

export default new CommandDispatcher();
