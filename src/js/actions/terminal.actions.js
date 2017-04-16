export const addCommand = (commandName, params, desc) => {
    return {
        type: "ADD_COMMAND",
        commandName,
        params,
        desc
    }
}

export const addParameterDesc = (parameter, desc) => {
    return {
        type: "ADD_PARAMETER_DESC",
        parameter,
        desc
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

export const addErrorToHistory = error => {
    return {
        type: "ADD_ERROR_TO_HISTORY",
        error
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

export const setDefault = (parameter_id, value) => {
    return {
        type: "SET_DEFAULT",
        parameter_id,
        value
    }
}
