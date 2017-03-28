// payload = { command : String, params : map<String|Array<String>> }
export const executeCommand = (payload) => {
    return {
        type: "EXECUTE_COMMAND",
        payload
    }
}
