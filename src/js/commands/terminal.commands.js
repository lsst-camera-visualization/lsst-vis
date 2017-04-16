import * as TerminalActions from "../actions/terminal.actions";

import store from "../store";

export const setDefault = params => {
    store.dispatch(TerminalActions.setDefault(params.parameter_id, params.new_default_value));
}
