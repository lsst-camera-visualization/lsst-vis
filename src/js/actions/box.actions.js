

export const createBox = id => {
    return {
        type: "CREATE_BOX",
        id
    }
}

export const deleteBox = id => {
    return {
        type: "DELETE_BOX",
        id
    }
}

export const clearBoxText = id => {
    return {
        type: "CLEAR_BOXTEXT",
        id
    }
}

export const setBoxText = (id, text) => {
    return {
        type: "SET_BOXTEXT",
        id,
        text
    }
}

export const hideBox = id => {
    return {
        type: "HIDE_BOX",
        id
    }
}

export const showBox = id => {
    return {
        type: "SHOW_BOX",
        id
    }
}
