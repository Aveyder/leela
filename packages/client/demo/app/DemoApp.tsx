import * as React from "react";
import {ReactElement, useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import DemoAppState from "./DemoAppState";
import {Section, sectionPages} from "./Section";
import {set as setSection, unset as unsetSection} from "./SectionSlice";

export default function DemoApp(): ReactElement {
    const dispatch = useDispatch();
    const section = useSelector<DemoAppState>(state => state.section) as string;

    const openSection = useCallback((value: Section) => {
         if (value != section) {
             dispatch(setSection(value));
         }
    }, [dispatch, section]);

    let content: ReactElement;
    if (section != Section.NONE) {
        content = sectionPages[section];
    } else {
        content = <ul>
            <li><a href="#" onClick={() => openSection(Section.INTERPOLATION)}>Interpolation</a></li>
        </ul>
    }

    return <>
        <h3>
            {
                section == Section.NONE ? "Leela Demo" : section.toString().toUpperCase()
            }:
        </h3>
        <hr/>
        {content}
        {
            section != Section.NONE && <a href="#" onClick={() => dispatch(unsetSection())}>&lt; back</a>
        }
    </>
}
