// Firefly interface

// Adds an action listener to a viewer
export const AddActionListener = (type, f) => {
    firefly.util.addActionListener(firefly.action.type[type], f);
}

// Adds an extension to a viewer
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
export const ClearLayer = (plotID, layer) => {
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

// Draws a firefly histogram
export const DrawHistogram = (plotID, data, width, height, options = {}) => {
    // Default values for options
    options = Object.assign({
        xaxis: "X-Axis Label",
        logs: ""
    }, options);

    let props = {
        series: data,
        width,
        height,
        desc: options.xaxis,
    };

    console.log(options);
    if (options.logs !== "")
        props.logs = options.logs;
    console.log(props);

    firefly.util.renderDOM(plotID, firefly.ui.Histogram, props);
}

// Loads an image into the plot id
export const LoadImage = (plotID, imageURL) => {
    firefly.showImage(plotID, {
        plotId: plotID,
        URL: imageURL,
        Title: imageURL,
        ZoomType: "TO_WIDTH",
        ZoomToWidth: "100%"
    });
}

// Launches a backend task
export const LaunchTask = (taskName, params, viewer) => {
    params._imageURL = (taskName === "boundary") ? viewer.original_image_url : viewer.image;
    return firefly.getJsonFromTask("python", taskName, params);
}

export const LaunchTableTask = (taskName, params, viewer) => {
    params._imageURL = (taskName === "boundary") ? viewer.original_image_url : viewer.image;
    params._type = ".csv";

    const tblReq = firefly.util.table.makeTblRequest(
        "TableFromExternalTask",
        taskName + " - " + viewer.id,
        {
            "launcher": "python",
            "task": taskName,
            "taskParams": params
        },
        {
            pageSize: 30
        }
    );

    firefly.showTable("table", tblReq);
}
