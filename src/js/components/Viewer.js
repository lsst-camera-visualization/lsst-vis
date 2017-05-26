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
        const viewer = this.props.viewers[this.props.id];
        const sel = viewer.selectedRegion;
        const region = sel.hwregion.select(sel.name);
        this.props.onExecuteOverSelected(this.props.id, region);
    }

    // On click handler for closing the viewer
    handleClose = () => {
        commandDispatcher.dispatch("delete_viewer", { viewer_id: this.props.id });
    }

    handleSelectRegion = (e) => {
        if (e.shiftKey)
            this.props.onSelectRegion(this.props.id, this.props.viewers[this.props.id].hovered);
    }

    handleSelectRegionWhole = (e) => {
        if (e.shiftKey) {
            let hovered = this.props.viewers[this.props.id].hovered;
            hovered.name = hovered.name.split(/-/)[0];
            this.props.onSelectRegion(this.props.id, hovered);
        }
    }

    render() {
        const id = this.props.id;
        const e = this.props.viewers[id];

        const cursorPanel = <ViewerCursorPanel
                        cursorPoint={e.cursorPoint}
                        pixelValue={e.pixelValue}
                        hoveredAmpName={e.hoveredAmpName} />
        const uvPanel = <ViewerUVPanel
                            onPause={this.props.onUVPause.bind(this, id)}
                            onResume={this.props.onUVResume.bind(this, id)} />;

        return (
            <Draggable
                defaultPosition={{x: 100, y: 50}}
                cancel=".viewer-imgViewer" >
                <div className="viewer-ctr">
                    <ReactUtil.Toolbar
                        onClose={this.handleClose}>
                        <p className="viewer-title">{id}</p>
                        <ViewerImageViewer
                            e={e}
                            onClick={this.handleSelectRegion}
                            onDblClick={this.handleSelectRegionWhole} />
                        <ReactUtil.Col2
                            className="viewer-info"
                            width="50%"
                            left={cursorPanel}
                            right={uvPanel}
                            separator={true} />
                        <ViewerSelectedPanel
                            selectedRegion={e.selectedRegion}
                            onClick={this.handleExecuteOverSelected} />
                    </ReactUtil.Toolbar>
                </div>
            </Draggable>
        );
    }
}
