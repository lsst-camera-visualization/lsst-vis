import React from "react";

export default class ViewerUVPanel extends React.Component {
    constructor() {
        super();

        this.state = {
            "paused": true
        }
    }

    // Pause/Resume button
    handlePRClick = e => {
        if (e.target.value === "Pause") {
            this.props.onPause();
            this.setState({paused: true});
        }
        else { // Resume
            this.props.onResume();
            this.setState({paused: false});
        }
    }

    render() {
        return (
            <div className="viewer-info-panel viewer-uvPanel">
                <p className="viewer-info-header">Update Viewer Settings</p>
                <input
                    className="button"
                    type="button"
                    value={this.state.paused ? "Resume" : "Pause"}
                    onClick={this.handlePRClick} />
                <input className="button" type="button" value="There are no new images"/>
            </div>
        );
    }
}
