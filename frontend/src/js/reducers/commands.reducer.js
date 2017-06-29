import { JSUtil } from "../util/jsutil";

// List of all the commands
const initialState = {};

const commandsReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_COMMAND": {
            let newState = Object.assign({...state}, {});

            newState[action.commandName] = {
                params: action.params,
                desc: action.desc
            };

            return newState;
        }

        default:
            return state;
    }
}

export default commandsReducer;
