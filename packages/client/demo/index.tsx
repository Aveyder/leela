import * as React from "react";
import * as ReactDOM from "react-dom";
import DemoApp from "./app/DemoApp";
import {Provider} from "react-redux";
import {store} from "./app/store";

const container = injectContainer();

ReactDOM.render(
    <Provider store={store}>
        <DemoApp/>
    </Provider>, container
);

function injectContainer(): HTMLElement {
    const div = document.createElement("div");

    div.style.height = "100%";

    document.body.append(div);

    return div;
}
