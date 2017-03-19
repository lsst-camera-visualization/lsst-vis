

// payload = { command : String, params : map<String|Array<String>> }
export const executeCommand = (payload) => {
    return {
        type: "EXECUTE_COMMAND",
        payload
    }
}

// payload = { commandName : String, params : Array<String> }
export const addCommand = payload => {
    return {
        type: "ADD_COMMAND",
        payload
    }
}
