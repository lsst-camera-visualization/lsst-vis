import { connect } from "react-redux"
import Viewer from "../components/Viewer";
import { openCommandPanel } from "../actions/commandPanel.actions";

const mapStateToProps = state => {
    return {
        viewers: state.viewers
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onExecuteOverSelected: id => {
            dispatch(openCommandPanel(id));
        }
    }
}

const ViewerCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(Viewer);

export default ViewerCtr;
