import * as React from "react";
import {ReactElement, useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import DemoAppState from "./DemoAppState";
import {Section} from "./Section";
import {set as setSection, unset as unsetSection} from "./SectionSlice";
import Interpolation from "../interpolation/Interpolation";

export default function DemoApp(): ReactElement {
    const dispatch = useDispatch();
    const section = useSelector<DemoAppState>(state => state.section);

    const openSection = useCallback((value: Section) => {
         if (value != section) {
             dispatch(setSection(value));
         }
    }, [dispatch, section]);

    let content: ReactElement;
    if (section) {
        switch (section) {
            case Section.INTERPOLATION:
                content = <Interpolation/>
                break;
            default:
                content = <ul>
                    <li><a href="#" onClick={() => openSection(Section.INTERPOLATION)}>Interpolation</a></li>
                </ul>
        }
    }

    return <>
        <h3>
            {
                section == Section.NONE ? "Demo List" : section.toString().toUpperCase()
            }:
        </h3>
        <hr/>
        {content}
        {
            section != Section.NONE && <a href="#" onClick={() => dispatch(unsetSection())}>&lt; back</a>
        }
    </>
}
