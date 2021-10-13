import {interpolate, Interpolator} from "../src/network/interpolation/interpolate";
import * as React from "react";
import * as ReactDOM from "react-dom";
import DemoApp from "./app/DemoApp";
import {Provider} from "react-redux";
import {store} from "./state/store";

const container = injectContainer();

ReactDOM.render(
    <Provider store={store}>
        <DemoApp/>
    </Provider>, container
);

function injectContainer(): HTMLElement {
    const div = document.createElement("div");

    div.style.height = "100%";
    div.style.backgroundColor = "#fbfbfb";

    document.body.append(div);

    return div;
}

type Point = {x: number, y: number};

const interpolator: Interpolator<Point> = (p1, p2, progress) => {
    return {
        x: (p2.x - p1.x) * progress + p1.x,
        y: (p2.y - p1.y) * progress + p1.y
    };
};

const result = interpolate(150, [
    {
        state: {x: 10, y: 10},
        timestamp: 50
    },
    {
        state: {x: 20, y: 20},
        timestamp: 100
    }
], interpolator, {
    interpolate: true,
    interpolateMs: 150,
    extrapolate: true,
    extrapolateMaxMs: 250,
    extrapolatePast: true
});
