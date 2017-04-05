import { JSUtil } from "../util/jsutil";

const initialState = {
    commands: [],
    autoCompleteArray: new JSUtil.AutoCompleteArray([], false)
}

const commandsReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_COMMAND":
            let newState = {};
            const newCommand = { [action.payload.commandName]: action.payload.params };
            newState.autoCompleteArray = state.autoCompleteArray.clone();
            newState.autoCompleteArray.insert(action.payload.commandName);
            newState.commands = Object.assign({...state.commands}, newCommand);

            return newState;

        default:
            return state;
    }
}

export default commandsReducer;
