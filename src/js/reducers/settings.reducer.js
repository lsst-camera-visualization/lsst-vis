
const commands = {
    "EXTEND_SETTINGS": (state, action) => {
        return Object.assign({...state}, {...action.settings});
    },
}




const initialState = {

};

const settingsReducer = (state = initialState, action) => {
    if (action.type in commands)
        return commands[action.type](state, action);
    return state;
}

export default settingsReducer;
