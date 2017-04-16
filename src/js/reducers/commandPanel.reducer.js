const initialState = {
    hide: true,
    viewerID: ""
}

const commandPanelReducer = (state = initialState, action) => {
    switch (action.type) {
        case "OPEN_COMMANDPANEL": {
            return Object.assign({...state}, {
                show: true,
                viewerID: action.viewerID
            });
        }

        case "CLOSE_COMMANDPANEL": {
            return Object.assign({...state}, {
                show: false,
                viewerID: ""
            });
        }

        default:
            return state;
    }
}

export default commandPanelReducer;
