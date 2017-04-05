

// Clears a layer on the viewer
export const clearLayer = (id, layer) => {
    return {
        type: "CLEAR_LAYER",
        id,
        layer
    }
}

// Creates a viewer
export const createViewer = id => {
    return {
        type: "CREATE_VIEWER",
        id
    }
}

// Deletes a viewer
export const deleteViewer = id => {
    return {
        type: "DELETE_VIEWER",
        id
    }
}

// Draws a single LSST region on the viewer
export const drawRegion = (id, layer, region, opts) => {
    return {
        type: "DRAW_REGIONS",
        id,
        layer,
        regions : [region],
        opts
    }
}

// Draws an array of LSST regions on the viewer
export const drawRegions = (id, layer, regions, opts) => {
    return {
        type: "DRAW_REGIONS",
        id,
        layer,
        regions,
        opts
    }
}

// Draws an array of DS9 regions on the viewer
export const drawDS9Regions = (id, layer, regions, opts) => {
    return {
        type: "DRAW_DS9REGIONS",
        id,
        layer,
        regions,
        opts
    }
}

// Sets the image's boundary regions
export const setBoundaryRegions = (id, regions) => {
    return {
        type: "SET_BOUNDARY_REGIONS",
        id,
        regions
    }
}

// Sets the image's header data
export const setHeaderData = (id, header) => {
    return {
        type: "SET_HEADER_DATA",
        header
    }
}

// Updates the cursor coordinates for a viewer
export const updateCursorPos = (id, pos) => {
    return {
        type: "UPDATE_CURSOR_POS",
        id,
        pos
    }
}
