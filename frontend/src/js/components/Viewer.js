import React from "react";
import Draggable from 'react-draggable';
import Resizable from "react-resizable-box";

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
            imageURL: null,
            ffWidth: 700,
            ffHeight: 640
        };
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

    handleOnResize = (event, direction, refToElement, delta) => {
        const heightPadding = 10 + 2 + 6;
        if (this.refToCol2 && this.refToSelectPanel && this.refToTitle){
            this.setState({
                ffWidth: refToElement.clientWidth,
                ffHeight: refToElement.clientHeight - this.refToCol2.clientHeight - this.refToSelectPanel.clientHeight - this.refToTitle.clientHeight - heightPadding
            });
        }else {
            this.setState((prevState) => {
                return {
                    ffWidth: prevState.ffWidth + delta.width,
                    ffHeight: prevState.ffHeight + delta.height
                };
            });
        }

    }

    render() {
        const id = this.props.id;
        const e = this.props.viewers[id];

        const hoveredName = e.hovered ? e.hovered.name : "";

        const cursorPanel = <ViewerCursorPanel
                                cursorPoint={e.cursorPoint}
                                pixelValue={e.pixelValue}
                                hoveredName={hoveredName} />
        const uvPanel = <ViewerUVPanel viewerID={id}/>;

        const resizeEnable = {
            top:false,
            right:true,
            bottom:true,
            left:false,
            topRight:false,
            bottomRight:true,
            bottomLeft:false,
            topLeft:false
        };

        return (
            <Draggable
                defaultPosition={{x: 50, y: 30}}
                handle=".viewer-title">
                <div className="viewer-ctr">
                <Resizable
                    className="viewer-resize"
                    width="700"
                    height="900"
                    onResizeStop={this.handleOnResize}
                    enable={resizeEnable}>
                    <ReactUtil.Toolbar
                        onClose={this.handleClose}>
                        <p className="viewer-title"
                            ref={elem => this.refToTitle = elem}>
                            {id}
                        </p>
                        </ReactUtil.Toolbar>
                        
                        <ViewerImageViewer
                            e={e}
                            height={this.state.ffHeight}
                            width={this.state.ffWidth}
                            onClick={this.handleSelectRegion}
                            onDblClick={this.handleSelectRegionWhole} />

                        <ReactUtil.Col2
                            className="viewer-info"
                            width="50%"
                            left={cursorPanel}
                            right={uvPanel}
                            separator={true}
                            col2Ref={elem => this.refToCol2 = elem}/>
                        <ViewerSelectedPanel
                            selectedRegion={e.selectedRegion}
                            onClick={this.handleExecuteOverSelected}
                            col2Ref={elem => this.refToSelectPanel = elem}/>
                </Resizable>
                </div>
            </Draggable>
        );
    }
}
