import * as BoxActions from "../actions/box.actions";
import { setDefault } from "../actions/terminal.actions";
import { JSUtil } from "../util/jsutil";

import store from "../store";

// Creates a box and updates the default parameter for "box_id" if necessary
export const createBox = params => {
    store.dispatch(BoxActions.createBox(params.box_id));

    // If we are the only box, we automatically become the default
    if (JSUtil.ObjectToArray(store.getState().boxes).length === 1)
        store.dispatch(setDefault("box_id", params.box_id));
}

// Deletes a box and updates the default parameter for "box_id" if necessary
export const deleteBox = params => {
    store.dispatch(BoxActions.deleteBox(params.box_id));

    // If we were the last viewer, reset the default
    if (JSUtil.ObjectToArray(store.getState().boxes).length === 0)
        store.dispatch(setDefault("box_id", ""));
}

// Clears the text of a box
export const clearBoxText = params => {
    store.dispatch(BoxActions.clearBoxText(params.box_id));
}

// Minimizes a box
export const hideBox = params => {
    store.dispatch(BoxActions.hideBox(params.box_id));
}

// Maximizes a box
export const showBox = params => {
    store.dispatch(BoxActions.showBox(params.box_id));
}
