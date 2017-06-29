import * as MiscActions from "../actions/misc.actions";
import store from "../store";

export const setSetting = params => {
    if (!params.new_value) {
        params.new_value = store.getState().settings._defaults[params.setting_name];
    }

    const newSettings = {
        [params.setting_name]: params.new_value
    };
    store.dispatch(MiscActions.extendSettings(newSettings));
}
