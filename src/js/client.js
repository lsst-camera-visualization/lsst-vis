import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "./reducers";

import { AppCtr } from "./containers/AppCtr";
import { Util } from "./util/Util";
import { addCommand } from "./actions/command.actions";

let store = createStore(reducer);

const app = document.getElementById("app");

// Load commands
Util.LoadJSONFromFile(
    "../commands.json",
    data => { data.map( (command) => store.dispatch(addCommand(command)) ) },
    error => { console.log("Error: ", error); }
)

window.store = store;

ReactDOM.render(
    <Provider store={store}>
        <AppCtr />
    </Provider>,
    app
);
