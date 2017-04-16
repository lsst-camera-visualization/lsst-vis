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
        onExecute: input => {
            dispatch(addCommandToHistory(input));
        },

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
