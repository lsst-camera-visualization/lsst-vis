import { connect } from "react-redux"
import Box from "../components/Box";

const mapStateToProps = state => {
    return {
        boxes: state.boxes
    };
}

const BoxCtr = connect(
    mapStateToProps
)(Box);

export default BoxCtr;
