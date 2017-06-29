const initialState = {
    show: false,
    viewerID: "",
    region: ""
}

const commandPanelReducer = (state = initialState, action) => {
    switch (action.type) {
        case "OPEN_COMMANDPANEL": {
            return Object.assign({...state}, {
                show: true,
                viewerID: action.viewerID,
                region: action.region
            });
        }

        case "CLOSE_COMMANDPANEL": {
            return Object.assign({...state}, {
                show: false,
                viewerID: "",
                region: ""
            });
        }

        default:
            return state;
    }
}

export default commandPanelReducer;
