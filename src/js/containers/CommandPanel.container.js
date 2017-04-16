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
