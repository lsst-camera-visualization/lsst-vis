import { connect } from "react-redux"
import Histogram from "../components/Histogram";
import { deleteHistogram } from "../actions/histogram.actions";

const mapStateToProps = state => {
    return {
        histograms: state.histograms
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onClose: id => {
            dispatch(deleteHistogram(id));
        }
    }
}

const HistogramCtr = connect(
    mapStateToProps,
    mapDispatchToProps
)(Histogram);

export default HistogramCtr;
