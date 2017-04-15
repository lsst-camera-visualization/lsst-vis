

export const createHistogram = (data, opts) => {
    return {
        type: "CREATE_HISTOGRAM",
        data,
        opts
    }
}
