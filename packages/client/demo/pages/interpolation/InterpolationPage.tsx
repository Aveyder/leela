import * as React from "react";
import {ReactElement, useRef} from "react";
import {useSelector} from "react-redux";
import {InterpolateOptions} from "../../../src/network/interpolation/interpolate";
import DemoAppState from "../../app/DemoAppState";

export default function InterpolationPage(): ReactElement {
    const interpolation = useSelector<DemoAppState>(state => state.interpolation) as InterpolateOptions;

    const phaserRef = useRef();

    return <>
        <div ref={phaserRef}/>
        <div>
            <div>
                <label htmlFor="interpolate">interpolate: </label>
                <input type="checkbox" name="interpolate" id="interpolate" checked={interpolation.interpolate}/>
            </div>
            <div>
                <label htmlFor="interpolateMs">interpolate ms: </label>
                <input type="number" name="interpolateMs" id="interpolateMs" value={interpolation.interpolateMs}/>
            </div>
            <div>
                <label htmlFor="extrapolate">extrapolate: </label>
                <input type="checkbox" name="extrapolate" id="extrapolate" checked={interpolation.extrapolate}/>
            </div>
            <div>
                <label htmlFor="extrapolateMaxMs">extrapolate max ms: </label>
                <input type="number" name="extrapolateMaxMs" id="extrapolateMaxMs" value={interpolation.extrapolateMaxMs}/>
            </div>
            <div>
                <label htmlFor="extrapolatePast">extrapolate past: </label>
                <input type="checkbox" name="extrapolatePast" id="extrapolatePast" checked={interpolation.extrapolatePast}/>
            </div>
        </div>
    </>
}

const initialState = {
    interpolate: true,
    interpolateMs: 100,
    extrapolate: true,
    extrapolateMaxMs: 250,
    extrapolatePast: true
} as InterpolateOptions;
