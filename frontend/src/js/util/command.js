import { JSUtil } from "./jsutil";

// Validates parameters based on their value
const parameterValidators = {
    box_id: (parameter, state) => {
        if (!(parameter in state.boxes))
            return "Invalid box ID!";
        return null;
    },

    scale: (parameter, state) => {
        if (parameter !== "log" && parameter !== "lin")
            return "Invalid scaling, try 'lin' or 'log'";
        return null;
    },

    "[scale]": (parameter, state) => {
        if (parameter !== undefined)
            return parameterValidators.scale(parameter, state);
        return null;
    },

    viewer_id: (parameter, state) => {
        if (!(parameter in state.viewers))
            return "Invalid viewer ID!";
        return null;
    },
}

// Used to validate the user entered parameters for a task
export const validateParameters = (parameters, state) => {
    // Loop through each parameter, and validate if necessary
    for (const p in parameters) {
        if (parameters.hasOwnProperty(p) && p in parameterValidators) {
            const valid = parameterValidators[p](parameters[p], state);
            if (valid !== null)
                return valid;
        }
    }

    return null;
}
