import { applyMiddleware, createStore } from "redux";
import logger from 'redux-logger'
import reducer from "./reducers";

import { JSUtil } from "./util/jsutil";
import { addCommand, addParameterDesc, setCommandDispatcher } from "./actions/command.actions";
import CommandDispatcher from "./commands/commandDispatcher";

// Load Redux middleware
const middleware = [];
const bUseLogger = false;
if (process.env.NODE_ENV !== "production" && bUseLogger) {
    middleware.push(logger);
}

// Create the store
const store = createStore(
  reducer,
  applyMiddleware(...middleware)
);

// Save the state to local storage on any change
store.subscribe( () => {
    localStorage.setItem("state", JSON.stringify(store.getState()));
});


// If we are in production and using client.min.js, the commands and parameters files will
//    be at the current direction, not the parent.
const rootPath = (process.env.NODE_ENV !== "production") ? ".." : ".";

// Loads the commands
const loadCommands = () => {
    console.log("Loading commands");
    return JSUtil.LoadJSONFromFile(rootPath + "/commands.json")
        .then(data =>
            data.map( c => store.dispatch(addCommand(c.commandName, c.params, c.desc)))
        );
}

// Loads the parameter descriptions
const loadParameters = () => {
    console.log("Loading parameters");
    return JSUtil.LoadJSONFromFile(rootPath + "/parameters.json")
        .then(data =>
            JSUtil.ObjectKeyMap(data, d => store.dispatch(addParameterDesc(d, data[d])))
        );
}

loadCommands()
    .then(loadParameters)
    .catch(error => console.log(error));


window.store = store;

export default store;
