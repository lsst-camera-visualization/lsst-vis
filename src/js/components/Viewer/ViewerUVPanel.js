import React from "react";

export default class ViewerUVPanel extends React.Component {
    render() {
        return (
            <div className="viewer-info-panel viewer-uvPanel">
                <p className="viewer-info-header">Update Viewer Settings</p>
                <input className="button" type="button" value="Resume"/>
                <input className="button" type="button" value="There are no new images"/>
            </div>
        );
    }
}
