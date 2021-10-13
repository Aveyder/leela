import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Section} from "./Section";
import {act} from "react-dom/test-utils";

const sectionSlice = createSlice({
    name: "section",
    initialState: Section.INTERPOLATION,
    reducers: {
        set: (state, action: PayloadAction<Section>) => action.payload,
        unset: (state) => Section.NONE
    }
});

export const { set, unset } = sectionSlice.actions;

export default sectionSlice.reducer;
