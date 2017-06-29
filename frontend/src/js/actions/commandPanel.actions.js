
// Opens the command panel, and sets the viewer to work on
export const openCommandPanel = (viewerID, region) => {
    return {
        type: "OPEN_COMMANDPANEL",
        viewerID,
        region
    }
}

// Hides the command panel
export const closeCommandPanel = () => {
    return {
        type: "CLOSE_COMMANDPANEL"
    }
}
