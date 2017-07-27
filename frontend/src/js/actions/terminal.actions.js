

// Adds a command to the list of possible commands
export const addCommand = (commandName, params, desc) => {
    return {
        type: "ADD_COMMAND",
        commandName,
        params,
        desc
    };
}

// Adds a description for a parameter
export const addParameterDesc = (parameter, desc) => {
    return {
        type: "ADD_PARAMETER_DESC",
        parameter,
        desc
    };
}

// Adds a command to the terminal history
export const addCommandToHistory = plainInput => {
    return {
        type: "ADD_COMMAND_TO_HISTORY",
        payload: {
            plainInput
        }
    };
}

// Adds an error message to the terminal history
export const addErrorToHistory = error => {
    return {
        type: "ADD_ERROR_TO_HISTORY",
        error
    };
}

export const addWarnToHistory = warn => {
    const action = {
        type: "ADD_WARN_TO_HISTORY",
        warn
    };
    return action;
}

export const addInfoToHistory = info => {
    const action =  {
        type: "ADD_INFO_TO_HISTORY",
        info
    };
    return action;
}

// link must contain link and displayText
export const addLinkToHistory = link => {
    const action = {
        type: "ADD_LINK_TO_HISTORY",
        link
    };
    console.log(action);
    return action;
}

// Executes a command from the terminal
export const executeCommand = (command, params) => {
    return {
        type: "EXECUTE_COMMAND",
        payload: {
            command,
            params
        }
    };
}

// Sets the default value of a parameter, use null to delete the parameter
export const setDefault = (parameter_id, value) => {
    return {
        type: "SET_DEFAULT",
        parameter_id,
        value
    };
}
