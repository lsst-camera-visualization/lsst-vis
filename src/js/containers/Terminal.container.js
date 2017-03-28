import { connect } from "react-redux";
import { executeCommand, addCommandToHistory } from "../actions/command.actions";
import Terminal from "../components/Terminal";
import { Util } from "../util/Util";

const mapStateToProps = state => {
    return {
        boxes: state.boxes,
        viewers: state.viewers,
        terminal: state.terminal,
        commands: state.commands,
        commandDispatcher: state.commandDispatcher
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
