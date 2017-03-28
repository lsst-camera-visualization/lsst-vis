import { connect } from "react-redux"
import Viewer from "../components/Viewer";

const mapStateToProps = state => {
    return {
        viewers: state.viewers
    };
}

const ViewerCtr = connect(
    mapStateToProps
)(Viewer);

export default ViewerCtr;
