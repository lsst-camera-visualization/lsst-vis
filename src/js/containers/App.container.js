import { connect } from "react-redux"
import App from "../components/App";

const mapStateToProps = state => {
    return {
        boxes: state.boxes,
        viewers: state.viewers,
        histograms: state.histograms,
        commandPanel: state.commandPanel
    };
}

const AppCtr = connect(
    mapStateToProps
)(App);

export default AppCtr;
