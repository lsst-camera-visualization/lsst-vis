import { applyMiddleware, createStore } from "redux";
import logger from 'redux-logger'
import reducer from "./reducers";

import { JSUtil } from "./util/jsutil";
import { addCommand, addParameterDesc, setCommandDispatcher } from "./actions/terminal.actions";
import CommandDispatcher from "./commands/commandDispatcher";
import { extendSettings } from "./actions/misc.actions";

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
const dataPath = ((process.env.NODE_ENV !== "production") ? ".." : ".") + "/data";

// Loads the commands
const loadCommands = () => {
    console.log("Loading commands");
    return JSUtil.LoadJSONFromPath(dataPath + "/commands.json")
        .then(data =>
            data.map( c => store.dispatch(addCommand(c.commandName, c.params, c.desc)))
        );
}

// Loads the parameter descriptions
const loadParameters = () => {
    console.log("Loading parameters");
    return JSUtil.LoadJSONFromPath(dataPath + "/parameters.json")
        .then(data =>
            JSUtil.ObjectKeyMap(data, d => store.dispatch(addParameterDesc(d, data[d])))
        );
}

loadCommands()
    .then(loadParameters)
    .catch(error => console.log(error));

// Load the default settings
JSUtil.LoadFileContents("settings.ini")
    .then(data => {
        const entries = data.match(/[^\r\n]+/g);
        let settings = { _defaults: {} };

        let savedSettings = localStorage.getItem("settings");
        if (savedSettings)
            savedSettings = JSON.parse(savedSettings);
        else
            savedSettings = {};

        entries.map(e => {
            let key, value;
            [key, value] = e.split(/=/);
            settings[key] = value;
            settings._defaults[key] = value;

            const stored = savedSettings[key];
            if (stored)
                settings[key] = stored;
        });

        store.dispatch(extendSettings(settings));
    })
    .catch(error => null);


// For debugging
if (process.env.NODE_ENV !== "production")
    window.store = store;

export default store;
