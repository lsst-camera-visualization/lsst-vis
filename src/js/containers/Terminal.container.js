import { connect } from "react-redux";
import { executeCommand, addCommandToHistory, addErrorToHistory }
    from "../actions/terminal.actions";
import Terminal from "../components/Terminal";

const mapStateToProps = state => {
    return {
        boxes: state.boxes,
        viewers: state.viewers,
        terminal: state.terminal,
        commands: state.commands,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        // Handler for executing a command
        onExecute: input => {
            dispatch(addCommandToHistory(input));
        },

        // Displays an error message for invalid commands
        displayInvalidCommandMessage: () => {
            dispatch(addErrorToHistory("Invalid command entered!"));
        }
    }
}

const TerminalCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(Terminal);

export default TerminalCtr;
