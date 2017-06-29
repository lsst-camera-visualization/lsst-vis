
// Creates a box
export const createBox = id => {
    return {
        type: "CREATE_BOX",
        id
    }
}

// Deletes a box
export const deleteBox = id => {
    return {
        type: "DELETE_BOX",
        id
    }
}

// Clears the text in the box body
export const clearBoxText = id => {
    return {
        type: "CLEAR_BOXTEXT",
        id
    }
}

// Sets the text in the box body
// @text should be an array, each entry is a new line
// See BoxBody.js for possible inputs
export const setBoxText = (id, text) => {
    return {
        type: "SET_BOXTEXT",
        id,
        text
    }
}

// Minimizes a box to its title bar
export const hideBox = id => {
    return {
        type: "HIDE_BOX",
        id
    }
}

// Maximizes a box from its title bar
export const showBox = id => {
    return {
        type: "SHOW_BOX",
        id
    }
}
