import { connect } from "react-redux";
import { executeCommand } from "../actions/command.actions";
import Terminal from "../components/Terminal";
import { Util } from "../util/Util";

const mapStateToProps = (state) => {
    return {
        terminalHistory: state.terminalHistory
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        onExecute: (input) => {
            const groups = Util.SplitStringByGroup(input);
            const command = groups.shift();

            dispatch(executeCommand({ command, params: groups, plainInput: input }));
        }
    }
}

export const TerminalCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(Terminal);
