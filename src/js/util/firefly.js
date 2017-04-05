// Firefly interface

export const AddActionListener = (type, f) => {
    firefly.util.addActionListener(firefly.action.type[type], f);
}

export const AddExtension = (id, title, type, f) => {
    const ext = {
        id: title,
        plotId: id,
        title: title,
        extType: type,
        callback: f
    };

    firefly.util.image.extensionAdd(ext);
}

// Clears a region layer on a viewer
export const ClearRegion = (plotID, layer) => {
    firefly.action.dispatchDeleteRegionLayer(layer, plotID);
}

// Draws regions on a viewer
export const DrawRegions = (plotID, layer, regions, options = {}) => {
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
}

// Loads an image into the plot id
export const LoadImage = (plotID, imageURL) => {
    firefly.showImage(plotID, {
        plotId: plotID,
        URL: imageURL,
        Title: "Title: " + imageURL,
        ZoomType: "TO_WIDTH",
        ZoomToWidth: '100%'
    });
}

// Launches a backend task
export const LaunchTask = (taskName, params, viewer) => {
    params.image_url = (taskName === "boundary") ? viewer.original_image_url : viewer.image;

    return firefly.getJsonFromTask('python', taskName, params);
}
