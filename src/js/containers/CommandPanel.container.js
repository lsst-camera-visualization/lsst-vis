import { connect } from "react-redux"
import CommandPanel from "../components/CommandPanel";
import { closeCommandPanel } from "../actions/commandPanel.actions";

const mapStateToProps = state => {
    return {
        commands: state.commands,
        viewers: state.viewers
    };
}

const mapDispatchToProps = dispatch => {
    return {
        // On click handler for closing the command panel
        close: () => {
            dispatch(closeCommandPanel());
        }
    }
}

const CommandPanelCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(CommandPanel);

export default CommandPanelCtr;
