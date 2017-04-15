import React from "react";

import { ReactUtil } from "../../util/react";

export default class ViewerCursorPanel extends React.Component {
    render() {
        const coords = "(" + this.props.cursorPoint.x + ", " + this.props.cursorPoint.y + ")";

        return (
            <div className="viewer-info-panel viewer-cursorPanel">
                <p className="viewer-info-header">Cursor Stats</p>
                <span>Image Coordinates: </span>
                <span>{coords}</span>
                <br/>
                <span>Pixel Value: </span>
                <span>{this.props.pixelValue}</span>
                <br/>
                <span>Hovered Segment: </span>
                <span>{this.props.hoveredAmpName}</span>
                <br/>
            </div>
        );
    }
}
