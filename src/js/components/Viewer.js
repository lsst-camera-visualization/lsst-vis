import React from "react";
import Draggable from 'react-draggable';

import ViewerImageViewer from "./Viewer/ViewerImageViewer";
import ViewerUVPanel from "./Viewer/ViewerUVPanel";
import ViewerCursorPanel from "./Viewer/ViewerCursorPanel";
import { ReactUtil } from "../util/ReactUtil";

export default class Viewer extends React.Component {
    constructor() {
        super();

        this.state = {
            imageURL: null
        }
    }

    render() {
        const id = this.props.id;

        const left = <ViewerCursorPanel />
        const right = <ViewerUVPanel />;

        return (
            <Draggable
                defaultPosition={{x: 100, y: 50}}
                cancel=".viewer-imgViewer" >
                <div className="viewer-ctr">
                    <p className="viewer-title">{id}</p>
                    <ViewerImageViewer e={this.props.viewers[id]} />
                    <ReactUtil.Col2
                        className="viewer-info"
                        width="50%"
                        left={left}
                        right={right}
                        separator={true} />
                </div>
            </Draggable>
        );
    }
}
