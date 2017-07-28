import * as MiscActions from "../actions/misc.actions.js";
import {addErrorToHistory} from "../actions/terminal.actions.js";
import store from "../store";

export const setSetting = params => {

    if (!params.setting_name){
        store.dispatch(addErrorToHistory("Please specify the name of the new setting."));
    }

    if (!params.new_value){
        store.dispatch(addErrorToHistory("Please specify the new value"));
        return;
    }

    const newSettings = {
        [params.setting_name]: params.new_value
    };

    store.dispatch(MiscActions.extendSettings(newSettings));
}
