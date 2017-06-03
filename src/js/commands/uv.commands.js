import * as UVActions from "../actions/uv.actions";

import store from "../store";

export const setInterval = params => {
    store.dispatch(UVActions.setUVInterval(params.viewer_id, params.interval_in_ms));
}

export const pause = params => {
    store.dispatch(UVActions.pauseUV(params.viewer_id));
}

export const resume = params => {
    store.dispatch(UVActions.resumeUV(params.viewer_id));
}

export const update = params => {
    store.dispatch(UVActions.updateUV(params.viewer_id));
}
