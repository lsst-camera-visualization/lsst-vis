import React from "react";
import commandDispatcher from "../../commands/commandDispatcher.js";
import store from "../../store.js";

export default class ViewerUVPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            paused: true,
            viewerID: this.props.viewerID,
        }
    }

    // Pause/Resume button
    handlePRClick = e => {
        const updatePause = !(this.state.paused);
        const commandName = this.state.paused ? "uv_resume" : "uv_pause";
        const params = {viewer_id: this.state.viewerID};
        commandDispatcher.dispatch(commandName, params);
        this.setState({paused: updatePause});
    }

    render() {

        const buttonName = this.state.paused ? ("play_arrow") : ("pause");

        const buttonPauseResume = (
            <i className="material-icons md-36 md-light"
                onClick={this.handlePRClick}>
            {buttonName}
            </i>
        );

        const interval = store.getState().uvControllers[this.state.viewerID]._interval;

        const pausedStatus = this.state.paused ? "(paused)" : "(resumed)";
        const textStatus = (
            <a className="viewer-uvPanel-status"
                >
            {"Time interval: " + interval +  "ms " + pausedStatus}
            </a>
        );

        return (
            <div className="viewer-info-panel viewer-uvPanel">
                <p className="viewer-info-header">Update Viewer Settings</p>
                {buttonPauseResume}
                {textStatus}
            </div>
        );
    }
}
