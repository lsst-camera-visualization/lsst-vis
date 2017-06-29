
const commands = {
    "EXTEND_SETTINGS": (state, action) => {
        let newState = Object.assign({...state}, {...action.settings});
        localStorage.setItem("settings", JSON.stringify(newState));
        return newState;
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
