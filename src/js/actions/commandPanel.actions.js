
// Opens the command panel, and sets the viewer to work on
export const openCommandPanel = viewerID => {
    return {
        type: "OPEN_COMMANDPANEL",
        viewerID
    }
}

// Hides the command panel
export const closeCommandPanel = () => {
    return {
        type: "CLOSE_COMMANDPANEL"
    }
}
