import { connect } from "react-redux"
import Viewer from "../components/Viewer";
import { selectRegion } from "../actions/viewer.actions";
import { openCommandPanel } from "../actions/commandPanel.actions";

const mapStateToProps = state => {
    return {
        viewers: state.viewers
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onSelectRegion: (id, region) => {
            dispatch(selectRegion(id, region));
        },

        // On click handler for the "execute command over selected" button
        onExecuteOverSelected: (id, region) => {
            dispatch(openCommandPanel(id, region));
        }
    }
}

const ViewerCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(Viewer);

export default ViewerCtr;
