import React from "react";

export default class CommandPanelCommands extends React.Component {
    // Creates all of the command buttons
    createCommandButtons = commands => {
        // The generator function for creating a single command button
        const buttonGen = (command, index) => {
            const sel = (command === this.props.selected) ? "cmdpanel-button-selected" : "";
            return (<input
                className={"cmdpanel-button " + sel}
                key={index}
                type="button"
                value={command}
                onClick={this.props.onClick} />);
        };

        return <ul className="cmdpanel-commands-ctr">{commands.map(buttonGen)}</ul>
    }

    render() {
        // All commands
        const commands = this.props.commands;
        // Commands which have a region parameter
        let regionCommands = [];

        // Add all of the commands which use a region parameter
        for (const command in commands) {
            if (commands.hasOwnProperty(command)) {
                if (commands[command].params.indexOf("region") !== -1)
                    regionCommands.push(command);
            }
        }

        // Creates all of the command buttons
        return this.createCommandButtons(regionCommands);
    }
}
