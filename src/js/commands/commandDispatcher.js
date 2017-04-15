import * as BoxCommands from "./box.commands";
import * as ViewerCommands from "./viewer.commands";
import averagePixel from "./averagePixel";
import graphPixel from "./graphPixel";
import hotPixel from "./hotPixel";
import noise from "./noise";

// Maps command names to functions
const commands = {
    "create_box": BoxCommands.createBox,
    "delete_box": BoxCommands.deleteBox,
    "clear_box": BoxCommands.clearBoxText,

    "create_viewer": ViewerCommands.createViewer,
    "delete_viewer": ViewerCommands.deleteViewer,
    "show_boundary": ViewerCommands.showBoundary,

    "average_pixel": averagePixel,
    "graph_pixel": graphPixel,
    "hot_pixel": hotPixel,
    "noise": noise
};

class CommandDispatcher {
    dispatch = (command, params) => {
        commands[command](params);
    }
}

export default new CommandDispatcher();
