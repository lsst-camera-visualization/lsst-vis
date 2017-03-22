import React from "react";

import { ReactUtil } from "../../util/Util";

export default class ViewerCursorPanel extends React.Component {
    render() {
        const hovered = (
            <div className="viewer-cursorPanel-col">
                <p>(x,y)</p>
                <p>name</p>
            </div>
        );

        const selected = (
            <div className="viewer-cursorPanel-col">
                <p>Selected:</p>
                <p>selected</p>
            </div>
        );

        return (
            <div className="viewer-info-panel viewer-cursorPanel">
                <p className="viewer-info-header">Cursor Stats</p>
                <ReactUtil.Col2 className="viewer-cursorPanel-top-ctr" left={hovered} right={selected} separator={true} />
                <p className="viewer-cursorPanel-bottom">Shift + click: Select amplifier region</p>
                <p className="viewer-cursorPanel-bottom">Shift + dbl click: Select entire amp</p>
                <input className="viewer-cursorPanel-execButton" type="button" value="Execute command over selected region"/> 
            </div>
        );
    }
}
