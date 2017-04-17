import React from "react";

import { ReactUtil } from "../../util/react";

export default class ViewerCursorPanel extends React.Component {
    render() {
        // Pretty print of the coordinates
        const coords = "(" + this.props.cursorPoint.x + ", " + this.props.cursorPoint.y + ")";

        return (
            <div className="viewer-info-panel viewer-cursorPanel">
                <p className="viewer-info-header">Cursor Stats</p>
                <ReactUtil.LVPair
                    label="Image Coordinates"
                    value={coords}
                    labelClass="viewer-info-label" />
                <ReactUtil.LVPair
                    label="Pixel Value"
                    value={this.props.pixelValue}
                    labelClass="viewer-info-label" />
                <ReactUtil.LVPair
                    label="Hovered Segment"
                    value={this.props.hoveredAmpName}
                    labelClass="viewer-info-label" />
            </div>
        );
    }
}
