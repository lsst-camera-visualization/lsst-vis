import { applyMiddleware, createStore } from "redux";
import logger from 'redux-logger'
import reducer from "./reducers";

import { JSUtil } from "./util/jsutil";
import { addCommand, addParameterDesc, setCommandDispatcher } from "./actions/command.actions";
import CommandDispatcher from "./commands/commandDispatcher";

const middleware = [];
const bUseLogger = false;
if (process.env.NODE_ENV !== "production" && bUseLogger) {
    middleware.push(logger);
}

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
);

// Save the state to local storage on any change
store.subscribe( () => {
    localStorage.setItem("state", JSON.stringify(store.getState()));
});

// Loads the commands
const loadCommands = () => {
    console.log("Loading commands");
    return JSUtil.LoadJSONFromFile("../commands.json")
        .then(data =>
            data.map( c => store.dispatch(addCommand(c.commandName, c.params, c.desc)))
        );
}

// Loads the parameter descriptions
const loadParameters = () => {
    console.log("Loading parameters");
    return JSUtil.LoadJSONFromFile("../parameters.json")
        .then(data =>
            JSUtil.ObjectKeyMap(data, d => store.dispatch(addParameterDesc(d, data[d])))
        );
}

loadCommands()
    .then(loadParameters)
    .catch(error => console.log(error));


window.store = store;

export default store;
