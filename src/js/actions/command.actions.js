export const addCommand = (commandName, params) => {
    return {
        type: "ADD_COMMAND",
        payload: {
            commandName,
            params
        }
    }
}

export const addCommandToHistory = plainInput => {
    return {
        type: "ADD_COMMAND_TO_HISTORY",
        payload: {
            plainInput
        }
    }
}

export const executeCommand = (command, params) => {
    return {
        type: "EXECUTE_COMMAND",
        payload: {
            command,
            params
        }
    }
}
