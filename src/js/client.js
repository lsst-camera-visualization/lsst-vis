import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import logger from 'redux-logger'
import reducer from "./reducers";

import AppCtr from "./containers/App.container";
import { Util } from "./util/Util";

import { addCommand, setCommandDispatcher } from "./actions/command.actions";
import { createViewer } from "./actions/viewer.actions";
import CommandDispatcher from "./commands/commandDispatcher";


const middleware = [];
const bUseLogger = false;
if (process.env.NODE_ENV !== "production" && bUseLogger) {
    middleware.push(logger);
}

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)

// Save the state to local storage on any change
store.subscribe( () => {
    localStorage.setItem("state", JSON.stringify(store.getState()));
});

const app = document.getElementById("app");

// Load commands
Util.LoadJSONFromFile(
    "../commands.json",
    data => { data.map( c => store.dispatch(addCommand(c.commandName, c.params)) ) },
    error => { console.log("Error: ", error); }
);

window.onFireflyLoaded = function() {
    store.dispatch(createViewer("ffview"));
}

store.dispatch(setCommandDispatcher(new CommandDispatcher(store)));

// For debugging
window.store = store;

ReactDOM.render(
    <Provider store={store}>
        <AppCtr />
    </Provider>,
    app
);
