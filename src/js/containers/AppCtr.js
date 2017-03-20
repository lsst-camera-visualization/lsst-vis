import { connect } from "react-redux"
import App from "../components/App";

const mapStateToProps = (state) => {
    return {
        boxes: state.boxes,
        viewers: state.viewers
    };
}

export const AppCtr = connect(
    mapStateToProps
)(App);
