import { Util } from "./Util";

// Firefly interface
export const FireflyUtil = {
    // Clears a region layer on a viewer
    ClearRegion: (plotID, layer) => {
        firefly.action.dispatchDeleteRegionLayer(layer, plotID);
    },

    // Draws regions on a viewer
    DrawRegions: (plotID, layer, regions, options = {}) => {
        // Default values for options
        options = Object.assign({
            color: "blue",
            width: 3
        }, options);

        const prefix = "image; ";
        const optString = " #color=" + options.color + " width=" + options.width;

        // Creates the DS9 regions
        const ds9regions = regions.map( r => prefix + r + optString );
        firefly.action.dispatchCreateRegionLayer(layer, layer, null, ds9regions, plotID);
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
