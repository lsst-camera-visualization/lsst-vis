import { connect } from "react-redux"
import App from "../components/App";

const mapStateToProps = (state) => {
    return {
        boxes: state.boxes
    };
}

export const AppCtr = connect(
    mapStateToProps
)(App);
