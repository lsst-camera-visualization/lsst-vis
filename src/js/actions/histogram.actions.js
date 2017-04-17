
// Creates a histogram
export const createHistogram = (data, opts) => {
    return {
        type: "CREATE_HISTOGRAM",
        data,
        opts
    }
}

// Deletes a histogram
export const deleteHistogram = id => {
    return {
        type: "DELETE_HISTOGRAM",
        id
    }
}
