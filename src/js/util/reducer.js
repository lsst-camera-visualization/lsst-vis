export const ReducerUtil = {
    // Adds an element to the UI element list
    AddElement: (state, id, object) => {
        return Object.assign({...state}, { [id]: object });
    },

    // Removes an element from the UI element list
    RemoveElement: (state, id) => {
        let newState = Object.assign({...state},{});
        delete newState[id];
        return newState;
    }
}
