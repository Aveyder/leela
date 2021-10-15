import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Section} from "./Section";

const sectionSlice = createSlice({
    name: "section",
    initialState: Section.NONE,
    reducers: {
        set: (state, action: PayloadAction<Section>) => action.payload,
        unset: (state) => Section.NONE
    }
});

export const { set, unset } = sectionSlice.actions;

export default sectionSlice.reducer;
