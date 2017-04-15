import { connect } from "react-redux"
import Histogram from "../components/Histogram";

const mapStateToProps = state => {
    return {
        histograms: state.histograms
    };
}

const HistogramCtr = connect(
    mapStateToProps
)(Histogram);

export default HistogramCtr;
