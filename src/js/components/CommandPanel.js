import React from "react";
import Draggable from "react-draggable";
import { ReactUtil } from "../util/react";
import commandDispatcher from "../commands/commandDispatcher";

import CommandPanelCommands from "./CommandPanel/CommandPanelCommands";
import CommandPanelParameters from "./CommandPanel/CommandPanelParameters";

export default class CommandPanel extends React.Component {
    constructor() {
        super();

        this.state = {
            selected: "average_pixel"
        }
        this.parameters = {};
    }

    handleClick = e => {
        this.setState({
            selected: e.target.value
        });
        this.parameters = {};
    }

    handleExecute = e => {
        const command = this.state.selected;
        let params = Object.assign({...this.parameters}, {});
        params.viewer_id = this.props.viewerID;
        params.region = "rect 1000 1000 3000 3000".match(/\S+/g);
        commandDispatcher.dispatch(command, params);

        this.props.close();
    }

    handleCancel = e => {
        this.props.close();
    }

    setParam = (parameter, value) => {
        this.parameters[parameter] = value;
    }

    render() {
        const style = {
            display: (this.props.hide) ? "none" : ""
        };

        const commands = this.props.commands.commands;

        const commandsContainer =
            <CommandPanelCommands
                commands={commands}
                selected={this.state.selected}
                onClick={this.handleClick} />;

        const selectedCommand = commands[this.state.selected];
        const selectedParams = (selectedCommand) ? selectedCommand.params : [];
        const parametersContainer =
            <CommandPanelParameters
                parameters={selectedParams}
                setParam={this.setParam} />;

        return (
            <Draggable
                handle=".cmdpanel-title">
                <div className="cmdpanel-ctr" style={style}>
                    <p className="cmdpanel-title">Command Panel</p>
                    <ReactUtil.Col2
                        className="cmdpanel-body"
                        width={"25%"}
                        left={commandsContainer}
                        right={parametersContainer}
                        separator={true} />
                    <div className="cmdpanel-execute-ctr">
                        <input
                            className="cmdpanel-button cmdpanel-execute"
                            type="button"
                            value="Execute command"
                            onClick={this.handleExecute} />
                        <input
                            className="cmdpanel-button cmdpanel-cancel"
                            type="button"
                            value="Cancel"
                            onClick={this.handleCancel} />
                    </div>
                </div>
            </Draggable>
        );
    }
}
