import * as BoxCommands from "./box.commands";
import * as ViewerCommands from "./viewer.commands";
import * as UVCommands from "./uv.commands";
import * as TerminalCommands from "./terminal.commands";
import averagePixel from "./averagePixel";
import graphPixel from "./graphPixel";
import graphProj from "./graphProj";
import hotPixel from "./hotPixel";
import noise from "./noise";

import { ParseRegion } from "../util/region";
import store from "../store";

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

    "uv_interval": UVCommands.setInterval,
    "uv_pause": UVCommands.pause,
    "uv_resume": UVCommands.resume,
    "uv_update": UVCommands.update,

    "average_pixel": averagePixel,
    "graph_pixel": graphPixel,
    "graph_proj": graphProj,
    "hot_pixel": hotPixel,
    "noise": noise,

    "set_default": TerminalCommands.setDefault,
};

const fixRegion = (viewerID, region) => {
    const parsed = ParseRegion(region);
    const viewer = store.getState().viewers[viewerID];

    if (!parsed) {
        if (typeof region === "object")
            return region;
        else if (region === "sel") {
            const selected = viewer.selectedRegion;
            return selected.hwregion.select(selected.name);
        }
        else if (typeof region === "string") {
            for (let i = 0; i < viewer.boundaryRegions.length; i++) {
                const r = viewer.boundaryRegions[i];
                if (r.test(region))
                    return r.select(region);
            }
        }
        else
            return null;
    }
    else
        return parsed;
}

class CommandDispatcher {
    dispatch = (command, params) => {
        if (command in commands) {
            // Update the region command if necessary
            if ("region" in params) {
                params.region = fixRegion(params.viewer_id, params.region);
                if (!params.region) {
                    console.log("INVALID REGION");
                    return;
                }
            }

            commands[command](params);
        }
    }
}

export default new CommandDispatcher();
