import { JSUtil } from "../util/jsutil";

const initialState = {
    commands: []
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
            newState.commands = Object.assign({...state.commands}, newCommand);
            return newState;
        }

        default:
            return state;
    }
}

export default commandsReducer;
