import { connect } from "react-redux";
import { executeCommand, addCommandToHistory } from "../actions/command.actions";
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
        }
    }
}

const TerminalCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(Terminal);

export default TerminalCtr;
