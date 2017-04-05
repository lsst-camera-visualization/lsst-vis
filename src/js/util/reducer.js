export const ReducerUtil = {
    AddElement: (state, id, object) => {
        return Object.assign({...state}, { [id]: object });
    },

    RemoveElement: (state, id) => {
        let newState = Object.assign({...state},{});
        delete newState[id];
        return newState;
    }
}
