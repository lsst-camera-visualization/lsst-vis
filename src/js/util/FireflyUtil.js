import { Util } from "./Util";

// Firefly interface
export const FireflyUtil = {
    // Clears a region layer on a viewer
    ClearRegion: (plotID, layer) => {
        firefly.action.dispatchDeleteRegionLayer(layer, plotID);
    },

    // Draws DS9 regions on a viewer
    DrawRegions: (plotID, layer, regions, options) => {
        // Default values for options
        options = Object.assign({
            color: "white",
            width: 1
        }, options);

        // Creates the DS9 regions
        const regionsToDraw = regions.map( r =>
            "image; " + r + " # color=" + options.color + " width=" + options.width + ";"
        );

        firefly.action.dispatchCreateRegionLayer(layer, layer, null, regionsToDraw, plotID);
    },

    // Loads an image into the plot id
    LoadImage: (plotID, imageURL) => {
        firefly.showImage(plotID, {
            plotId: plotID,
            URL: imageURL,
            Title: "Title: " + imageURL,
            ZoomType: "TO_WIDTH",
            ZoomToWidth: '100%'
        });
    },

    // Launches a backend task
    LaunchTask: (taskName, params, viewer) => {
        params.image_url = (taskName === "boundary") ? viewer.original_image_url : viewer.image;

        return firefly.getJsonFromTask('python', taskName, params);
    },
}
