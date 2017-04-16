import * as BoxCommands from "./box.commands";
import * as ViewerCommands from "./viewer.commands";
import * as TerminalCommands from "./terminal.commands";
import averagePixel from "./averagePixel";
import graphPixel from "./graphPixel";
import hotPixel from "./hotPixel";
import noise from "./noise";

// Maps command names to functions
const commands = {
    "create_box": BoxCommands.createBox,
    "delete_box": BoxCommands.deleteBox,
    "clear_box": BoxCommands.clearBoxText,
    "hide_box": BoxCommands.hideBox,
    "show_box": BoxCommands.showBox,

    "create_viewer": ViewerCommands.createViewer,
    "delete_viewer": ViewerCommands.deleteViewer,
    "show_boundary": ViewerCommands.showBoundary,
    "clear_viewer": ViewerCommands.clearViewer,
    "load_image": ViewerCommands.loadImage,

    "average_pixel": averagePixel,
    "graph_pixel": graphPixel,
    "hot_pixel": hotPixel,
    "noise": noise,

    "set_default": TerminalCommands.setDefault,
};

class CommandDispatcher {
    dispatch = (command, params) => {
        commands[command](params);
    }
}

export default new CommandDispatcher();
