import React from "react";
import Draggable from 'react-draggable';

import ViewerImageViewer from "./Viewer/ViewerImageViewer";
import ViewerUVPanel from "./Viewer/ViewerUVPanel";
import ViewerCursorPanel from "./Viewer/ViewerCursorPanel";
import ViewerSelectedPanel from "./Viewer/ViewerSelectedPanel";
import { ReactUtil } from "../util/react";

export default class Viewer extends React.Component {
    constructor() {
        super();

        this.state = {
            imageURL: null
        }
    }

    render() {
        const id = this.props.id;
        const e = this.props.viewers[id];

        const cursorPanel = <ViewerCursorPanel
                        cursorPoint={e.cursorPoint}
                        pixelValue={e.pixelValue}
                        hoveredAmpName={e.hoveredAmpName} />
        const uvPanel = <ViewerUVPanel />;

        return (
            <Draggable
                defaultPosition={{x: 100, y: 50}}
                cancel=".viewer-imgViewer" >
                <div className="viewer-ctr">
                    <p className="viewer-title">{id}</p>
                    <ViewerImageViewer e={e} />
                    <ReactUtil.Col2
                        className="viewer-info"
                        width="50%"
                        left={cursorPanel}
                        right={uvPanel}
                        separator={true} />
                    <ViewerSelectedPanel />
                </div>
            </Draggable>
        );
    }
}
