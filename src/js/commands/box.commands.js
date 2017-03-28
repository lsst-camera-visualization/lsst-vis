import * as BoxActions from "../actions/box.actions";

export const createBox = (params, store) => {
    store.dispatch(BoxActions.createBox(params["box_id"]));
}

export const deleteBox = (params, store) => {
    store.dispatch(BoxActions.deleteBox(params["box_id"]));
}

export const clearBoxText = (params, store) => {
    store.dispatch(BoxActions.clearBoxText(params["box_id"]));
}
