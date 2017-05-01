import { connect } from "react-redux"
import Viewer from "../components/Viewer";
import { openCommandPanel } from "../actions/commandPanel.actions";
import { pauseUV, resumeUV } from "../actions/uv.actions";

const mapStateToProps = state => {
    return {
        viewers: state.viewers
    };
}

const mapDispatchToProps = dispatch => {
    return {
        // On click handler for the "execute command over selected" button
        onExecuteOverSelected: id => {
            dispatch(openCommandPanel(id));
        },

        onUVPause: id => {
            dispatch(pauseUV(id));
        },

        onUVResume: id => {
            dispatch(resumeUV(id));
        }
    }
}

const ViewerCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(Viewer);

export default ViewerCtr;
