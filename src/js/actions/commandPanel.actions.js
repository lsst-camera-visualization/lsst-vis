

export const openCommandPanel = viewerID => {
    return {
        type: "OPEN_COMMANDPANEL",
        viewerID
    }
}

export const closeCommandPanel = () => {
    return {
        type: "CLOSE_COMMANDPANEL"
    }
}
