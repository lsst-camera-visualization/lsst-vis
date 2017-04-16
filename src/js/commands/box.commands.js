import * as BoxActions from "../actions/box.actions";
import { setDefault } from "../actions/terminal.actions";
import { JSUtil } from "../util/jsutil";

import store from "../store";

export const createBox = params => {
    store.dispatch(BoxActions.createBox(params.box_id));

    // If we are the only box, we automatically become the default
    if (JSUtil.ObjectToArray(store.getState().boxes).length === 1)
        store.dispatch(setDefault("box_id", params.box_id));
}

export const deleteBox = params => {
    store.dispatch(BoxActions.deleteBox(params.box_id));

    // If we were the last viewer, reset the default
    if (JSUtil.ObjectToArray(store.getState().boxes).length === 0)
        store.dispatch(setDefault("box_id", ""));
}

export const clearBoxText = params => {
    store.dispatch(BoxActions.clearBoxText(params.box_id));
}

export const hideBox = params => {
    store.dispatch(BoxActions.hideBox(params.box_id));
}

export const showBox = params => {
    store.dispatch(BoxActions.showBox(params.box_id));
}
