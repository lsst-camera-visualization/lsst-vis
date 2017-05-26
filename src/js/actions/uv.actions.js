
export const setUVInterval = (id, interval) => {
    return {
        type: "UV_INTERVAL",
        id,
        interval
    }
}

export const pauseUV = id => {
    return {
        type: "UV_PAUSE",
        id
    }
}

export const resumeUV = id => {
    return {
        type: "UV_RESUME",
        id
    }
}
