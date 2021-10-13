import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InterpolateOptions} from "../../src/network/interpolation/interpolate";
import {act} from "react-dom/test-utils";

const initialState = {
    interpolate: true,
    interpolateMs: 100,
    extrapolate: true,
    extrapolateMaxMs: 250,
    extrapolatePast: true
} as InterpolateOptions;

const interpolationSlice = createSlice({
    name: "interpolation",
    initialState,
    reducers: {
        setInterpolate: (state, action: PayloadAction<boolean>) => {
            state.interpolate = action.payload
        },
        setInterpolateMs: (state, action: PayloadAction<number>) => {
            state.interpolateMs = action.payload
        },
        setExtrapolate: (state, action: PayloadAction<boolean>) => {
            state.extrapolate = action.payload
        },
        setExtrapolateMaxMs: (state, action: PayloadAction<number>) => {
            state.extrapolateMaxMs = action.payload
        },
        setExtrapolatePast: (state, action: PayloadAction<boolean>) => {
            state.extrapolatePast = action.payload
        },
    }
});

const { setInterpolate, setInterpolateMs, setExtrapolate, setExtrapolateMaxMs, setExtrapolatePast } = interpolationSlice.actions;

export default interpolationSlice.reducer;
