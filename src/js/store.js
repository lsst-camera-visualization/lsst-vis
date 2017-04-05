import { applyMiddleware, createStore } from "redux";
import logger from 'redux-logger'
import reducer from "./reducers";

import { JSUtil } from "./util/jsutil";
import { addCommand, setCommandDispatcher } from "./actions/command.actions";
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

// Load commands
JSUtil.LoadJSONFromFile(
    "../commands.json",
    data => { data.map( c => store.dispatch(addCommand(c.commandName, c.params)) ) },
    error => { console.log("Error: ", error); }
);

export default store;
