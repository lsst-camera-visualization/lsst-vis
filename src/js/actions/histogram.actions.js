

export const createHistogram = (data, opts) => {
    return {
        type: "CREATE_HISTOGRAM",
        data,
        opts
    }
}

export const deleteHistogram = id => {
    return {
        type: "DELETE_HISTOGRAM",
        id
    }
}
