import { JSUtil } from "../util/jsutil";

const initialState = {
    commands: [],
    parameters: {},
    autoCompleteArray: new JSUtil.AutoCompleteArray([], false)
}

const commandsReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_COMMAND": {
            let newState = {};
            const newCommand = {
                [action.commandName]: {
                    params: action.params,
                    desc: action.desc
                }
            };
            newState.autoCompleteArray = state.autoCompleteArray.clone();
            newState.autoCompleteArray.insert(action.commandName);
            newState.commands = Object.assign({...state.commands}, newCommand);
            return newState;
        }

        case "ADD_PARAMETER_DESC": {
            let p = Object.assign({...state.parameters}, {[action.parameter]: action.desc});
            let newState = Object.assign({...state}, {});
            newState.parameters = p;
            console.log("newState: ", newState);
            return newState;
        }

        default:
            return state;
    }
}

export default commandsReducer;
