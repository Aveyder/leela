import {configureStore} from "@reduxjs/toolkit";

import sectionReducer from "../app/SectionSlice";
import interpolateReducer from "../interpolation/InterpolationSlice";
import DemoAppState from "../app/DemoAppState";

const store = configureStore<DemoAppState>({
    reducer: {
        section: sectionReducer,
        interpolation: interpolateReducer,
    }
});

export {
    DemoAppState,
    store
};
