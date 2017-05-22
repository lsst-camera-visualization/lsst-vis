import React from "react";
import Draggable from 'react-draggable';

import ViewerImageViewer from "./Viewer/ViewerImageViewer";
import ViewerUVPanel from "./Viewer/ViewerUVPanel";
import ViewerCursorPanel from "./Viewer/ViewerCursorPanel";
import ViewerSelectedPanel from "./Viewer/ViewerSelectedPanel";
import { ReactUtil } from "../util/react";
import commandDispatcher from "../commands/commandDispatcher";

export default class Viewer extends React.Component {
    constructor() {
        super();

        this.state = {
            imageURL: null
        }
    }

    // On click handler for executing command over selected region
    handleExecuteOverSelected = e => {
        this.props.onExecuteOverSelected(this.props.id);
    }

    // On click handler for closing the viewer
    handleClose = () => {
        commandDispatcher.dispatch("delete_viewer", { viewer_id: this.props.id });
    }

    render() {
        const id = this.props.id;
        const e = this.props.viewers[id];

        const cursorPanel = <ViewerCursorPanel
                        cursorPoint={e.cursorPoint}
                        pixelValue={e.pixelValue}
                        hovered={e.hovered} />
        const uvPanel = <ViewerUVPanel />;

        return (
            <Draggable
                defaultPosition={{x: 100, y: 50}}
                cancel=".viewer-imgViewer" >
                <div className="viewer-ctr">
                    <ReactUtil.Toolbar
                        onClose={this.handleClose}>
                        <p className="viewer-title">{id}</p>
                        <ViewerImageViewer e={e} />
                        <ReactUtil.Col2
                            className="viewer-info"
                            width="50%"
                            left={cursorPanel}
                            right={uvPanel}
                            separator={true} />
                        <ViewerSelectedPanel
                            onClick={this.handleExecuteOverSelected} />
                    </ReactUtil.Toolbar>
                </div>
            </Draggable>
        );
    }
}
