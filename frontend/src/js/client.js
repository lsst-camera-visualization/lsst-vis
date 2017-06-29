import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";

import AppCtr from "./containers/App.container";
import { createViewer } from "./actions/viewer.actions";


const app = document.getElementById("app");

window.onFireflyLoaded = function() {
    store.dispatch(createViewer("ffview"));
}

ReactDOM.render(
    <Provider store={store}>
        <AppCtr />
    </Provider>,
    app
);
