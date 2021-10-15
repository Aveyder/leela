import * as React from "react";
import InterpolationPage from "../pages/interpolation/InterpolationPage";

enum Section {
    NONE = "none",
    INTERPOLATION = "interpolation"
}

const sectionPages = {
    [Section.INTERPOLATION]: <InterpolationPage/>
};

export {
    Section,
    sectionPages
};
