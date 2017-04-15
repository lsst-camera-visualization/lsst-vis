import React from "react";

import { ReactUtil } from "../../util/react";

export default class ViewerCursorPanel extends React.Component {
    render() {
        const coords = "(" + this.props.cursorPoint.x + ", " + this.props.cursorPoint.y + ")";
        const cursorInfo = (
            <div className="viewer-cursorPanel-col">
                <p>{coords}</p>
                <p>Pixel Value: {this.props.pixelValue}</p>
            </div>
        );

        const hoveredSeg = (
            <div className="viewer-cursorPanel-col">
                <p>Hovered Segment:</p>
                <p>{this.props.hoveredAmpName}</p>
            </div>
        );

        return (
            <div className="viewer-info-panel viewer-cursorPanel">
                <p className="viewer-info-header">Cursor Stats</p>
                <ReactUtil.Col2
                    className="viewer-cursorPanel-top-ctr"
                    left={cursorInfo}
                    right={hoveredSeg}
                    separator={true}
                    separatorWidth={1} />
                <div className="viewer-cursorPanel-sel-ctr">
                    <span>Selected: </span>
                    <span>selected</span>
                </div>
                <p className="viewer-cursorPanel-bottom">Shift + click: Select amplifier region</p>
                <p className="viewer-cursorPanel-bottom">Shift + dbl click: Select entire amp</p>
                <input
                    className="viewer-cursorPanel-execButton"
                    type="button"
                    value="Execute command over selected region"/>
            </div>
        );
    }
}
