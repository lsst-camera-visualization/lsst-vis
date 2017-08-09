import React from "react";
import commandDispatcher from "../../commands/commandDispatcher.js";

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

        return (
            <div className="viewer-info-panel viewer-uvPanel">
                <p className="viewer-info-header">Update Viewer Settings</p>
                {buttonPauseResume}
                <input className="button" type="button" value="There are no new images"/>
            </div>
        );
    }
}
